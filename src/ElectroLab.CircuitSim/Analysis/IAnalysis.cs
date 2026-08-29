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
}
