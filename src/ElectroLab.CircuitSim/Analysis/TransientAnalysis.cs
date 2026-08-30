using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;
using ElectroLab.CircuitSim.Results;
using ElectroLab.CircuitSim.Validation;

namespace ElectroLab.CircuitSim.Analysis;

/// <summary>
/// Teaching transient: fixed-step Backward Euler with companion models for C and L.
/// </summary>
public sealed class TransientAnalysis : IAnalysis
{
    public string Type => "tran";

    public SimulationResult Run(Circuit circuit, DeviceModelRegistry registry, AnalysisOptions? options = null)
    {
        var opts = options ?? new AnalysisOptions();
        if (opts.Dt <= 0 || opts.TStop <= 0 || opts.Dt > opts.TStop)
            return SimulationResult.Fail(Type, "tran requires tStop > 0 and 0 < dt <= tStop.");

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

        var state = new TransientState();
        foreach (var (el, _) in models)
        {
            if (el.Model.Equals("capacitor", StringComparison.OrdinalIgnoreCase))
                state.CapVoltage[el.Id] = 0;
            if (el.Model.Equals("inductor", StringComparison.OrdinalIgnoreCase))
                state.IndCurrent[el.Id] = 0;
            if (IsPiecewiseDiode(el.Model))
                state.Bias.LedOn[el.Id] = true;
            if (IsPiecewiseBjt(el.Model))
                state.Bias.BjtOn[el.Id] = true;
        }

        var times = new List<double>();
        var voltageSeries = nodes.ToDictionary(n => n, _ => new List<double>(), StringComparer.Ordinal);
        var currentSeries = models.ToDictionary(m => m.el.Id, _ => new List<double>(), StringComparer.Ordinal);

        var warnings = new List<string>();
        var steps = (int)Math.Ceiling(opts.TStop / opts.Dt);
        if (steps > 20_000)
            return SimulationResult.Fail(Type, "tran step count exceeds 20000; increase dt or reduce tStop.");

        for (var step = 0; step <= steps; step++)
        {
            var t = Math.Min(step * opts.Dt, opts.TStop);
            state.Time = t;
            var ctx = new StampContext(nodes, circuit.Ground);
            foreach (var (el, model) in models)
                model.RegisterExtras(el, ctx);

            ctx.BeginStamp();
            foreach (var (el, model) in models)
                model.ContributeTransient(el, ctx, state.Bias, state, opts.Dt);

            if (!ctx.TrySolve(out var solution, out var lastError))
                return SimulationResult.Fail(Type, lastError ?? $"Solve failed at t={t}.");

            // Settle piecewise diodes/BJTs a few times within the step
            for (var iter = 0; iter < 4; iter++)
            {
                var changed = false;
                foreach (var (el, model) in models)
                {
                    if (IsPiecewiseDiode(el.Model))
                    {
                        var va = ctx.NodeVoltage(solution, el.Pins["a"]);
                        var vc = ctx.NodeVoltage(solution, el.Pins["c"]);
                        var vf = el.Params["vf"];
                        var current = model.BranchCurrent(el, ctx, solution, state.Bias) ?? 0;
                        var previouslyOn = state.Bias.LedOn[el.Id];
                        var nextOn = previouslyOn ? current > 1e-12 : va - vc >= vf;
                        if (nextOn != previouslyOn)
                        {
                            state.Bias.LedOn[el.Id] = nextOn;
                            changed = true;
                        }
                    }
                    else if (IsPiecewiseBjt(el.Model))
                    {
                        var vb = ctx.NodeVoltage(solution, el.Pins["b"]);
                        var ve = ctx.NodeVoltage(solution, el.Pins["e"]);
                        var vf = el.Params["vf"];
                        var rb = el.Params["rb"];
                        var previouslyOn = state.Bias.BjtOn[el.Id];
                        var baseCurrent = previouslyOn ? (vb - ve - vf) / rb : 0;
                        var nextOn = previouslyOn ? baseCurrent > 1e-12 : vb - ve >= vf;
                        if (nextOn != previouslyOn)
                        {
                            state.Bias.BjtOn[el.Id] = nextOn;
                            changed = true;
                        }
                    }
                }

                if (!changed) break;

                ctx = new StampContext(nodes, circuit.Ground);
                foreach (var (el, model) in models)
                    model.RegisterExtras(el, ctx);
                ctx.BeginStamp();
                foreach (var (el, model) in models)
                    model.ContributeTransient(el, ctx, state.Bias, state, opts.Dt);
                if (!ctx.TrySolve(out solution, out lastError))
                    return SimulationResult.Fail(Type, lastError ?? $"Solve failed at t={t}.");
            }

            times.Add(t);
            foreach (var node in nodes)
                voltageSeries[node].Add(ctx.NodeVoltage(solution, node));

            foreach (var (el, model) in models)
            {
                var i = model.BranchCurrentTransient(el, ctx, solution, state.Bias, state, opts.Dt) ?? 0;
                currentSeries[el.Id].Add(i);

                if (el.Model.Equals("capacitor", StringComparison.OrdinalIgnoreCase))
                {
                    var va = ctx.NodeVoltage(solution, el.Pins["a"]);
                    var vb = ctx.NodeVoltage(solution, el.Pins["b"]);
                    state.CapVoltage[el.Id] = va - vb;
                }
                else if (el.Model.Equals("inductor", StringComparison.OrdinalIgnoreCase))
                {
                    state.IndCurrent[el.Id] = i;
                }
            }
        }

        return new SimulationResult
        {
            Ok = true,
            AnalysisType = Type,
            Warnings = warnings,
            Tran = new TranResult
            {
                Time = times,
                NodeVoltages = voltageSeries
                    .Select(kv => new TranSeries { Id = kv.Key, Values = kv.Value })
                    .ToList(),
                BranchCurrents = currentSeries
                    .Select(kv => new TranSeries { Id = kv.Key, Values = kv.Value })
                    .ToList()
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
}

/// <summary>Companion-model state carried between transient steps.</summary>
public sealed class TransientState
{
    public double Time { get; set; }
    public DcBiasHint Bias { get; } = new();
    public Dictionary<string, double> CapVoltage { get; } = new(StringComparer.Ordinal);
    public Dictionary<string, double> IndCurrent { get; } = new(StringComparer.Ordinal);
}
