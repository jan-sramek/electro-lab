using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;
using ElectroLab.CircuitSim.Results;

namespace ElectroLab.CircuitSim.Analysis;

public interface IAnalysis
{
    string Type { get; }
    SimulationResult Run(Circuit circuit, DeviceModelRegistry registry, AnalysisOptions? options = null);
}

public sealed class AnalysisOptions
{
    public double TStop { get; init; } = 0.005;
    public double Dt { get; init; } = 5e-5;

    /// <summary>
    /// When true, seed capacitor voltages and inductor currents from a DC solve at t=0
    /// (capacitors open, inductors short) before the transient. Overrides <c>params.ic</c>.
    /// </summary>
    public bool InitFromDc { get; init; }

    /// <summary>Single-frequency AC analysis point (Hz), used when FStart/FStop are not both set.</summary>
    public double Freq { get; init; } = 1000;

    /// <summary>AC sweep start frequency (Hz). Set together with FStop to run a log sweep.</summary>
    public double? FStart { get; init; }

    /// <summary>AC sweep stop frequency (Hz). Set together with FStart to run a log sweep.</summary>
    public double? FStop { get; init; }

    /// <summary>Log-sweep density used when FStart/FStop are set.</summary>
    public int PointsPerDecade { get; init; } = 10;
}
