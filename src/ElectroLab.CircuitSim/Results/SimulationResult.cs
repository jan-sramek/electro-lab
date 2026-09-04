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

    /// <summary>
    /// True when any reported voltage, current, phasor or time value is NaN or ±Infinity.
    /// Hosts should turn such a result into a failure rather than serialize it.
    /// </summary>
    public bool HasNonFiniteValues()
    {
        if (DcOp is not null)
        {
            if (DcOp.NodeVoltages.Values.Any(v => !double.IsFinite(v))) return true;
            if (DcOp.BranchCurrents.Values.Any(v => !double.IsFinite(v))) return true;
        }

        if (Tran is not null)
        {
            if (Tran.Time.Any(v => !double.IsFinite(v))) return true;
            if (Tran.NodeVoltages.Any(s => s.Values.Any(v => !double.IsFinite(v)))) return true;
            if (Tran.BranchCurrents.Any(s => s.Values.Any(v => !double.IsFinite(v)))) return true;
        }

        if (Ac is not null)
        {
            foreach (var p in Ac.Points)
            {
                if (!double.IsFinite(p.Frequency)) return true;
                if (p.NodeVoltages.Values.Any(ph => !double.IsFinite(ph.Mag) || !double.IsFinite(ph.PhaseDeg))) return true;
                if (p.BranchCurrents.Values.Any(ph => !double.IsFinite(ph.Mag) || !double.IsFinite(ph.PhaseDeg))) return true;
            }
        }

        return false;
    }
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
