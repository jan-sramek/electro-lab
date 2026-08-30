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

        var models = new List<(ElementInstance el, IDeviceModel model)>();

        foreach (var el in circuit.Elements)
        {
            if (!registry.TryGet(el.Model, out var model))
                return SimulationResult.Fail(Type, $"Unknown model '{el.Model}' on '{el.Id}'.");
            models.Add((el, model));
        }

        var nodes = CollectNodes(circuit, models);
        var ctx = new StampContext(nodes, circuit.Ground);
        foreach (var (el, model) in models)
            model.RegisterExtras(el, ctx);

        var hint = new DcBiasHint();
        foreach (var (el, _) in models)
        {
            if (IsPiecewiseDiode(el.Model))
                hint.LedOn[el.Id] = true;
            if (IsPiecewiseBjt(el.Model))
                hint.BjtOn[el.Id] = true;
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
                if (IsPiecewiseDiode(el.Model))
                {
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
                else if (IsPiecewiseBjt(el.Model))
                {
                    var vb = ctx.NodeVoltage(solution, el.Pins["b"]);
                    var ve = ctx.NodeVoltage(solution, el.Pins["e"]);
                    var vf = el.Params["vf"];
                    var rb = el.Params["rb"];
                    var previouslyOn = hint.BjtOn[el.Id];
                    var baseCurrent = previouslyOn ? (vb - ve - vf) / rb : 0;
                    var nextOn = previouslyOn ? baseCurrent > 1e-12 : vb - ve >= vf;

                    if (nextOn != previouslyOn)
                    {
                        hint.BjtOn[el.Id] = nextOn;
                        changed = true;
                    }
                }
                else if (IsOpAmp(el.Model))
                {
                    if (OpAmpModel.UpdateRailBias(el, ctx, solution!, hint))
                        changed = true;
                }
            }

            if (!changed)
                break;

            if (iter == 5)
                warnings.Add("Diode/LED/BJT/op-amp bias iteration did not fully settle; using last state.");
        }

        foreach (var (id, rail) in hint.OpAmpRail)
        {
            if (rail == 0) continue;
            var side = rail > 0 ? "vMax" : "vMin";
            warnings.Add($"{id}: op-amp output clamped to teaching rail ({side}).");
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

    private static HashSet<string> CollectNodes(Circuit circuit, List<(ElementInstance el, IDeviceModel model)> models)
    {
        var nodes = new HashSet<string>(StringComparer.Ordinal) { circuit.Ground };
        foreach (var el in circuit.Elements)
        {
            foreach (var n in el.Pins.Values)
                nodes.Add(n);
        }

        foreach (var (el, model) in models)
        {
            foreach (var n in model.ExtraNodes(el))
                nodes.Add(n);
        }

        return nodes;
    }

    private static bool IsPiecewiseDiode(string model) =>
        model.Equals("led", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("diode", StringComparison.OrdinalIgnoreCase);

    private static bool IsPiecewiseBjt(string model) =>
        model.Equals("bjt_npn", StringComparison.OrdinalIgnoreCase);

    private static bool IsOpAmp(string model) =>
        model.Equals("op_amp", StringComparison.OrdinalIgnoreCase);
}
