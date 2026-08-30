using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;
using ElectroLab.CircuitSim.Results;

namespace ElectroLab.CircuitSim;

public sealed class CircuitSimulator
{
    private readonly DeviceModelRegistry _registry;
    private readonly Dictionary<string, IAnalysis> _analyses;

    public CircuitSimulator(DeviceModelRegistry? registry = null, IEnumerable<IAnalysis>? analyses = null)
    {
        _registry = registry ?? new DeviceModelRegistry();
        var provided = analyses?.ToList();
        var list = provided is { Count: > 0 }
            ? provided
            : [new DcOperatingPointAnalysis(), new TransientAnalysis(), new AcAnalysis()];
        _analyses = list.ToDictionary(a => a.Type, StringComparer.OrdinalIgnoreCase);
    }

    public SimulationResult Simulate(Circuit circuit, string analysisType = "dcOp", AnalysisOptions? options = null)
    {
        if (!_analyses.TryGetValue(analysisType, out var analysis))
            return SimulationResult.Fail(analysisType, $"Unsupported analysis type '{analysisType}'.");

        return analysis.Run(circuit, _registry, options);
    }
}
