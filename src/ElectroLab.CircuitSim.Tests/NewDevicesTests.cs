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
    public void BurnedBjt_IsOpenCircuit()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VB", "battery", Pins(("p", "nb"), ("n", "gnd")), P(("v", 5))),
                El("VC", "battery", Pins(("p", "nc"), ("n", "gnd")), P(("v", 10))),
                El("RC", "resistor", Pins(("a", "nc"), ("b", "c")), P(("r", 100))),
                El(
                    "Q1",
                    "bjt_npn",
                    Pins(("c", "c"), ("b", "nb"), ("e", "gnd")),
                    P(("vf", 0.7), ("rb", 25), ("ron", 10)),
                    new Dictionary<string, bool> { ["burned"] = true }
                )
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["Q1"]) < 1e-9);
        Assert.Equal(10.0, result.DcOp.NodeVoltages["c"], 2);
    }

    [Fact]
    public void Relay_ContactsOpen_WhenCoilBelowPullIn()
    {
        // Coil across 2 V with vPull=3.5 → open contacts → no load current.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VC", "battery", Pins(("p", "coil"), ("n", "gnd")), P(("v", 2))),
                El("VL", "battery", Pins(("p", "load"), ("n", "gnd")), P(("v", 5))),
                El("RL", "resistor", Pins(("a", "load"), ("b", "sw")), P(("r", 100))),
                El(
                    "K1",
                    "relay",
                    Pins(("cp", "coil"), ("cn", "gnd"), ("a", "sw"), ("b", "gnd")),
                    P(("rCoil", 400), ("vPull", 3.5), ("ron", 0.1))
                )
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["K1"]) < 1e-6);
        Assert.True(Math.Abs(result.DcOp.BranchCurrents["RL"]) < 1e-6);
        Assert.Equal(5.0, result.DcOp.NodeVoltages["load"], 2);
    }

    [Fact]
    public void Relay_ContactsClose_WhenCoilAbovePullIn()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VC", "battery", Pins(("p", "coil"), ("n", "gnd")), P(("v", 5))),
                El("VL", "battery", Pins(("p", "load"), ("n", "gnd")), P(("v", 5))),
                El("RL", "resistor", Pins(("a", "load"), ("b", "sw")), P(("r", 100))),
                El(
                    "K1",
                    "relay",
                    Pins(("cp", "coil"), ("cn", "gnd"), ("a", "sw"), ("b", "gnd")),
                    P(("rCoil", 400), ("vPull", 3.5), ("ron", 0.1))
                )
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(result.DcOp!.BranchCurrents["RL"] > 0.04, $"Iload={result.DcOp.BranchCurrents["RL"]}");
        Assert.True(result.DcOp.NodeVoltages["sw"] < 0.5);
    }

    [Fact]
    public void Relay_ManualClosed_ForcesContacts_WithoutCoilDrive()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VL", "battery", Pins(("p", "load"), ("n", "gnd")), P(("v", 5))),
                El("RL", "resistor", Pins(("a", "load"), ("b", "sw")), P(("r", 100))),
                El(
                    "K1",
                    "relay",
                    Pins(("cp", "nc"), ("cn", "gnd"), ("a", "sw"), ("b", "gnd")),
                    P(("rCoil", 400), ("vPull", 3.5), ("ron", 0.1)),
                    new Dictionary<string, bool> { ["closed"] = true }
                ),
                El("RB", "resistor", Pins(("a", "nc"), ("b", "gnd")), P(("r", 1e6)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(result.DcOp!.BranchCurrents["RL"] > 0.04);
    }

    [Fact]
    public void Relay_CloseAtTimeline_ClosesContactsInTransient()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VL", "battery", Pins(("p", "load"), ("n", "gnd")), P(("v", 5))),
                El("RL", "resistor", Pins(("a", "load"), ("b", "sw")), P(("r", 100))),
                El(
                    "K1",
                    "relay",
                    Pins(("cp", "nc"), ("cn", "gnd"), ("a", "sw"), ("b", "gnd")),
                    P(("rCoil", 400), ("vPull", 3.5), ("ron", 0.1), ("closeAt", 0.005), ("openAt", -1)),
                    new Dictionary<string, bool> { ["closed"] = false }
                ),
                El("RB", "resistor", Pins(("a", "nc"), ("b", "gnd")), P(("r", 1e6)))
            ]
        };

        var result = _sim.Simulate(circuit, "tran", new AnalysisOptions { TStop = 0.01, Dt = 0.001 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        var iK = result.Tran!.BranchCurrents.First(s => s.Id == "K1").Values;
        Assert.True(Math.Abs(iK[0]) < 1e-6, "open at t=0");
        Assert.True(iK[^1] > 0.04, $"closed by end, I={iK[^1]}");
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
    public void OpAmp_OpenLoop_ClampsToTeachingRail()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 1))),
                El("U1", "op_amp", Pins(("inp", "n1"), ("inn", "gnd"), ("out", "out")),
                    P(("gain", 1e5), ("vMax", 15), ("vMin", -15))),
                El("RL", "resistor", Pins(("a", "out"), ("b", "gnd")), P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.Equal(15.0, result.DcOp!.NodeVoltages["out"], 2);
        Assert.Contains(result.Warnings, w => w.Contains("U1") && w.Contains("clamped"));
    }

    [Fact]
    public void AcSource_SineInTransient_DrivesLoad()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("AC1", "ac_source", Pins(("p", "n1"), ("n", "gnd")),
                    P(("mag", 1.0), ("phase", 0), ("freq", 50))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit, "tran", new AnalysisOptions { TStop = 0.02, Dt = 0.0005 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        var series = result.Tran!.NodeVoltages.First(s => s.Id == "n1");
        var peak = series.Values.Max(Math.Abs);
        Assert.True(peak > 0.9, $"peak |V|={peak} should approach mag=1 with sine drive");
        Assert.True(series.Values.Min() < -0.9, "sine should go negative");
    }

    [Fact]
    public void AcSource_WithoutFreq_StaysZeroInTransient()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("AC1", "ac_source", Pins(("p", "n1"), ("n", "gnd")), P(("mag", 1.0), ("phase", 0))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "gnd")), P(("r", 1000)))
            ]
        };

        var result = _sim.Simulate(circuit, "tran", new AnalysisOptions { TStop = 0.01, Dt = 0.001 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        var series = result.Tran!.NodeVoltages.First(s => s.Id == "n1");
        Assert.All(series.Values, v => Assert.True(Math.Abs(v) < 1e-9));
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

    [Fact]
    public void NmosSwitch_PassesCurrent_WhenGateAboveThreshold()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VG", "battery", Pins(("p", "ng"), ("n", "gnd")), P(("v", 5))),
                El("VD", "battery", Pins(("p", "nd"), ("n", "gnd")), P(("v", 10))),
                El("RD", "resistor", Pins(("a", "nd"), ("b", "d")), P(("r", 100))),
                El("M1", "nmos", Pins(("d", "d"), ("g", "ng"), ("s", "gnd")), P(("vth", 2), ("ron", 5)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(result.DcOp!.BranchCurrents["M1"] > 0.05);
        Assert.True(result.DcOp.NodeVoltages["d"] < 2.0);
    }

    [Fact]
    public void NmosSwitch_Blocks_WhenGateBelowThreshold()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VG", "battery", Pins(("p", "ng"), ("n", "gnd")), P(("v", 1))),
                El("VD", "battery", Pins(("p", "nd"), ("n", "gnd")), P(("v", 10))),
                El("RD", "resistor", Pins(("a", "nd"), ("b", "d")), P(("r", 100))),
                El("M1", "nmos", Pins(("d", "d"), ("g", "ng"), ("s", "gnd")), P(("vth", 2), ("ron", 5)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["M1"]) < 1e-6);
        Assert.Equal(10.0, result.DcOp.NodeVoltages["d"], 2);
    }

    [Fact]
    public void Ne555_OutputHigh_WhenTriggered()
    {
        // thr low, trig low, reset high → latch sets → OUT toward Vcc.
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VCC", "battery", Pins(("p", "vcc"), ("n", "gnd")), P(("v", 5))),
                El("RL", "resistor", Pins(("a", "out"), ("b", "gnd")), P(("r", 1000))),
                El(
                    "U1",
                    "ne555",
                    Pins(
                        ("gnd", "gnd"),
                        ("trig", "gnd"),
                        ("out", "out"),
                        ("reset", "vcc"),
                        ("ctrl", "ctrl"),
                        ("thr", "gnd"),
                        ("dis", "dis"),
                        ("vcc", "vcc")
                    ),
                    P(("ron", 10))
                ),
                El("RC", "resistor", Pins(("a", "ctrl"), ("b", "gnd")), P(("r", 1e6)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(result.DcOp!.NodeVoltages["out"] > 4.0, $"Vout={result.DcOp.NodeVoltages["out"]}");
    }

    [Fact]
    public void Ne555_OutputLow_WhenThresholdHigh()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VCC", "battery", Pins(("p", "vcc"), ("n", "gnd")), P(("v", 5))),
                El("RL", "resistor", Pins(("a", "out"), ("b", "gnd")), P(("r", 1000))),
                El(
                    "U1",
                    "ne555",
                    Pins(
                        ("gnd", "gnd"),
                        ("trig", "vcc"),
                        ("out", "out"),
                        ("reset", "vcc"),
                        ("ctrl", "ctrl"),
                        ("thr", "vcc"),
                        ("dis", "dis"),
                        ("vcc", "vcc")
                    ),
                    P(("ron", 10))
                ),
                El("RC", "resistor", Pins(("a", "ctrl"), ("b", "gnd")), P(("r", 1e6)))
            ]
        };

        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(result.DcOp!.NodeVoltages["out"] < 0.5, $"Vout={result.DcOp.NodeVoltages["out"]}");
    }

    [Fact]
    public void Ne555_Astable_Rb10ohm_LatchesHigh_TimingNetworkIdles()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VCC", "battery", Pins(("p", "vcc"), ("n", "gnd")), P(("v", 5))),
                El("RA", "resistor", Pins(("a", "vcc"), ("b", "dis")), P(("r", 10000))),
                El("RB", "resistor", Pins(("a", "dis"), ("b", "thr")), P(("r", 10))),
                El("CT", "capacitor", Pins(("a", "thr"), ("b", "gnd")), P(("c", 4.7e-7))),
                El("CC", "capacitor", Pins(("a", "ctrl"), ("b", "gnd")), P(("c", 1e-8))),
                El("R1", "resistor", Pins(("a", "out"), ("b", "led1")), P(("r", 220))),
                El("D1", "led", Pins(("a", "led1"), ("c", "gnd")), P(("vf", 2), ("ron", 5))),
                El("R2", "resistor", Pins(("a", "out"), ("b", "led2")), P(("r", 220))),
                El("D2", "led", Pins(("a", "led2"), ("c", "gnd")), P(("vf", 2), ("ron", 5))),
                El("R3", "resistor", Pins(("a", "out"), ("b", "led3")), P(("r", 220))),
                El("D3", "led", Pins(("a", "led3"), ("c", "gnd")), P(("vf", 2), ("ron", 5))),
                El(
                    "U1",
                    "ne555",
                    Pins(
                        ("gnd", "gnd"),
                        ("trig", "thr"),
                        ("out", "out"),
                        ("reset", "vcc"),
                        ("ctrl", "ctrl"),
                        ("thr", "thr"),
                        ("dis", "dis"),
                        ("vcc", "vcc")
                    ),
                    P(("ron", 10))
                )
            ]
        };

        var result = _sim.Simulate(circuit, "tran", new AnalysisOptions { TStop = 0.1, Dt = 5e-5 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        var outV = result.Tran!.NodeVoltages.First(s => s.Id == "out").Values;
        var rb = result.Tran.BranchCurrents.First(s => s.Id == "RB").Values;
        var ra = result.Tran.BranchCurrents.First(s => s.Id == "RA").Values;
        var d1 = result.Tran.BranchCurrents.First(s => s.Id == "D1").Values;
        // RB ≪ RA breaks astable timing — output sticks high; timing network idles.
        Assert.True(outV.Min() > 4.5, "OUT should latch high with RB=10 Ω");
        Assert.True(rb.Max(v => Math.Abs(v)) < 0.01, "RB branch should be nearly idle when DIS is off");
        Assert.True(ra.Max(v => Math.Abs(v)) < 0.01, "RA branch should be nearly idle when DIS is off");
        Assert.True(d1.Max() > 0.005, "LEDs should still conduct when OUT is high");
    }

    [Fact]
    public void Ldr_Darker_Means_Higher_Resistance()
    {
        var dark = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("LDR", "ldr", Pins(("a", "n1"), ("b", "gnd")), P(("rDark", 100000), ("rLight", 1000), ("light", 0)))
            ]
        };
        var light = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("LDR", "ldr", Pins(("a", "n1"), ("b", "gnd")), P(("rDark", 100000), ("rLight", 1000), ("light", 1)))
            ]
        };
        var rd = _sim.Simulate(dark);
        var rl = _sim.Simulate(light);
        Assert.True(rd.Ok && rl.Ok);
        Assert.True(Math.Abs(rd.DcOp!.BranchCurrents["LDR"]) < Math.Abs(rl.DcOp!.BranchCurrents["LDR"]));
    }

    [Fact]
    public void Buzzer_Conducts_When_ForwardBiased()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "nb")), P(("r", 220))),
                El("BZ1", "buzzer", Pins(("a", "nb"), ("c", "gnd")), P(("vf", 1), ("ron", 50)))
            ]
        };
        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(result.DcOp!.BranchCurrents["BZ1"] > 0.01);
    }

    [Fact]
    public void DcMotor_Draws_When_VoltageAboveStart()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("M1", "dc_motor", Pins(("a", "n1"), ("b", "gnd")), P(("ron", 10), ("vStart", 1)))
            ]
        };
        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["M1"]) > 0.2);
    }

    [Fact]
    public void ArduinoDio_OutputHigh_DrivesLed()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El(
                    "D2",
                    "arduino_dio",
                    Pins(("sig", "sig"), ("gnd", "gnd")),
                    P(("mode", 1), ("level", 1), ("vHigh", 5), ("ron", 40))
                ),
                El("R1", "resistor", Pins(("a", "sig"), ("b", "led")), P(("r", 220))),
                El("D1", "led", Pins(("a", "led"), ("c", "gnd")), P(("vf", 2), ("ron", 20)))
            ]
        };
        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(result.DcOp!.BranchCurrents["D1"] > 0.005);
    }

    [Fact]
    public void BurnedBuzzer_IsOpenCircuit()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El("R1", "resistor", Pins(("a", "n1"), ("b", "nb")), P(("r", 10))),
                El(
                    "BZ1",
                    "buzzer",
                    Pins(("a", "nb"), ("c", "gnd")),
                    P(("vf", 1), ("ron", 50)),
                    new Dictionary<string, bool> { ["burned"] = true }
                )
            ]
        };
        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["BZ1"]) < 1e-9);
    }

    [Fact]
    public void BurnedLdr_IsOpenCircuit()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El(
                    "LDR",
                    "ldr",
                    Pins(("a", "n1"), ("b", "gnd")),
                    P(("rDark", 1000), ("rLight", 100), ("light", 1)),
                    new Dictionary<string, bool> { ["burned"] = true }
                )
            ]
        };
        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["LDR"]) < 1e-9);
    }

    [Fact]
    public void BurnedDcMotor_IsOpenCircuit()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("V1", "battery", Pins(("p", "n1"), ("n", "gnd")), P(("v", 5))),
                El(
                    "M1",
                    "dc_motor",
                    Pins(("a", "n1"), ("b", "gnd")),
                    P(("ron", 10), ("vStart", 1)),
                    new Dictionary<string, bool> { ["burned"] = true }
                )
            ]
        };
        var result = _sim.Simulate(circuit);
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        Assert.True(Math.Abs(result.DcOp!.BranchCurrents["M1"]) < 1e-9);
    }

    [Fact]
    public void Ne555_Astable_Oscillates_Output()
    {
        var circuit = new Circuit
        {
            Ground = "gnd",
            Elements =
            [
                El("VCC", "battery", Pins(("p", "vcc"), ("n", "gnd")), P(("v", 5))),
                El("RA", "resistor", Pins(("a", "vcc"), ("b", "dis")), P(("r", 10000))),
                El("RB", "resistor", Pins(("a", "dis"), ("b", "thr")), P(("r", 10000))),
                El("CT", "capacitor", Pins(("a", "thr"), ("b", "gnd")), P(("c", 4.7e-7))),
                El("CC", "capacitor", Pins(("a", "ctrl"), ("b", "gnd")), P(("c", 1e-8))),
                El("R1", "resistor", Pins(("a", "out"), ("b", "led")), P(("r", 220))),
                El("D1", "led", Pins(("a", "led"), ("c", "gnd")), P(("vf", 2), ("ron", 5))),
                El(
                    "U1",
                    "ne555",
                    Pins(
                        ("gnd", "gnd"),
                        ("trig", "thr"),
                        ("out", "out"),
                        ("reset", "vcc"),
                        ("ctrl", "ctrl"),
                        ("thr", "thr"),
                        ("dis", "dis"),
                        ("vcc", "vcc")
                    ),
                    P(("ron", 10))
                )
            ]
        };

        var result = _sim.Simulate(circuit, "tran", new AnalysisOptions { TStop = 0.05, Dt = 5e-5 });
        Assert.True(result.Ok, string.Join("; ", result.Errors));
        var outSeries = result.Tran!.NodeVoltages.First(s => s.Id == "out").Values;
        Assert.Contains(outSeries, v => v > 3.5);
        Assert.Contains(outSeries, v => v < 0.5);
        var ledSeries = result.Tran.BranchCurrents.First(s => s.Id == "D1").Values;
        Assert.Contains(ledSeries, i => i > 0.005);
        Assert.Contains(ledSeries, i => i < 1e-4);
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
