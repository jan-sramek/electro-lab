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
    public void BurnedLed_IsOpenCircuit()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 10))),
                El(
                    "D1",
                    "led",
                    Pins(("a", "n2"), ("c", "gnd")),
                    P(("vf", 2.0), ("ron", 20)),
                    new Dictionary<string, bool> { ["burned"] = true }
                )
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["D1"]) < 1e-9);
        Assert.True(Math.Abs(result.DcOp.BranchCurrents["R1"]) < 1e-9);
        Assert.Equal(5, result.DcOp.NodeVoltages["n1"], 3);
    }

    [Fact]
    public void BurnedDiode_IsOpenCircuit()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "n2")), P(("r", 100))),
                El(
                    "D1",
                    "diode",
                    Pins(("a", "n2"), ("c", "gnd")),
                    P(("vf", 0.7), ("ron", 10)),
                    new Dictionary<string, bool> { ["burned"] = true }
                )
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["D1"]) < 1e-9);
        Assert.True(Math.Abs(result.DcOp.BranchCurrents["R1"]) < 1e-9);
    }

    [Fact]
    public void BurnedResistor_IsOpenCircuit()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El(
                    "R1",
                    "resistor",
                    Pins(("a", "n1"), ("b", "gnd")),
                    P(("r", 10)),
                    new Dictionary<string, bool> { ["burned"] = true }
                )
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["R1"]) < 1e-9);
        Assert.Equal(5, result.DcOp.NodeVoltages["n1"], 3);
    }

    [Fact]
    public void BurnedAmmeter_IsOpenCircuit()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El(
                    "AM1",
                    "ammeter",
                    Pins(("a", "n1"), ("b", "n2")),
                    P(("r", 0.01)),
                    new Dictionary<string, bool> { ["burned"] = true }
                ),
                El("R1", "resistor", Pins(("a", "n2"), ("b", "gnd")), P(("r", 100)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["AM1"]) < 1e-9);
        Assert.True(Math.Abs(result.DcOp.BranchCurrents["R1"]) < 1e-9);
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

    [Fact]
    public void Transient_InductorCurrentRamps()
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

        var result = _sim.Simulate(circuit, "tran", new ElectroLab.CircuitSim.Analysis.AnalysisOptions
        {
            TStop = 0.002,
            Dt = 2e-5
        });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        var iL = result.Tran!.BranchCurrents.First(s => s.Id == "L1");
        Assert.True(iL.Values[0] < 0.01, "starts near 0");
        Assert.True(iL.Values[^1] > 0.03, $"final iL={iL.Values[^1]} should rise");
    }

    [Fact]
    public void Transient_InductorIc_StartsNearSeededCurrent()
    {
        // Parallel RL: large τ so the first BE sample stays close to params.ic.
        Circuit Make(double? ic)
        {
            var pars = new Dictionary<string, double> { ["l"] = 1.0 };
            if (ic is double v) pars["ic"] = v;
            return new Circuit
            {
                Ground = "gnd",
                Elements =
                [
                    El("L1", "inductor", Pins(("a", "n1"), ("b", "gnd")), pars),
                    El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 10000)))
                ]
            };
        }

        var opts = new ElectroLab.CircuitSim.Analysis.AnalysisOptions { TStop = 0.0001, Dt = 1e-5 };
        var withIc = _sim.Simulate(Make(0.5), "tran", opts);
        Assert.True(withIc.Ok, string.Join("; ", withIc.Errors));
        var iSeeded = withIc.Tran!.BranchCurrents.First(s => s.Id == "L1").Values[0];
        Assert.True(Math.Abs(iSeeded - 0.5) < 0.08, $"iL[0]={iSeeded} should start near ic=0.5");

        var zeroIc = _sim.Simulate(Make(null), "tran", opts);
        Assert.True(zeroIc.Ok, string.Join("; ", zeroIc.Errors));
        var i0 = zeroIc.Tran!.BranchCurrents.First(s => s.Id == "L1").Values[0];
        Assert.True(Math.Abs(i0) < 0.05, $"without ic, iL[0]={i0} should be near 0");
    }

    [Fact]
    public void Potentiometer_DividerAt30Percent()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 10))),
                El("POT1", "potentiometer", Pins(("a", "n1"), ("w", "wiper"), ("b", "gnd")), P(("r", 10000), ("pos", 0.3)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        // Vw ≈ 10 * (1 - 0.3) from top? Ra = r*pos from a–w, Rb = r*(1-pos) from w–b.
        // With a at 10V and b at 0: Vw = 10 * Rb/(Ra+Rb) = 10 * 0.7 = 7
        Assert.Equal(7.0, result.DcOp!.NodeVoltages["wiper"], 2);
    }

    [Fact]
    public void PulseSource_StepsDuringTransient()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VP1", "pulse_source", Pins(("p", "n1"), ("n", "gnd")),
                    P(("v1", 0), ("v2", 5), ("td", 0.001), ("pw", 0.002))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit, "tran", new ElectroLab.CircuitSim.Analysis.AnalysisOptions
        {
            TStop = 0.005,
            Dt = 5e-5
        });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        var vn1 = result.Tran!.NodeVoltages.First(s => s.Id == "n1");
        Assert.True(vn1.Values[0] < 0.5);
        var mid = vn1.Values[vn1.Values.Count / 2];
        Assert.True(mid > 4.0, $"mid pulse V={mid}");
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
