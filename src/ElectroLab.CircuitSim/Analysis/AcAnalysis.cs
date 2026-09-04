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
/// their frequency-dependent admittance. Nonlinear teaching devices (led, diode, bjt_npn, nmos, ne555, relay
/// contacts) are left open with a warning, since small-signal linearization around a DC bias
/// point is out of scope for this v1. Relay coil resistance is still stamped in AC.
/// </summary>
public sealed class AcAnalysis : IAnalysis
{
    private static readonly string[] NonlinearModels = ["led", "diode", "bjt_npn", "nmos", "ne555", "relay"];

    /// <summary>Hard cap on sweep density.</summary>
    public const int MaxPointsPerDecade = 200;

    /// <summary>Hard cap on total swept frequencies (each point is a dense complex solve).</summary>
    public const int MaxTotalPoints = 2000;

    public string Type => "ac";

    /// <summary>
    /// Number of points a log sweep would produce (computed in double, so it cannot overflow),
    /// or -1 when the arguments are invalid.
    /// </summary>
    public static double SweepPointCount(double fStart, double fStop, int pointsPerDecade)
    {
        if (!double.IsFinite(fStart) || !double.IsFinite(fStop) || fStart <= 0 || fStop <= 0 || fStop < fStart || pointsPerDecade <= 0)
            return -1;
        if (Math.Abs(fStop - fStart) < 1e-12)
            return 1;
        var decades = Math.Log10(fStop / fStart);
        return Math.Max(2, Math.Round(decades * pointsPerDecade) + 1);
    }

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

        var nodes = PiecewiseBias.CollectNodes(circuit, models);

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
            if (!double.IsFinite(fStart) || !double.IsFinite(fStop) || fStart <= 0 || fStop <= 0)
            {
                errors.Add("ac requires finite fStart > 0 and fStop > 0.");
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
            if (pointsPerDecade > MaxPointsPerDecade)
            {
                errors.Add($"ac pointsPerDecade {pointsPerDecade} exceeds the limit of {MaxPointsPerDecade}.");
                return [];
            }

            var decades = Math.Log10(fStop / fStart);
            var requested = SweepPointCount(fStart, fStop, pointsPerDecade);
            if (requested > MaxTotalPoints)
            {
                errors.Add($"ac sweep would produce {requested.ToString("0", System.Globalization.CultureInfo.InvariantCulture)} points; the limit is {MaxTotalPoints}. Narrow fStart/fStop or lower pointsPerDecade.");
                return [];
            }

            var totalPoints = (int)requested;

            var freqs = new List<double>(totalPoints);
            for (var i = 0; i < totalPoints; i++)
                freqs.Add(fStart * Math.Pow(10, decades * i / (totalPoints - 1)));
            freqs[^1] = fStop;
            return freqs;
        }

        return double.IsFinite(opts.Freq) && opts.Freq > 0 ? [opts.Freq] : [];
    }
}
