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
