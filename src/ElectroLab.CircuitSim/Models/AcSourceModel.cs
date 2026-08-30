using System.Numerics;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// AC excitation: 0 V in DC; sine <c>mag·sin(2π·freq·t + phase)</c> in transient when
/// <c>params.freq</c> &gt; 0; phasor <c>mag∠phase</c> in AC analysis (independent of sweep ω).
/// </summary>
public sealed class AcSourceModel : IDeviceModel
{
    public string ModelKey => "ac_source";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("p") || !element.Pins.ContainsKey("n"))
            errors.Add($"{element.Id}: ac_source requires pins p, n.");
        if (!element.Params.TryGetValue("mag", out var mag) || mag < 0)
            errors.Add($"{element.Id}: ac_source requires params.mag >= 0.");
        if (element.Params.TryGetValue("freq", out var freq) && freq < 0)
            errors.Add($"{element.Id}: ac_source params.freq must be >= 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
        => ctx.StampVoltageSource(element.Id, element.Pins["p"], element.Pins["n"], 0);

    public void ContributeTransient(
        ElementInstance element,
        StampContext ctx,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        var v = VoltageAt(element, state.Time);
        ctx.StampVoltageSource(element.Id, element.Pins["p"], element.Pins["n"], v);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    public void RegisterExtrasAc(ElementInstance element, ComplexStampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
    {
        var mag = element.Params["mag"];
        var phaseDeg = element.Params.GetValueOrDefault("phase", 0);
        var phaseRad = phaseDeg * Math.PI / 180.0;
        var phasor = Complex.FromPolarCoordinates(mag, phaseRad);
        ctx.StampVoltageSource(element.Id, element.Pins["p"], element.Pins["n"], phasor);
    }

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    /// <summary>Sine when freq &gt; 0; otherwise 0 V (same as historical silent transient).</summary>
    internal static double VoltageAt(ElementInstance element, double t)
    {
        var mag = element.Params["mag"];
        var freq = element.Params.GetValueOrDefault("freq", 0);
        if (freq <= 0) return 0;
        var phaseDeg = element.Params.GetValueOrDefault("phase", 0);
        var phaseRad = phaseDeg * Math.PI / 180.0;
        return mag * Math.Sin(2 * Math.PI * freq * t + phaseRad);
    }
}
