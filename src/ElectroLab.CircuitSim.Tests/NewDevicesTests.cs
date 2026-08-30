using ElectroLab.CircuitSim;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Tests;

public class NewDevicesTests
{
    private readonly CircuitSimulator _sim = new();

    [Fact]
    public void Battery_WithEsr_DropsUnderLoad()
    {
        // 10V battery, 1 ohm esr, 9 ohm load → Thevenin divider: Vp = 10 * 9/(9+1) = 9V, I = 1A.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 10), ("esr", 1))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 9)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(9.0, result.DcOp!.NodeVoltages["n1"], 3);
        Assert.Equal(1.0, result.DcOp.BranchCurrents["V1"], 3);
    }

    [Fact]
    public void Battery_WithoutEsr_BehavesAsIdealSource()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 10))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 100)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(10.0, result.DcOp!.NodeVoltages["n1"], 3);
    }

    [Fact]
    public void OpAmp_UnityGainBuffer_TracksInput()
    {
        // inp driven to 3V, inn tied to out (voltage follower). Finite gain still ~ideal.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 3))),
                El("U1", "op_amp", Pins(("inp", "n1"), ("inn", "out"), ("out", "out")), P(("gain", 1e5))),
                El("RL", "resistor", Pins(("a", "out"), ("b", "gnd")), P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(3.0, result.DcOp!.NodeVoltages["out"], 3);
    }

    [Fact]
    public void OpAmp_InvertingAmp_MatchesFiniteGainFormula()
    {
        // Inverting amp: Rin=1k from Vin to inn, Rf=10k feedback from out to inn, inp grounded.
        // Ideal gain = -Rf/Rin = -10. Finite gain (1e5) should be very close to ideal.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 1))),
                El("RIN", "resistor", Pins(("a", "n1"), ("b", "ninn")), P(("r", 1000))),
                El("RF", "resistor", Pins(("a", "ninn"), ("b", "out")), P(("r", 10000))),
                El("U1", "op_amp", Pins(("inp", "gnd"), ("inn", "ninn"), ("out", "out")), P(("gain", 1e5))),
                El("RL", "resistor", Pins(("a", "out"), ("b", "gnd")), P(("r", 100000)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(-10.0, result.DcOp!.NodeVoltages["out"], 2);
    }

    [Fact]
    public void BjtSwitch_PassesCurrent_WhenBaseDriven()
    {
        // Base driven through Rb by 5V, vf=0.7 → base-emitter turns on, closing collector-emitter.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VB", "battery", Pins(("p", "nb"), ("n", "gnd")), P(("v", 5))),
                El("VC", "battery", Pins(("p", "nc"), ("n", "gnd")), P(("v", 10))),
                El("RC", "resistor", Pins(("a", "nc"), ("b", "c")), P(("r", 100))),
                El("Q1", "bjt_npn", Pins(("c", "c"), ("b", "nb"), ("e", "gnd")), P(("vf", 0.7), ("rb", 1000), ("ron", 10)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        // BJT is on: collector node should be pulled low (Ron=10 vs RC=100 divider ~ 10*10/110≈0.9V), current flows.
        Assert.True(result.DcOp!.BranchCurrents["Q1"] > 0.05, $"Ic={result.DcOp.BranchCurrents["Q1"]} should be > 0.05A when on");
        Assert.True(result.DcOp.NodeVoltages["c"] < 2.0, $"Vc={result.DcOp.NodeVoltages["c"]} should be pulled low when on");
    }

    [Fact]
    public void BjtSwitch_BlocksCurrent_WhenBaseUndriven()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VC", "battery", Pins(("p", "nc"), ("n", "gnd")), P(("v", 10))),
                El("RC", "resistor", Pins(("a", "nc"), ("b", "c")), P(("r", 100))),
                El("RB", "resistor", Pins(("a", "nb"), ("b", "gnd")), P(("r", 1000))),
                El("Q1", "bjt_npn", Pins(("c", "c"), ("b", "nb"), ("e", "gnd")), P(("vf", 0.7), ("rb", 1000), ("ron", 10)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["Q1"]) < 1e-6);
        Assert.Equal(10.0, result.DcOp.NodeVoltages["c"], 2);
    }

    [Fact]
    public void AcAnalysis_RcLowPass_MagnitudeAtCutoff()
    {
        // R=1k, C=159.155nF → fc = 1/(2*pi*R*C) ≈ 1000 Hz. At fc, |Vout/Vin| = 1/sqrt(2).
        var r = 1000.0;
        var c = 1.0 / (2 * Math.PI * r * 1000.0);
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("AC1", "ac_source", Pins(("p", "n1"), ("n", "gnd")), P(("mag", 1.0), ("phase", 0))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", r))),
                El("C1", "capacitor", Pins(("a", "n2"), ("b", "gnd")), P(("c", c)))
            ]
        };

        var result = _sim.Simulate(circuit, "ac", new AnalysisOptions { Freq = 1000 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.NotNull(result.Ac);
        var point = Assert.Single(result.Ac!.Points);
        Assert.Equal(1000, point.Frequency, 3);
        var mag = point.NodeVoltages["n2"].Mag;
        Assert.Equal(1.0 / Math.Sqrt(2), mag, 3);
    }

    [Fact]
    public void AcAnalysis_RcLowPass_MagnitudeIsSmallAtHighFrequency()
    {
        var r = 1000.0;
        var c = 1.0 / (2 * Math.PI * r * 1000.0);
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("AC1", "ac_source", Pins(("p", "n1"), ("n", "gnd")), P(("mag", 1.0), ("phase", 0))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", r))),
                El("C1", "capacitor", Pins(("a", "n2"), ("b", "gnd")), P(("c", c)))
            ]
        };

        var result = _sim.Simulate(circuit, "ac", new AnalysisOptions { Freq = 100_000 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        var mag = result.Ac!.Points[0].NodeVoltages["n2"].Mag;
        Assert.True(mag < 0.02, $"mag={mag} should be strongly attenuated well above cutoff");
    }

    [Fact]
    public void AcAnalysis_FrequencySweep_ProducesMultiplePoints()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("AC1", "ac_source", Pins(("p", "n1"), ("n", "gnd")), P(("mag", 1.0), ("phase", 0))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 1000))),
                El("C1", "capacitor", Pins(("a", "n2"), ("b", "gnd")), P(("c", 1e-7)))
            ]
        };

        var result = _sim.Simulate(circuit, "ac", new AnalysisOptions { FStart = 10, FStop = 100_000, PointsPerDecade = 5 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.NotNull(result.Ac);
        Assert.True(result.Ac!.Points.Count > 1, "sweep should produce multiple frequency points");
        Assert.Equal(10, result.Ac.Points[0].Frequency, 3);
        Assert.Equal(100_000, result.Ac.Points[^1].Frequency, 1);
    }

    [Fact]
    public void Ammeter_ReportsSeriesCurrent()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("AM1", "ammeter", Pins(("a", "n1"), ("b", "n2")), P(("r", 0.01))),
                El("R1", "resistor", Pins(("a", "n2"), ("b", "gnd")), P(("r", 100)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(0.05, result.DcOp!.BranchCurrents["AM1"], 4);
    }

    [Fact]
    public void AcAnalysis_NonlinearDevice_ProducesWarning()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 220))),
                El("D1", "led", Pins(("a", "n2"), ("c", "gnd")), P(("vf", 2.0), ("ron", 20)))
            ]
        };

        var result = _sim.Simulate(circuit, "ac", new AnalysisOptions { Freq = 1000 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Contains(result.Warnings, w => w.Contains("D1") && w.Contains("nonlinear"));
    }

    private static ElementInstance El(
        string id,
        string model,
        Dictionary<string, string> pins,
        Dictionary<string, double> pars,
        Dictionary<string, bool>? boolParams = null)
        => new()
        {
            Id = id,
            Model = model,
            Pins = pins,
            Params = pars,
            BoolParams = boolParams
        };

    private static Dictionary<string, string> Pins(params (string k, string v)[] items)
        => items.ToDictionary(i => i.k, i => i.v);

    private static Dictionary<string, double> P(params (string k, double v)[] items)
        => items.ToDictionary(i => i.k, i => i.v);
}
