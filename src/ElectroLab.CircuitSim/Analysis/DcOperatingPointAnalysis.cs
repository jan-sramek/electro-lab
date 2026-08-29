using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;
using ElectroLab.CircuitSim.Results;
using ElectroLab.CircuitSim.Validation;

namespace ElectroLab.CircuitSim.Analysis;

public sealed class DcOperatingPointAnalysis : IAnalysis
{
    public string Type => "dcOp";

    public SimulationResult Run(Circuit circuit, DeviceModelRegistry registry, AnalysisOptions? options = null)
    {
        var errors = NetlistValidator.Validate(circuit, registry);
        if (errors.Count > 0)
            return SimulationResult.Fail(Type, errors.ToArray());

        var nodes = CollectNodes(circuit);
        var ctx = new StampContext(nodes, circuit.Ground);
        var models = new List<(ElementInstance el, IDeviceModel model)>();

        foreach (var el in circuit.Elements)
        {
            if (!registry.TryGet(el.Model, out var model))
                return SimulationResult.Fail(Type, $"Unknown model '{el.Model}' on '{el.Id}'.");
            models.Add((el, model));
            model.RegisterExtras(el, ctx);
        }

        var hint = new DcBiasHint();
        foreach (var (el, _) in models)
        {
            if (IsPiecewiseDiode(el.Model))
                hint.LedOn[el.Id] = true;
        }

        string? lastError = null;
        double[]? solution = null;
        var warnings = new List<string>();

        foreach (var (el, _) in models)
        {
            if (el.Model.Equals("capacitor", StringComparison.OrdinalIgnoreCase))
                warnings.Add($"{el.Id}: capacitor is open-circuit in DC analysis (use Transient for charging).");
        }

        for (var iter = 0; iter < 6; iter++)
        {
            ctx = new StampContext(nodes, circuit.Ground);
            foreach (var (el, model) in models)
                model.RegisterExtras(el, ctx);

            ctx.BeginStamp();
            foreach (var (el, model) in models)
                model.ContributeDc(el, ctx, hint);

            if (!ctx.TrySolve(out solution, out lastError))
                return SimulationResult.Fail(Type, lastError ?? "Solve failed.");

            var changed = false;
            foreach (var (el, model) in models)
            {
                if (!IsPiecewiseDiode(el.Model))
                    continue;

                var va = ctx.NodeVoltage(solution, el.Pins["a"]);
                var vc = ctx.NodeVoltage(solution, el.Pins["c"]);
                var vf = el.Params["vf"];
                var current = model.BranchCurrent(el, ctx, solution, hint) ?? 0;
                var previouslyOn = hint.LedOn[el.Id];
                var nextOn = previouslyOn ? current > 1e-12 : va - vc >= vf;

                if (nextOn != previouslyOn)
                {
                    hint.LedOn[el.Id] = nextOn;
                    changed = true;
                }
            }

            if (!changed)
                break;

            if (iter == 5)
                warnings.Add("Diode/LED bias iteration did not fully settle; using last state.");
        }

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

    private static HashSet<string> CollectNodes(Circuit circuit)
    {
        var nodes = new HashSet<string>(StringComparer.Ordinal) { circuit.Ground };
        foreach (var el in circuit.Elements)
        {
            foreach (var n in el.Pins.Values)
                nodes.Add(n);
        }

        return nodes;
    }

    private static bool IsPiecewiseDiode(string model) =>
        model.Equals("led", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("diode", StringComparison.OrdinalIgnoreCase);
}
