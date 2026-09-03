using ElectroLab.CircuitSim;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Netlist;
using Xunit;

public class LedFadeProbe
{
    [Fact]
    public void CapacitorIc_OpenSwitch_LedFadesOverHundredsOfMs()
    {
        var sim = new CircuitSimulator();
        // Pre-charged C, switch open: discharge through R → LED only.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                new()
                {
                    Id = "V1",
                    Model = "battery",
                    Pins = new Dictionary<string, string> { ["p"] = "n1", ["n"] = "gnd" },
                    Params = new Dictionary<string, double> { ["v"] = 5 }
                },
                new()
                {
                    Id = "S1",
                    Model = "switch",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "n2" },
                    Params = new Dictionary<string, double>(),
                    BoolParams = new Dictionary<string, bool> { ["closed"] = false }
                },
                new()
                {
                    Id = "C1",
                    Model = "capacitor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["c"] = 0.0022, ["ic"] = 5.0 }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "n3" },
                    Params = new Dictionary<string, double> { ["r"] = 220 }
                },
                new()
                {
                    Id = "D1",
                    Model = "led",
                    Pins = new Dictionary<string, string> { ["a"] = "n3", ["c"] = "gnd" },
                    Params = new Dictionary<string, double> { ["vf"] = 2, ["ron"] = 20 }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 3.0, Dt = 0.002 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iD = result.Tran!.BranchCurrents.First(s => s.Id == "D1").Values;
        var times = result.Tran.Time;

        var i0 = AbsNear(times, iD, 0.0);
        var i0_3 = AbsNear(times, iD, 0.3);
        var i1_0 = AbsNear(times, iD, 1.0);
        var iEnd = AbsNear(times, iD, 2.9);

        Assert.True(i0 > 0.008, $"t=0 should glow from IC, I={i0}");
        Assert.True(i0_3 > 0.003, $"0.3s should still glow, I={i0_3}");
        Assert.True(i0_3 < i0, $"should be fading, 0={i0} 0.3={i0_3}");
        Assert.True(i1_0 < i0_3, $"should keep fading, 0.3={i0_3} 1={i1_0}");
        Assert.True(iEnd < 1e-3, $"end should be dark, I={iEnd}");
    }

    [Fact]
    public void CapacitorIc_DefaultsToZero_WithoutParam()
    {
        var sim = new CircuitSimulator();
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                new()
                {
                    Id = "C1",
                    Model = "capacitor",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["c"] = 1e-6 }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 1000 }
                },
            ]
        };
        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 0.001, Dt = 1e-4 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var vn = result.Tran!.NodeVoltages.First(s => s.Id == "n1");
        Assert.True(Math.Abs(vn.Values[0]) < 1e-9, $"expected 0 IC, V={vn.Values[0]}");
    }

    /// <summary>
    /// Lab LED-fade preset topology: parallel cap + R→LED at the switch output,
    /// LED cathode returns at the capacitor bottom (not a separate ground tee).
    /// </summary>
    [Fact]
    public void LedFadePreset_Charge_SwitchClosed_CapBranchCarriesCurrent()
    {
        var sim = new CircuitSimulator();
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                new()
                {
                    Id = "V1",
                    Model = "battery",
                    Pins = new Dictionary<string, string> { ["p"] = "n1", ["n"] = "gnd" },
                    Params = new Dictionary<string, double> { ["v"] = 5 }
                },
                new()
                {
                    Id = "S1",
                    Model = "switch",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "n2" },
                    Params = new Dictionary<string, double>(),
                    BoolParams = new Dictionary<string, bool> { ["closed"] = true }
                },
                new()
                {
                    Id = "C1",
                    Model = "capacitor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["c"] = 0.0022 }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "n4" },
                    Params = new Dictionary<string, double> { ["r"] = 220 }
                },
                new()
                {
                    Id = "D1",
                    Model = "led",
                    Pins = new Dictionary<string, string> { ["a"] = "n4", ["c"] = "gnd" },
                    Params = new Dictionary<string, double> { ["vf"] = 2, ["ron"] = 20 }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 2.0, Dt = 0.002 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iC = result.Tran!.BranchCurrents.First(s => s.Id == "C1").Values;
        var times = result.Tran.Time;

        var iCap0 = SignedNear(times, iC, 0.004);
        var iCapEnd = SignedNear(times, iC, 1.9);

        Assert.True(Math.Abs(iCap0) > 5e-4, $"cap should charge early, I={iCap0}");
        Assert.True(Math.Abs(iCapEnd) < Math.Abs(iCap0), $"cap current should decay, early={iCap0} end={iCapEnd}");
    }

    [Fact]
    public void LedFadePreset_FrontendNetlist_MatchesCompileNetlistTopology()
    {
        var sim = new CircuitSimulator();
        var circuit = LedFadeFrontendNetlist();

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 6.0, Dt = 0.002 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));

        var nodeIds = result.Tran!.NodeVoltages.Select(s => s.Id).ToHashSet();
        Assert.Contains("n1", nodeIds);
        Assert.Contains("gnd", nodeIds);

        var iC = result.Tran.BranchCurrents.First(s => s.Id == "C1").Values;
        var times = result.Tran.Time;
        var iEarly = SignedNear(times, iC, 0.004);
        Assert.True(Math.Abs(iEarly) > 1e-4, $"C1 should carry charge current early, I={iEarly}");
    }

    [Fact]
    public void LedFadePreset_InitFromDc_SuppressesCapChargeCurrent()
    {
        var sim = new CircuitSimulator();
        var circuit = LedFadeFrontendNetlist();
        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 6.0, Dt = 0.002, InitFromDc = true }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iC = result.Tran!.BranchCurrents.First(s => s.Id == "C1").Values;
        var times = result.Tran.Time;
        var iEarly = SignedNear(times, iC, 0.004);
        var iMax = iC.Max(Math.Abs);
        Assert.True(iMax < 1e-3, $"initFromDc should pre-charge cap in DC, max I={iMax}");
        Assert.True(Math.Abs(iEarly) < 1e-3, $"early cap I should be ~0 with initFromDc, I={iEarly}");
    }

    private static Circuit LedFadeFrontendNetlist() => new()
    {
        Ground = "gnd",
        Elements =
        [
            new()
            {
                Id = "V1",
                Model = "battery",
                Pins = new Dictionary<string, string> { ["p"] = "n0", ["n"] = "gnd" },
                Params = new Dictionary<string, double> { ["v"] = 5, ["esr"] = 0 }
            },
            new()
            {
                Id = "S1",
                Model = "switch",
                Pins = new Dictionary<string, string> { ["a"] = "n0", ["b"] = "n1" },
                Params = new Dictionary<string, double> { ["openAt"] = -1 },
                BoolParams = new Dictionary<string, bool> { ["closed"] = true }
            },
            new()
            {
                Id = "C1",
                Model = "capacitor",
                Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "gnd" },
                Params = new Dictionary<string, double> { ["c"] = 0.0022 }
            },
            new()
            {
                Id = "R1",
                Model = "resistor",
                Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "n2" },
                Params = new Dictionary<string, double> { ["r"] = 220 }
            },
            new()
            {
                Id = "D1",
                Model = "led",
                Pins = new Dictionary<string, string> { ["a"] = "n2", ["c"] = "gnd" },
                Params = new Dictionary<string, double> { ["vf"] = 2, ["ron"] = 20 }
            },
        ]
    };

    [Fact]
    public void LedFadePreset_Discharge_OpenSwitch_LedFadesFromStoredCharge()
    {
        var sim = new CircuitSimulator();
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                new()
                {
                    Id = "V1",
                    Model = "battery",
                    Pins = new Dictionary<string, string> { ["p"] = "n1", ["n"] = "gnd" },
                    Params = new Dictionary<string, double> { ["v"] = 5 }
                },
                new()
                {
                    Id = "S1",
                    Model = "switch",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "n2" },
                    Params = new Dictionary<string, double>(),
                    BoolParams = new Dictionary<string, bool> { ["closed"] = false }
                },
                new()
                {
                    Id = "C1",
                    Model = "capacitor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["c"] = 0.0022, ["ic"] = 4.8 }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "n4" },
                    Params = new Dictionary<string, double> { ["r"] = 220 }
                },
                new()
                {
                    Id = "D1",
                    Model = "led",
                    Pins = new Dictionary<string, string> { ["a"] = "n4", ["c"] = "gnd" },
                    Params = new Dictionary<string, double> { ["vf"] = 2, ["ron"] = 20 }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 3.0, Dt = 0.002 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iD = result.Tran!.BranchCurrents.First(s => s.Id == "D1").Values;
        var times = result.Tran.Time;

        var i0 = AbsNear(times, iD, 0.004);
        var iEnd = AbsNear(times, iD, 2.9);

        Assert.True(i0 > 0.003, $"LED should glow from stored charge, I={i0}");
        Assert.True(iEnd < i0 * 0.1, $"LED should fade, start={i0} end={iEnd}");
    }

    [Fact]
    public void Discharge_Series_R_and_LED_CurrentsMatch()
    {
        var sim = new CircuitSimulator();
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                new()
                {
                    Id = "V1",
                    Model = "battery",
                    Pins = new Dictionary<string, string> { ["p"] = "n1", ["n"] = "gnd" },
                    Params = new Dictionary<string, double> { ["v"] = 5 }
                },
                new()
                {
                    Id = "S1",
                    Model = "switch",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "n2" },
                    Params = new Dictionary<string, double>(),
                    BoolParams = new Dictionary<string, bool> { ["closed"] = false }
                },
                new()
                {
                    Id = "C1",
                    Model = "capacitor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["c"] = 0.0022, ["ic"] = 5.0 }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "n3" },
                    Params = new Dictionary<string, double> { ["r"] = 220 }
                },
                new()
                {
                    Id = "D1",
                    Model = "led",
                    Pins = new Dictionary<string, string> { ["a"] = "n3", ["c"] = "gnd" },
                    Params = new Dictionary<string, double> { ["vf"] = 2, ["ron"] = 20 }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 3.0, Dt = 0.002 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iR = result.Tran!.BranchCurrents.First(s => s.Id == "R1").Values;
        var iD = result.Tran!.BranchCurrents.First(s => s.Id == "D1").Values;
        var times = result.Tran.Time;

        double maxDiff = 0;
        var worst = 0;
        for (var k = 0; k < times.Count; k++)
        {
            var d = Math.Abs(iR[k] - iD[k]);
            if (d > maxDiff)
            {
                maxDiff = d;
                worst = k;
            }
        }

        Assert.True(
            maxDiff < 1e-6,
            $"max |IR-ID|={maxDiff} at t={times[worst]} IR={iR[worst]} ID={iD[worst]}"
        );

        // Also ensure LED stays forward (positive) while glowing — negative I blanks the glow.
        var positiveWhileLit = 0;
        for (var k = 0; k < times.Count; k++)
        {
            if (iD[k] > 1e-4) positiveWhileLit++;
            if (iD[k] < -1e-4)
                Assert.Fail($"LED reverse current at t={times[k]} ID={iD[k]}");
        }
        Assert.True(positiveWhileLit > 10, "expected sustained forward LED current during discharge");
    }

    private static double SignedNear(IReadOnlyList<double> times, IReadOnlyList<double> values, double t)
    {
        var bestIdx = 0;
        var bestDt = double.MaxValue;
        for (var i = 0; i < times.Count; i++)
        {
            var dt = Math.Abs(times[i] - t);
            if (dt < bestDt)
            {
                bestDt = dt;
                bestIdx = i;
            }
        }
        return values[bestIdx];
    }

    private static double AbsNear(IReadOnlyList<double> times, IReadOnlyList<double> values, double t)
    {
        var bestIdx = 0;
        var bestDt = double.MaxValue;
        for (var i = 0; i < times.Count; i++)
        {
            var dt = Math.Abs(times[i] - t);
            if (dt < bestDt)
            {
                bestDt = dt;
                bestIdx = i;
            }
        }
        return Math.Abs(values[bestIdx]);
    }
}
