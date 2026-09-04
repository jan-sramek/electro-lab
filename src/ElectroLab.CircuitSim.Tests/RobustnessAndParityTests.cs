using ElectroLab.CircuitSim;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Netlist;
using ElectroLab.CircuitSim.Results;
using ElectroLab.CircuitSim.Validation;

namespace ElectroLab.CircuitSim.Tests;

/// <summary>
/// Input hardening (limits, malformed pins/params), AC/tran work caps, and physics regressions
/// (zener initFromDc parity with dcOp, inductor series-loop current sign).
/// </summary>
public class RobustnessAndParityTests
{
    private readonly CircuitSimulator _sim = new();

    // ---------------------------------------------------------------- validation hardening

    [Fact]
    public void NullPinValue_IsValidationError_NotException()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", new Dictionary<string, string> { ["a"] = "n1", ["b"] = null! }, P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.False(result.Ok);
        Assert.Contains(result.Errors, e => e.Contains("R1") && e.Contains("'b'"));
    }

    [Fact]
    public void WhitespacePinValue_IsValidationError()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "  ")), P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit, "tran", new AnalysisOptions { TStop = 1e-3, Dt = 1e-4 });
        Assert.False(result.Ok);
        Assert.Contains(result.Errors, e => e.Contains("R1") && e.Contains("'b'"));
    }

    [Theory]
    [InlineData(double.NaN)]
    [InlineData(double.PositiveInfinity)]
    [InlineData(double.NegativeInfinity)]
    public void NonFiniteParam_IsRejected(double bad)
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", bad)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.False(result.Ok);
        Assert.Contains(result.Errors, e => e.Contains("R1") && e.Contains("params.r") && e.Contains("finite"));
    }

    [Fact]
    public void TooManyElements_IsRejected()
    {
        var elements = new List<ElementInstance>
        {
            El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5)))
        };
        for (var i = 0; i < NetlistValidator.MaxElements; i++)
            elements.Add(El($"R{i}", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 1000))));

        var result = _sim.Simulate(new Circuit { Ground = "gnd", Elements = elements });
        Assert.False(result.Ok);
        Assert.Contains(result.Errors, e => e.Contains($"limit is {NetlistValidator.MaxElements}"));
    }

    [Fact]
    public void ExactlyMaxElements_IsAccepted()
    {
        var elements = new List<ElementInstance>
        {
            El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5)))
        };
        for (var i = 0; i < NetlistValidator.MaxElements - 1; i++)
            elements.Add(El($"R{i}", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 1000))));

        var result = _sim.Simulate(new Circuit { Ground = "gnd", Elements = elements });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
    }

    [Fact]
    public void TooManyNodes_IsRejected()
    {
        // 3 fresh nodes per potentiometer; 201 pots → 603 nodes (+gnd) with only 202 elements.
        var elements = new List<ElementInstance>
        {
            El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5)))
        };
        var pots = NetlistValidator.MaxNodes / 3 + 1;
        for (var i = 0; i < pots; i++)
            elements.Add(El($"P{i}", "potentiometer", Pins(("a", $"pa{i}"), ("w", $"pw{i}"), ("b", $"pb{i}")), P(("r", 1000), ("pos", 0.5))));

        var result = _sim.Simulate(new Circuit { Ground = "gnd", Elements = elements });
        Assert.False(result.Ok);
        Assert.Contains(result.Errors, e => e.Contains($"limit is {NetlistValidator.MaxNodes}"));
    }

    [Fact]
    public void InternalNodes_AreIdentifiable()
    {
        Assert.True(NetlistValidator.IsInternalNode("b1__mid"));
        Assert.True(NetlistValidator.IsInternalNode("U1__idle"));
        Assert.False(NetlistValidator.IsInternalNode("n_1"));
        Assert.False(NetlistValidator.IsInternalNode("gnd"));
    }

    [Fact]
    public void NonFiniteResult_IsDetected()
    {
        var bad = new SimulationResult
        {
            Ok = true,
            AnalysisType = "dcOp",
            DcOp = new DcOpResult
            {
                NodeVoltages = new Dictionary<string, double> { ["n1"] = double.NaN },
                BranchCurrents = new Dictionary<string, double>()
            }
        };
        Assert.True(bad.HasNonFiniteValues());

        var good = _sim.Simulate(RcDivider());
        Assert.True(good.Ok);
        Assert.False(good.HasNonFiniteValues());
    }

    // ---------------------------------------------------------------- work caps

    [Fact]
    public void AcSweep_OverTotalPointCap_IsRejected_NotTruncatedToTwoPoints()
    {
        // ~300 decades × 200 ppd ≈ 60 000 points; before the cap this overflowed int and returned 2 points with ok:true.
        var result = _sim.Simulate(RcDivider(), "ac", new AnalysisOptions
        {
            FStart = 1e-150,
            FStop = 1e150,
            PointsPerDecade = AcAnalysis.MaxPointsPerDecade
        });

        Assert.False(result.Ok);
        Assert.Null(result.Ac);
        Assert.Contains(result.Errors, e => e.Contains($"limit is {AcAnalysis.MaxTotalPoints}"));
    }

    [Fact]
    public void AcSweep_HugeDecadeRange_IsRejected()
    {
        // decades × ppd far beyond int.MaxValue — must not wrap around.
        var result = _sim.Simulate(RcDivider(), "ac", new AnalysisOptions
        {
            FStart = 1e-300,
            FStop = 1e300,
            PointsPerDecade = 100
        });

        Assert.False(result.Ok);
        Assert.Contains(result.Errors, e => e.Contains("limit"));
    }

    [Fact]
    public void AcSweep_OverPointsPerDecadeCap_IsRejected()
    {
        var result = _sim.Simulate(RcDivider(), "ac", new AnalysisOptions
        {
            FStart = 10,
            FStop = 100,
            PointsPerDecade = AcAnalysis.MaxPointsPerDecade + 1
        });

        Assert.False(result.Ok);
        Assert.Contains(result.Errors, e => e.Contains("pointsPerDecade"));
    }

    [Fact]
    public void AcSweep_WithinCaps_Runs()
    {
        var result = _sim.Simulate(RcDivider(), "ac", new AnalysisOptions
        {
            FStart = 10,
            FStop = 1e5,
            PointsPerDecade = 50
        });

        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(201, result.Ac!.Points.Count);
    }

    [Fact]
    public void Tran_OverStepCap_IsRejected()
    {
        var result = _sim.Simulate(RcDivider(), "tran", new AnalysisOptions { TStop = 1, Dt = 1e-6 });
        Assert.False(result.Ok);
        Assert.Contains(result.Errors, e => e.Contains($"{TransientAnalysis.MaxSteps}"));
    }

    // ---------------------------------------------------------------- zener seed parity (bug 6)

    [Theory]
    [InlineData(5.0)]   // below breakdown: zener off, cap charges to the supply
    [InlineData(12.0)]  // above breakdown: zener regulates, cap sits at ≈Vz
    public void InitFromDc_ZenerParallelCap_SeedMatchesDcOp(double supply)
    {
        // supply → 1 kΩ → n2; zener reverse-biased (cathode at n2, anode at gnd) ∥ capacitor to gnd.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", supply))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 1000))),
                El("Z1", "zener", Pins(("a", "gnd"), ("c", "n2")), P(("vf", 0.7), ("vz", 10), ("ron", 5))),
                El("C1", "capacitor", Pins(("a", "n2"), ("b", "gnd")), P(("c", 1e-6)))
            ]
        };

        var dc = _sim.Simulate(circuit);
        Assert.True(dc.Ok, string.Join("; ", dc.Errors));
        var vDc = dc.DcOp!.NodeVoltages["n2"];
        Assert.InRange(vDc, Math.Min(supply, 10) - 0.2, Math.Min(supply, 10) + 0.2);

        var tran = _sim.Simulate(circuit, "tran", new AnalysisOptions { TStop = 1e-4, Dt = 1e-6, InitFromDc = true });
        Assert.True(tran.Ok, string.Join("; ", tran.Errors));
        var v0 = tran.Tran!.NodeVoltages.First(s => s.Id == "n2").Values[0];

        // First sample is one BE step from the seed; with C·R ≫ dt it must sit on the DC value,
        // not at the "reverse-on" initial hint the seed loop used to leave unrevised.
        Assert.InRange(v0, vDc - 0.05, vDc + 0.05);
    }

    [Fact]
    public void InitFromDc_VregParallelCap_SeedMatchesDcOp()
    {
        // 3 V input is below vOut+dropout, so the 7805 must drop out of regulation in both dcOp and the seed.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "vin"), ("n", "gnd")), P(("v", 3))),
                El("U1", "vreg_7805", Pins(("in", "vin"), ("gnd", "gnd"), ("out", "vout")), P()),
                El("RL", "resistor", Pins(("a", "vout"), ("b", "gnd")), P(("r", 1000))),
                El("C1", "capacitor", Pins(("a", "vout"), ("b", "gnd")), P(("c", 1e-6)))
            ]
        };

        var dc = _sim.Simulate(circuit);
        Assert.True(dc.Ok, string.Join("; ", dc.Errors));
        var vDc = dc.DcOp!.NodeVoltages["vout"];
        Assert.True(vDc < 3.01, $"expected pass-through below 3 V, got {vDc}");

        var tran = _sim.Simulate(circuit, "tran", new AnalysisOptions { TStop = 1e-4, Dt = 1e-6, InitFromDc = true });
        Assert.True(tran.Ok, string.Join("; ", tran.Errors));
        var v0 = tran.Tran!.NodeVoltages.First(s => s.Id == "vout").Values[0];
        Assert.InRange(v0, vDc - 0.05, vDc + 0.05);
    }

    // ---------------------------------------------------------------- inductor sign (bug 8)

    [Fact]
    public void DcInductorCurrent_FollowsPinOrientation()
    {
        // battery 5 V → R 10 MΩ (n1→n2) → L → gnd. Loop current 0.5 µA flows n2 → gnd through L.
        // Below 1 µA the ideal-short inductor's own ΔV·G reading is discarded and the series-loop
        // neighbour estimate is used, which is the code path under test.
        var lGndToN2 = SeriesRL(indA: "gnd", indB: "n2");
        var lN2ToGnd = SeriesRL(indA: "n2", indB: "gnd");

        var r1 = _sim.Simulate(lGndToN2);
        var r2 = _sim.Simulate(lN2ToGnd);
        Assert.True(r1.Ok, string.Join("; ", r1.Errors));
        Assert.True(r2.Ok, string.Join("; ", r2.Errors));

        var i1 = r1.DcOp!.BranchCurrents["L1"];
        var i2 = r2.DcOp!.BranchCurrents["L1"];

        // a=gnd, b=n2: current enters at b → a→b is negative. a=n2, b=gnd: positive.
        Assert.Equal(-5e-7, i1, 10);
        Assert.Equal(+5e-7, i2, 10);
        Assert.Equal(5e-7, r1.DcOp.BranchCurrents["R1"], 10);
    }

    [Fact]
    public void InitFromDc_InductorSeed_FollowsPinOrientation()
    {
        var r1 = _sim.Simulate(SeriesRL("gnd", "n2"), "tran", new AnalysisOptions { TStop = 1e-4, Dt = 1e-6, InitFromDc = true });
        var r2 = _sim.Simulate(SeriesRL("n2", "gnd"), "tran", new AnalysisOptions { TStop = 1e-4, Dt = 1e-6, InitFromDc = true });
        Assert.True(r1.Ok, string.Join("; ", r1.Errors));
        Assert.True(r2.Ok, string.Join("; ", r2.Errors));

        var i1 = r1.Tran!.BranchCurrents.First(s => s.Id == "L1").Values[0];
        var i2 = r2.Tran!.BranchCurrents.First(s => s.Id == "L1").Values[0];
        var iR = r1.Tran.BranchCurrents.First(s => s.Id == "R1").Values[0];

        // Seeded at the DC loop current (steady state is a fixed point of the BE step).
        // A wrong-signed seed would leave a visible residual on the first sample.
        Assert.Equal(-5e-7, i1, 9);
        Assert.Equal(+5e-7, i2, 9);
        Assert.Equal(5e-7, iR, 9);
        var iRLast = r1.Tran.BranchCurrents.First(s => s.Id == "R1").Values[^1];
        Assert.Equal(5e-7, iRLast, 9);
    }

    [Fact]
    public void DcInductorCurrent_FromBatteryNeighbour_FollowsPinOrientation()
    {
        // L directly on the battery's positive side: battery p=n1 → L (n1→n2) → R 10 MΩ → gnd.
        // The battery reports delivered current (+0.5 µA), which flows n→p inside it.
        Circuit Build(string a, string b) => new()
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("L1", "inductor", Pins(("a", a), ("b", b)), P(("l", 1))),
                El("R1", "resistor", Pins(("a", "n2"), ("b", "gnd")), P(("r", 1e7)))
            ]
        };

        var fwd = _sim.Simulate(Build("n1", "n2"));
        var rev = _sim.Simulate(Build("n2", "n1"));
        Assert.True(fwd.Ok && rev.Ok);
        Assert.Equal(+5e-7, fwd.DcOp!.BranchCurrents["L1"], 10);
        Assert.Equal(-5e-7, rev.DcOp!.BranchCurrents["L1"], 10);
    }

    // ---------------------------------------------------------------- helpers

    private static Circuit SeriesRL(string indA, string indB) => new()
    {
        Ground = "gnd",
        Elements =
        [
            El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
            El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 1e7))),
            El("L1", "inductor", Pins(("a", indA), ("b", indB)), P(("l", 1)))
        ]
    };

    private static Circuit RcDivider() => new()
    {
        Ground = "gnd",
        Elements =
        [
            El("V1", "ac_source", Pins(("p", "n1"), ("n", "gnd")), P(("mag", 1), ("phase", 0))),
            El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 1000))),
            El("C1", "capacitor", Pins(("a", "n2"), ("b", "gnd")), P(("c", 1e-7)))
        ]
    };

    private static ElementInstance El(string id, string model, Dictionary<string, string> pins, Dictionary<string, double> pars) =>
        new() { Id = id, Model = model, Pins = pins, Params = pars };

    private static Dictionary<string, string> Pins(params (string pin, string node)[] pins) =>
        pins.ToDictionary(p => p.pin, p => p.node);

    private static Dictionary<string, double> P(params (string key, double value)[] pars) =>
        pars.ToDictionary(p => p.key, p => p.value);
}
