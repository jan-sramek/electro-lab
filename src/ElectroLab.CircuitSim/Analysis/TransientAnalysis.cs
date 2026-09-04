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
    /// <summary>Hard cap on ceil(tStop/dt); each step is a dense O(n³) solve.</summary>
    public const int MaxSteps = 20_000;

    /// <summary>Bias-loop iterations per transient step (and for the initFromDc seed).</summary>
    public const int MaxBiasIterations = 4;

    public string Type => "tran";

    /// <summary>Number of steps a (tStop, dt) pair would produce, or -1 when the pair is invalid.</summary>
    public static long StepCount(double tStop, double dt)
    {
        if (!double.IsFinite(tStop) || !double.IsFinite(dt) || dt <= 0 || tStop <= 0 || dt > tStop)
            return -1;
        var steps = Math.Ceiling(tStop / dt);
        return steps > long.MaxValue ? long.MaxValue : (long)steps;
    }

    public SimulationResult Run(Circuit circuit, DeviceModelRegistry registry, AnalysisOptions? options = null)
    {
        var opts = options ?? new AnalysisOptions();
        var stepCount = StepCount(opts.TStop, opts.Dt);
        if (stepCount < 0)
            return SimulationResult.Fail(Type, "tran requires tStop > 0 and 0 < dt <= tStop.");
        if (stepCount > MaxSteps)
            return SimulationResult.Fail(Type, $"tran step count exceeds {MaxSteps}; increase dt or reduce tStop.");

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

        var state = new TransientState();
        foreach (var (el, _) in models)
        {
            if (el.Model.Equals("capacitor", StringComparison.OrdinalIgnoreCase))
            {
                // Optional params.ic = initial V(a)-V(b); default 0. Overridden by InitFromDc.
                el.Params.TryGetValue("ic", out var ic);
                state.CapVoltage[el.Id] = ic;
            }
            if (el.Model.Equals("inductor", StringComparison.OrdinalIgnoreCase))
            {
                // Optional params.ic = initial current a→b (A); default 0. Overridden by InitFromDc.
                el.Params.TryGetValue("ic", out var ic);
                state.IndCurrent[el.Id] = ic;
            }
        }
        PiecewiseBias.Initialize(models, state.Bias);

        var warnings = new List<string>();
        if (opts.InitFromDc)
        {
            if (!TrySeedFromDc(circuit, models, nodes, state, warnings, out var seedError))
                return SimulationResult.Fail(Type, seedError ?? "initFromDc DC seed failed.");
            warnings.Add("tran: capacitor/inductor state seeded from DC (initFromDc).");
        }

        var times = new List<double>();
        var voltageSeries = nodes.ToDictionary(n => n, _ => new List<double>(), StringComparer.Ordinal);
        var currentSeries = models.ToDictionary(m => m.el.Id, _ => new List<double>(), StringComparer.Ordinal);
        var steps = (int)stepCount;
        var settleWarned = false;

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
            ctx.StampGminToGround();

            if (!ctx.TrySolve(out var solution, out var lastError))
                return SimulationResult.Fail(Type, lastError ?? $"Solve failed at t={t}.");

            // Settle piecewise devices a few times within the step (same rules as dcOp).
            for (var iter = 0; iter < MaxBiasIterations; iter++)
            {
                if (!PiecewiseBias.Update(models, ctx, solution, state.Bias))
                    break;

                ctx = new StampContext(nodes, circuit.Ground);
                foreach (var (el, model) in models)
                    model.RegisterExtras(el, ctx);
                ctx.BeginStamp();
                foreach (var (el, model) in models)
                    model.ContributeTransient(el, ctx, state.Bias, state, opts.Dt);
                ctx.StampGminToGround();
                if (!ctx.TrySolve(out solution, out lastError))
                    return SimulationResult.Fail(Type, lastError ?? $"Solve failed at t={t}.");

                if (iter == MaxBiasIterations - 1 && !settleWarned)
                {
                    // Same rule as dcOp; reported once per run so a chattering device cannot flood the response.
                    warnings.Add($"tran (first at t={t:g6} s): {PiecewiseBias.NotSettledWarning}");
                    settleWarned = true;
                }
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

        PiecewiseBias.AddRailWarnings(state.Bias, warnings);

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

    /// <summary>
    /// DC operating point at switch timeline t=0; copy C voltages and L currents into state.
    /// Uses the same bias initialisation and update rules as <see cref="DcOperatingPointAnalysis"/>.
    /// </summary>
    private static bool TrySeedFromDc(
        Circuit circuit,
        List<(ElementInstance el, IDeviceModel model)> models,
        HashSet<string> nodes,
        TransientState state,
        List<string> warnings,
        out string? error)
    {
        error = null;
        var ctx = new StampContext(nodes, circuit.Ground);
        foreach (var (el, model) in models)
            model.RegisterExtras(el, ctx);

        ctx.BeginStamp();
        foreach (var (el, model) in models)
            model.ContributeDc(el, ctx, state.Bias);
        ctx.StampGminToGround();

        if (!ctx.TrySolve(out var solution, out var lastError))
        {
            error = lastError ?? "initFromDc: DC seed solve failed.";
            return false;
        }

        // Settle piecewise devices (same rules as dcOp; DC iteration budget so the seed matches dcOp).
        for (var iter = 0; iter < DcOperatingPointAnalysis.MaxBiasIterations; iter++)
        {
            if (!PiecewiseBias.Update(models, ctx, solution, state.Bias))
                break;

            ctx = new StampContext(nodes, circuit.Ground);
            foreach (var (el, model) in models)
                model.RegisterExtras(el, ctx);
            ctx.BeginStamp();
            foreach (var (el, model) in models)
                model.ContributeDc(el, ctx, state.Bias);
            ctx.StampGminToGround();
            if (!ctx.TrySolve(out solution, out lastError))
            {
                error = lastError ?? "initFromDc: DC seed settle failed.";
                return false;
            }

            if (iter == DcOperatingPointAnalysis.MaxBiasIterations - 1)
                warnings.Add($"initFromDc: {PiecewiseBias.NotSettledWarning}");
        }

        foreach (var (el, model) in models)
        {
            if (el.Model.Equals("capacitor", StringComparison.OrdinalIgnoreCase))
            {
                var va = ctx.NodeVoltage(solution, el.Pins["a"]);
                var vb = ctx.NodeVoltage(solution, el.Pins["b"]);
                state.CapVoltage[el.Id] = va - vb;
            }
            else if (el.Model.Equals("inductor", StringComparison.OrdinalIgnoreCase))
            {
                var reported = model.BranchCurrent(el, ctx, solution, state.Bias) ?? 0;
                if (Math.Abs(reported) < 1e-6)
                {
                    var est = SeriesLoopCurrent.NeighborBranchCurrent(el, models, ctx, solution, state.Bias);
                    state.IndCurrent[el.Id] = est ?? 0;
                }
                else
                    state.IndCurrent[el.Id] = reported;
            }
        }

        return true;
    }
}

/// <summary>Companion-model state carried between transient steps.</summary>
public sealed class TransientState
{
    public double Time { get; set; }
    public DcBiasHint Bias { get; } = new();
    public Dictionary<string, double> CapVoltage { get; } = new(StringComparer.Ordinal);
    public Dictionary<string, double> IndCurrent { get; } = new(StringComparer.Ordinal);
}
