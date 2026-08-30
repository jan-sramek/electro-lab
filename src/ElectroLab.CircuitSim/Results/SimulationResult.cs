using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Results;

public sealed class SimulationResult
{
    public required bool Ok { get; init; }
    public required string AnalysisType { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = [];
    public IReadOnlyList<string> Warnings { get; init; } = [];
    public DcOpResult? DcOp { get; init; }
    public TranResult? Tran { get; init; }
    public AcResult? Ac { get; init; }

    public static SimulationResult Fail(string analysisType, params string[] errors) => new()
    {
        Ok = false,
        AnalysisType = analysisType,
        Errors = errors
    };
}

public sealed class DcOpResult
{
    public required IReadOnlyDictionary<string, double> NodeVoltages { get; init; }
    public required IReadOnlyDictionary<string, double> BranchCurrents { get; init; }
}

public sealed class TranResult
{
    public required IReadOnlyList<double> Time { get; init; }
    public required IReadOnlyList<TranSeries> NodeVoltages { get; init; }
    public required IReadOnlyList<TranSeries> BranchCurrents { get; init; }
}

public sealed class TranSeries
{
    public required string Id { get; init; }
    public required IReadOnlyList<double> Values { get; init; }
}

/// <summary>
/// AC (phasor) result: one point per frequency. A single-frequency run yields one point;
/// an FStart/FStop sweep yields one point per swept frequency.
/// </summary>
public sealed class AcResult
{
    public required IReadOnlyList<AcPoint> Points { get; init; }
}

public sealed class AcPoint
{
    public required double Frequency { get; init; }
    public required IReadOnlyDictionary<string, PhasorValue> NodeVoltages { get; init; }
    public required IReadOnlyDictionary<string, PhasorValue> BranchCurrents { get; init; }
}

public sealed class PhasorValue
{
    public required double Mag { get; init; }
    public required double PhaseDeg { get; init; }
}
