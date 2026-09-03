using ElectroLab.CircuitSim;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Netlist;
using Xunit;

public class PowerSupplyModelTests
{
    [Fact]
    public void Zener_Regulates_ReverseBreakdown()
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
                    Params = new Dictionary<string, double> { ["v"] = 12 }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "n2" },
                    Params = new Dictionary<string, double> { ["r"] = 470 }
                },
                new()
                {
                    Id = "DZ",
                    Model = "zener",
                    Pins = new Dictionary<string, string> { ["a"] = "gnd", ["c"] = "n2" },
                    Params = new Dictionary<string, double> { ["vf"] = 0.7, ["vz"] = 5.1, ["ron"] = 10 }
                },
            ]
        };

        var result = sim.Simulate(circuit, "dcOp", new AnalysisOptions());
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var v = result.DcOp!.NodeVoltages["n2"];
        Assert.InRange(v, 4.5, 5.6);
    }

    [Fact]
    public void Vreg7805_HoldsFiveVolts_WhenVinSufficient()
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
                    Pins = new Dictionary<string, string> { ["p"] = "nIn", ["n"] = "gnd" },
                    Params = new Dictionary<string, double> { ["v"] = 12 }
                },
                new()
                {
                    Id = "U1",
                    Model = "vreg_7805",
                    Pins = new Dictionary<string, string>
                    {
                        ["in"] = "nIn",
                        ["gnd"] = "gnd",
                        ["out"] = "nOut"
                    },
                    Params = new Dictionary<string, double> { ["vOut"] = 5, ["dropout"] = 2, ["ron"] = 2 }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "nOut", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 1000 }
                },
            ]
        };

        var result = sim.Simulate(circuit, "dcOp", new AnalysisOptions());
        Assert.True(result.Ok, string.Join(";", result.Errors));
        Assert.InRange(result.DcOp!.NodeVoltages["nOut"], 4.9, 5.1);
    }

    [Fact]
    public void Fuse_Conducts_WhenNotBurned()
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
                    Id = "F1",
                    Model = "fuse",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["b"] = "n2" },
                    Params = new Dictionary<string, double> { ["iMax"] = 0.2, ["ron"] = 0.05 }
                },
                new()
                {
                    Id = "R1",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "n2", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 100 }
                },
            ]
        };

        var result = sim.Simulate(circuit, "dcOp", new AnalysisOptions());
        Assert.True(result.Ok, string.Join(";", result.Errors));
        Assert.InRange(result.DcOp!.NodeVoltages["n2"], 4.5, 5.1);
        Assert.True(Math.Abs(result.DcOp.BranchCurrents["F1"]) > 0.04);
    }

    [Fact]
    public void BuckConverter_BuildsLoadCurrent_OnPwmTransient()
    {
        var sim = new CircuitSimulator();
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                new()
                {
                    Id = "VB",
                    Model = "battery",
                    Pins = new Dictionary<string, string> { ["p"] = "vin", ["n"] = "gnd" },
                    Params = new Dictionary<string, double> { ["v"] = 12 }
                },
                new()
                {
                    Id = "M1",
                    Model = "nmos",
                    Pins = new Dictionary<string, string> { ["d"] = "vin", ["g"] = "gate", ["s"] = "lx" },
                    Params = new Dictionary<string, double> { ["vth"] = 2, ["ron"] = 5 }
                },
                new()
                {
                    Id = "L1",
                    Model = "inductor",
                    Pins = new Dictionary<string, string> { ["a"] = "lx", ["b"] = "out" },
                    Params = new Dictionary<string, double> { ["l"] = 0.1 }
                },
                new()
                {
                    Id = "Dfly",
                    Model = "diode",
                    Pins = new Dictionary<string, string> { ["a"] = "gnd", ["c"] = "lx" },
                    Params = new Dictionary<string, double> { ["vf"] = 0.7, ["ron"] = 10 }
                },
                new()
                {
                    Id = "C1",
                    Model = "capacitor",
                    Pins = new Dictionary<string, string> { ["a"] = "out", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["c"] = 100e-6 }
                },
                new()
                {
                    Id = "RL",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "out", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 220 }
                },
                new()
                {
                    Id = "VP1",
                    Model = "pulse_source",
                    Pins = new Dictionary<string, string> { ["p"] = "gate", ["n"] = "lx" },
                    Params = new Dictionary<string, double>
                    {
                        ["v1"] = 0,
                        ["v2"] = 5,
                        ["td"] = 0,
                        ["pw"] = 0.00025,
                        ["period"] = 0.001
                    }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 0.01, Dt = 2e-5, InitFromDc = true }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iL = result.Tran!.BranchCurrents.First(s => s.Id == "L1").Values;
        var iM = result.Tran.BranchCurrents.First(s => s.Id == "M1").Values;
        var iD = result.Tran.BranchCurrents.First(s => s.Id == "Dfly").Values;
        var iR = result.Tran.BranchCurrents.First(s => s.Id == "RL").Values;
        Assert.True(iL.Max(Math.Abs) > 0.01, $"L1 peak |I|={iL.Max(Math.Abs)}");
        Assert.True(iR.Max(Math.Abs) > 0.005, $"RL peak |I|={iR.Max(Math.Abs)}");
        // Lab teaching burn thresholds (frontend nmos-limits / burnout).
        Assert.True(iM.Max(Math.Abs) < 0.5, $"M1 peak |I|={iM.Max(Math.Abs)} must stay under NMOS burn");
        Assert.True(iD.Max(Math.Abs) < 0.1, $"Dfly peak |I|={iD.Max(Math.Abs)} must stay under diode burn");
    }

    [Fact]
    public void BoostConverter_BuildsLoadCurrent_OnPwmTransient()
    {
        var sim = new CircuitSimulator();
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                new()
                {
                    Id = "VB",
                    Model = "battery",
                    Pins = new Dictionary<string, string> { ["p"] = "vin", ["n"] = "gnd" },
                    Params = new Dictionary<string, double> { ["v"] = 5 }
                },
                new()
                {
                    Id = "L1",
                    Model = "inductor",
                    Pins = new Dictionary<string, string> { ["a"] = "vin", ["b"] = "sw" },
                    Params = new Dictionary<string, double> { ["l"] = 0.047 }
                },
                new()
                {
                    Id = "M1",
                    Model = "nmos",
                    Pins = new Dictionary<string, string> { ["d"] = "sw", ["g"] = "gate", ["s"] = "gnd" },
                    Params = new Dictionary<string, double> { ["vth"] = 2, ["ron"] = 5 }
                },
                new()
                {
                    Id = "D1",
                    Model = "diode",
                    Pins = new Dictionary<string, string> { ["a"] = "sw", ["c"] = "out" },
                    Params = new Dictionary<string, double> { ["vf"] = 0.7, ["ron"] = 10 }
                },
                new()
                {
                    Id = "C1",
                    Model = "capacitor",
                    Pins = new Dictionary<string, string> { ["a"] = "out", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["c"] = 100e-6 }
                },
                new()
                {
                    Id = "RL",
                    Model = "resistor",
                    Pins = new Dictionary<string, string> { ["a"] = "out", ["b"] = "gnd" },
                    Params = new Dictionary<string, double> { ["r"] = 470 }
                },
                new()
                {
                    Id = "VP1",
                    Model = "pulse_source",
                    Pins = new Dictionary<string, string> { ["p"] = "gate", ["n"] = "gnd" },
                    Params = new Dictionary<string, double>
                    {
                        ["v1"] = 0,
                        ["v2"] = 5,
                        ["td"] = 0,
                        ["pw"] = 0.0003,
                        ["period"] = 0.001
                    }
                },
            ]
        };

        var result = sim.Simulate(
            circuit,
            "tran",
            new AnalysisOptions { TStop = 0.01, Dt = 2e-5, InitFromDc = true }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var iL = result.Tran!.BranchCurrents.First(s => s.Id == "L1").Values;
        var iM = result.Tran.BranchCurrents.First(s => s.Id == "M1").Values;
        var iD = result.Tran.BranchCurrents.First(s => s.Id == "D1").Values;
        var vOut = result.Tran.NodeVoltages.First(s => s.Id == "out").Values;
        Assert.True(iL.Max(Math.Abs) > 0.01, $"L1 peak |I|={iL.Max(Math.Abs)}");
        Assert.True(vOut.Max() > 5.2, $"boost Vout max={vOut.Max()}");
        Assert.True(iM.Max(Math.Abs) < 0.5, $"M1 peak |I|={iM.Max(Math.Abs)} must stay under NMOS burn");
        Assert.True(iD.Max(Math.Abs) < 0.1, $"D1 peak |I|={iD.Max(Math.Abs)} must stay under diode burn");
    }

    [Fact]
    public void HalfWaveRectifier_Pulsates_OnAc()
    {
        var sim = new CircuitSimulator();
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                new()
                {
                    Id = "AC1",
                    Model = "ac_source",
                    Pins = new Dictionary<string, string> { ["p"] = "n1", ["n"] = "gnd" },
                    Params = new Dictionary<string, double> { ["mag"] = 10, ["phase"] = 0, ["freq"] = 50 }
                },
                new()
                {
                    Id = "D1",
                    Model = "diode",
                    Pins = new Dictionary<string, string> { ["a"] = "n1", ["c"] = "n2" },
                    Params = new Dictionary<string, double> { ["vf"] = 0.7, ["ron"] = 10 }
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
            new AnalysisOptions { TStop = 0.04, Dt = 0.0002 }
        );
        Assert.True(result.Ok, string.Join(";", result.Errors));
        var v = result.Tran!.NodeVoltages.First(s => s.Id == "n2").Values;
        Assert.True(v.Max() > 5, $"peak should pass, max={v.Max()}");
        Assert.True(v.Min() > -0.5, $"negative should be blocked, min={v.Min()}");
    }
}
