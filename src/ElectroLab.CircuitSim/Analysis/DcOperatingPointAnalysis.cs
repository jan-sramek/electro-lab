using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;
using ElectroLab.CircuitSim.Results;
using ElectroLab.CircuitSim.Validation;

namespace ElectroLab.CircuitSim.Analysis;

public sealed class DcOperatingPointAnalysis : IAnalysis
{
    /// <summary>Maximum bias-loop iterations before giving up with a warning.</summary>
    public const int MaxBiasIterations = 6;

    public string Type => "dcOp";

    public SimulationResult Run(Circuit circuit, DeviceModelRegistry registry, AnalysisOptions? options = null)
    {
        var errors = NetlistValidator.Validate(circuit, registry);
        if (errors.Count > 0)
            return SimulationResult.Fail(Type, errors.ToArray());

        var models = new List<(ElementInstance el, IDeviceModel model)>();

        foreach (var el in circuit.Elements)
        {
            if (!registry.TryGet(el.Model, out var model))
                return SimulationResult.Fail(Type, $"Unknown model '{el.Model}' on '{el.Id}'.");
            models.Add((el, model));
        }

        var nodes = PiecewiseBias.CollectNodes(circuit, models);
        var ctx = new StampContext(nodes, circuit.Ground);
        foreach (var (el, model) in models)
            model.RegisterExtras(el, ctx);

        var hint = new DcBiasHint();
        PiecewiseBias.Initialize(models, hint);

        string? lastError = null;
        double[]? solution = null;
        var warnings = new List<string>();

        foreach (var (el, _) in models)
        {
            if (el.Model.Equals("capacitor", StringComparison.OrdinalIgnoreCase))
                warnings.Add($"{el.Id}: capacitor is open-circuit in DC analysis (use Transient for charging).");
        }

        for (var iter = 0; iter < MaxBiasIterations; iter++)
        {
            ctx = new StampContext(nodes, circuit.Ground);
            foreach (var (el, model) in models)
                model.RegisterExtras(el, ctx);

            ctx.BeginStamp();
            foreach (var (el, model) in models)
                model.ContributeDc(el, ctx, hint);
            ctx.StampGminToGround();

            if (!ctx.TrySolve(out solution, out lastError))
                return SimulationResult.Fail(Type, lastError ?? "Solve failed.");

            if (!PiecewiseBias.Update(models, ctx, solution, hint))
                break;

            if (iter == MaxBiasIterations - 1)
                warnings.Add(PiecewiseBias.NotSettledWarning);
        }

        PiecewiseBias.AddRailWarnings(hint, warnings);

        var voltages = new Dictionary<string, double>(StringComparer.Ordinal)
        {
            [circuit.Ground] = 0
        };
        foreach (var node in ctx.Nodes)
            voltages[node] = ctx.NodeVoltage(solution!, node);

        var currents = new Dictionary<string, double>(StringComparer.Ordinal);
        foreach (var (el, model) in models)
        {
            var i = model.BranchCurrent(el, ctx, solution!, hint);
            if (i is double amps)
                currents[el.Id] = amps;
        }

        foreach (var (el, _) in models)
        {
            if (!el.Model.Equals("inductor", StringComparison.OrdinalIgnoreCase)) continue;
            if (!currents.TryGetValue(el.Id, out var reported) || Math.Abs(reported) >= 1e-6) continue;
            var est = SeriesLoopCurrent.NeighborBranchCurrent(el, models, ctx, solution!, hint);
            if (est is double amps)
                currents[el.Id] = amps;
        }

        return new SimulationResult
        {
            Ok = true,
            AnalysisType = Type,
            Warnings = warnings,
            DcOp = new DcOpResult
            {
                NodeVoltages = voltages,
                BranchCurrents = currents
            }
        };
    }
}
