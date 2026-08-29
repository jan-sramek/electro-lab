using ElectroLab.CircuitSim;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Tests;

public class DcOperatingPointTests
{
    private readonly CircuitSimulator _sim = new();

    [Fact]
    public void VoltageDivider_TwoEqualResistors()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 10))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "mid")), P(("r", 1000))),
                El("R2", "resistor", Pins(("a", "mid"), ("b", "gnd")), P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(10, result.DcOp!.NodeVoltages["n1"], 3);
        Assert.Equal(5, result.DcOp.NodeVoltages["mid"], 3);
        Assert.Equal(0.005, result.DcOp.BranchCurrents["R1"], 6);
    }

    [Fact]
    public void LedWithSeriesResistor_From5V()
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

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        // I = (5 - 2) / (220 + 20) = 0.0125 A; Vn2 = 2 + I*20 = 2.25
        Assert.Equal(0.0125, result.DcOp!.BranchCurrents["D1"], 5);
        Assert.Equal(2.25, result.DcOp.NodeVoltages["n2"], 3);
    }

    [Fact]
    public void OpenSwitch_BlocksCurrent()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("S1", "switch", Pins(("a", "n1"), ("b", "n2")), P(), boolParams: new Dictionary<string, bool> { ["closed"] = false }),
                El("R1", "resistor", Pins(("a", "n2"), ("b", "gnd")), P(("r", 100)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["R1"]) < 1e-9);
    }

    [Fact]
    public void DiodeWithSeriesResistor_From5V()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 100))),
                El("D1", "diode", Pins(("a", "n2"), ("c", "gnd")), P(("vf", 0.7), ("ron", 10)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        // I = (5 - 0.7) / (100 + 10) = 0.03909
        Assert.Equal(0.0390909, result.DcOp!.BranchCurrents["D1"], 4);
    }

    [Fact]
    public void CurrentSourceIntoResistor()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("I1", "current_source", Pins(("p", "n1"), ("n", "gnd")), P(("i", 0.002))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(2.0, result.DcOp!.NodeVoltages["n1"], 3);
        Assert.Equal(0.002, result.DcOp.BranchCurrents["I1"], 6);
    }

    [Fact]
    public void Capacitor_IsOpenInDc_WithWarning()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 1000))),
                El("C1", "capacitor", Pins(("a", "n1"), ("b", "gnd")), P(("c", 1e-6)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Contains(result.Warnings, w => w.Contains("C1") && w.Contains("open-circuit"));
        Assert.Equal(5.0, result.DcOp!.NodeVoltages["n1"], 3);
        Assert.Equal(0.0, result.DcOp.BranchCurrents["C1"], 9);
    }

    [Fact]
    public void Inductor_IsShortInDc()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("L1", "inductor", Pins(("a", "n1"), ("b", "n2")), P(("l", 0.01))),
                El("R1", "resistor", Pins(("a", "n2"), ("b", "gnd")), P(("r", 100)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(5.0, result.DcOp!.NodeVoltages["n2"], 2);
        Assert.Equal(0.05, result.DcOp.BranchCurrents["R1"], 3);
    }

    [Fact]
    public void Transient_RcStep_ChargesTowardSupply()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 1000))),
                El("C1", "capacitor", Pins(("a", "n2"), ("b", "gnd")), P(("c", 1e-6)))
            ]
        };

        var result = _sim.Simulate(circuit, "tran", new ElectroLab.CircuitSim.Analysis.AnalysisOptions
        {
            TStop = 0.005,
            Dt = 5e-5
        });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.NotNull(result.Tran);
        var series = result.Tran!.NodeVoltages.First(s => s.Id == "n2");
        Assert.True(series.Values[0] < 1.0, "starts near 0");
        Assert.True(series.Values[^1] > 4.5, $"final Vc={series.Values[^1]} should approach 5V");
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
