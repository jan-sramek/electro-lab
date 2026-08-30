using ElectroLab.CircuitSim;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Netlist;
using Xunit;

public class SwitchTimelineAndInitFromDcTests
{
    [Fact]
    public void OpenAt_OpensMidTransient()
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
                    Params = new Dictionary<string, double> { ["openAt"] = 0.002 },
                    BoolParams = new Dictionary<string, bool> { ["closed"] = true }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 1000 }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 0.005, Dt = 0.0005 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iR = result.Tran!.BranchCurrents.First(s => s.Id == "R1").Values;
        var times = result.Tran.Time;

        Assert.True(AbsNear(times, iR, 0.001) > 0.004, "before openAt should conduct");
        Assert.True(AbsNear(times, iR, 0.004) < 1e-9, "after openAt should be open");
    }

    [Fact]
    public void CloseAt_ClosesMidTransient()
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
                    Params = new Dictionary<string, double> { ["closeAt"] = 0.002 },
                    BoolParams = new Dictionary<string, bool> { ["closed"] = false }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 1000 }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 0.005, Dt = 0.0005 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iR = result.Tran!.BranchCurrents.First(s => s.Id == "R1").Values;
        var times = result.Tran.Time;

        Assert.True(AbsNear(times, iR, 0.001) < 1e-9, "before closeAt should be open");
        Assert.True(AbsNear(times, iR, 0.004) > 0.004, "after closeAt should conduct");
    }

    [Fact]
    public void CloseAtThenOpenAt_WindowConducts()
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
                    Params = new Dictionary<string, double> { ["closeAt"] = 0.001, ["openAt"] = 0.003 },
                    BoolParams = new Dictionary<string, bool> { ["closed"] = false }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 1000 }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 0.005, Dt = 0.0005 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iR = result.Tran!.BranchCurrents.First(s => s.Id == "R1").Values;
        var times = result.Tran.Time;

        Assert.True(AbsNear(times, iR, 0.0) < 1e-9, "t=0 open");
        Assert.True(AbsNear(times, iR, 0.002) > 0.004, "inside window");
        Assert.True(AbsNear(times, iR, 0.004) < 1e-9, "after openAt");
    }

    [Fact]
    public void InitFromDc_SeedsCapacitor_ThenOpenAtDischarges()
    {
        // Battery — switch (openAt) — R — C to gnd. DC seed charges C; after openAt, C holds.
        // With series RC and open switch, C voltage stays; use parallel bleed R for fade.
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
                    Params = new Dictionary<string, double> { ["openAt"] = 0.001 },
                    BoolParams = new Dictionary<string, bool> { ["closed"] = true }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "n3" },
                    Params = new Dictionary<string, double> { ["r"] = 100 }
                },
                new()
                {
                    Id = "C1",
                    Model = "capacitor",
                    Pins = new Dictionary<string, string> { ["a"] = "n3", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["c"] = 1e-4 }
                },
                new()
                {
                    Id = "Rbleed",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n3", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 1000 }
                },
            ]
        };

        var withSeed = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 0.01, Dt = 0.0002, InitFromDc = true }
        );
        Assert.True(withSeed.Ok, string.Join(";", withSeed.Errors));
        var vC = withSeed.Tran!.NodeVoltages.First(s => s.Id == "n3").Values;
        var times = withSeed.Tran.Time;
        // DC seed: C sees nearly 5 V through R1||Rbleed path (steady).
        Assert.True(AbsNear(times, vC, 0.0) > 4.0, $"expected charged IC, V={AbsNear(times, vC, 0.0)}");

        var noSeed = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 0.01, Dt = 0.0002, InitFromDc = false }
        );
        Assert.True(noSeed.Ok, string.Join(";", noSeed.Errors));
        var vC0 = noSeed.Tran!.NodeVoltages.First(s => s.Id == "n3").Values;
        Assert.True(AbsNear(noSeed.Tran.Time, vC0, 0.0) < 0.5, "without initFromDc, C starts near 0");
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
