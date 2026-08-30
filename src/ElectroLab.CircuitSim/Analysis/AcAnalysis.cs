using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;
using ElectroLab.CircuitSim.Results;
using ElectroLab.CircuitSim.Validation;

namespace ElectroLab.CircuitSim.Analysis;

/// <summary>
/// Teaching AC (phasor / small-signal) analysis at one frequency, or a log sweep between
/// options.FStart and options.FStop. Linear devices (resistor, capacitor, inductor,
/// potentiometer, switch, battery/pulse as an AC short, ac_source, op_amp) are stamped with
/// their frequency-dependent admittance. Nonlinear teaching devices (led, diode, bjt_npn, relay
/// contacts) are left open with a warning, since small-signal linearization around a DC bias
/// point is out of scope for this v1. Relay coil resistance is still stamped in AC.
/// </summary>
public sealed class AcAnalysis : IAnalysis
{
    private static readonly string[] NonlinearModels = ["led", "diode", "bjt_npn", "relay"];

    public string Type => "ac";

    public SimulationResult Run(Circuit circuit, DeviceModelRegistry registry, AnalysisOptions? options = null)
    {
        var opts = options ?? new AnalysisOptions();

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

        var freqErrors = new List<string>();
        var freqs = BuildFrequencyList(opts, freqErrors);
        if (freqErrors.Count > 0)
            return SimulationResult.Fail(Type, freqErrors.ToArray());
        if (freqs.Count == 0)
            return SimulationResult.Fail(Type, "ac requires options.freq > 0, or fStart/fStop > 0.");

        var nodes = CollectNodes(circuit, models);

        var warnings = new List<string>();
        foreach (var (el, _) in models)
        {
            if (NonlinearModels.Contains(el.Model, StringComparer.OrdinalIgnoreCase))
                warnings.Add($"{el.Id}: '{el.Model}' is nonlinear; AC analysis treats it as open (small-signal bias not modeled in v1).");
        }

        var points = new List<AcPoint>();
        foreach (var f in freqs)
        {
            var omega = 2 * Math.PI * f;
            var ctx = new ComplexStampContext(nodes, circuit.Ground);
            foreach (var (el, model) in models)
                model.RegisterExtrasAc(el, ctx);

            ctx.BeginStamp();
            foreach (var (el, model) in models)
                model.ContributeAc(el, ctx, omega);

            if (!ctx.TrySolve(out var solution, out var solveError))
                return SimulationResult.Fail(Type, solveError ?? $"AC solve failed at f={f} Hz.");

            var nodeVoltages = new Dictionary<string, PhasorValue>(StringComparer.Ordinal)
            {
                [circuit.Ground] = new PhasorValue { Mag = 0, PhaseDeg = 0 }
            };
            foreach (var node in ctx.Nodes)
                nodeVoltages[node] = ToPhasor(ctx.NodeVoltage(solution, node));

            var branchCurrents = new Dictionary<string, PhasorValue>(StringComparer.Ordinal);
            foreach (var (el, model) in models)
            {
                var i = model.BranchCurrentAc(el, ctx, solution, omega);
                if (i is Complex c)
                    branchCurrents[el.Id] = ToPhasor(c);
            }

            points.Add(new AcPoint
            {
                Frequency = f,
                NodeVoltages = nodeVoltages,
                BranchCurrents = branchCurrents
            });
        }

        return new SimulationResult
        {
            Ok = true,
            AnalysisType = Type,
            Warnings = warnings,
            Ac = new AcResult { Points = points }
        };
    }

    private static PhasorValue ToPhasor(Complex v) => new()
    {
        Mag = v.Magnitude,
        PhaseDeg = v.Phase * 180.0 / Math.PI
    };

    private static List<double> BuildFrequencyList(AnalysisOptions opts, List<string> errors)
    {
        if (opts.FStart is double fStart && opts.FStop is double fStop)
        {
            if (fStart <= 0 || fStop <= 0)
            {
                errors.Add("ac requires fStart > 0 and fStop > 0.");
                return [];
            }

            if (fStop < fStart)
            {
                errors.Add("ac requires fStop >= fStart.");
                return [];
            }

            if (Math.Abs(fStop - fStart) < 1e-12)
                return [fStart];

            var pointsPerDecade = opts.PointsPerDecade > 0 ? opts.PointsPerDecade : 10;
            var decades = Math.Log10(fStop / fStart);
            var totalPoints = Math.Max(2, (int)Math.Round(decades * pointsPerDecade) + 1);

            var freqs = new List<double>(totalPoints);
            for (var i = 0; i < totalPoints; i++)
                freqs.Add(fStart * Math.Pow(10, decades * i / (totalPoints - 1)));
            freqs[^1] = fStop;
            return freqs;
        }

        return opts.Freq > 0 ? [opts.Freq] : [];
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
}
