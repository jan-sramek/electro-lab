using System.Numerics;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching pulse voltage: v1 until td, then v2 for pw, then v1.
/// Optional <c>period</c> &gt; 0 repeats the high pulse every period (PWM for buck/boost demos).
/// DC uses v1 (initial).
/// </summary>
public sealed class PulseSourceModel : IDeviceModel
{
    public string ModelKey => "pulse_source";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("p") || !element.Pins.ContainsKey("n"))
            errors.Add($"{element.Id}: pulse_source requires pins p, n.");
        foreach (var key in new[] { "v1", "v2", "td", "pw" })
        {
            if (!element.Params.ContainsKey(key))
                errors.Add($"{element.Id}: pulse_source requires params.{key}.");
        }
        if (element.Params.TryGetValue("td", out var td) && td < 0)
            errors.Add($"{element.Id}: pulse_source params.td must be >= 0.");
        if (element.Params.TryGetValue("pw", out var pw) && pw < 0)
            errors.Add($"{element.Id}: pulse_source params.pw must be >= 0.");
        if (element.Params.TryGetValue("period", out var period) && period < 0)
            errors.Add($"{element.Id}: pulse_source params.period must be >= 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
        => ctx.StampVoltageSource(element.Id, element.Pins["p"], element.Pins["n"], element.Params["v1"]);

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
        // Pulse source has no AC component in this teaching model — modeled as an AC short.
        => ctx.StampVoltageSource(element.Id, element.Pins["p"], element.Pins["n"], Complex.Zero);

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    private static double VoltageAt(ElementInstance element, double t)
    {
        var v1 = element.Params["v1"];
        var v2 = element.Params["v2"];
        var td = element.Params["td"];
        var pw = element.Params["pw"];
        var period = element.Params.GetValueOrDefault("period", 0);
        if (t < td) return v1;
        if (period > 0)
        {
            var phase = (t - td) % period;
            if (phase < 0) phase += period;
            return phase < pw ? v2 : v1;
        }
        if (t < td + pw) return v2;
        return v1;
    }
}
