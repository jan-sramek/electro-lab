using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching finite-gain op-amp: Vout = clamp(gain · (Vinp − Vinn), vMin, vMax) to ground.
/// Linear region is a VCVS; at the rails it becomes a fixed voltage source (piecewise settle).
/// AC analysis stays linear (unclamped small-signal). Default rails ±15 V.
/// </summary>
public sealed class OpAmpModel : IDeviceModel
{
    public const double DefaultVMax = 15;
    public const double DefaultVMin = -15;

    public string ModelKey => "op_amp";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("inp") || !element.Pins.ContainsKey("inn") || !element.Pins.ContainsKey("out"))
            errors.Add($"{element.Id}: op_amp requires pins inp, inn, out.");
        if (element.Params.TryGetValue("gain", out var gain) && gain <= 0)
            errors.Add($"{element.Id}: op_amp params.gain must be > 0.");
        var vmax = GetVMax(element);
        var vmin = GetVMin(element);
        if (vmax <= vmin)
            errors.Add($"{element.Id}: op_amp params.vMax must be > vMin.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var rail = hint?.OpAmpRail.GetValueOrDefault(element.Id, 0) ?? 0;
        if (rail > 0)
            ctx.StampVoltageSource(element.Id, element.Pins["out"], ctx.Ground, GetVMax(element));
        else if (rail < 0)
            ctx.StampVoltageSource(element.Id, element.Pins["out"], ctx.Ground, GetVMin(element));
        else
            ctx.StampVoltageControlledVoltageSource(
                element.Id, element.Pins["out"], ctx.Ground,
                element.Pins["inp"], element.Pins["inn"], GetGain(element));
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    public void RegisterExtrasAc(ElementInstance element, ComplexStampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
        => ctx.StampVoltageControlledVoltageSource(
            element.Id, element.Pins["out"], ctx.Ground, element.Pins["inp"], element.Pins["inn"],
            new Complex(GetGain(element), 0));

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    /// <summary>
    /// Updates piecewise rail state from the latest solution. Returns true if the mode changed.
    /// </summary>
    public static bool UpdateRailBias(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint hint)
    {
        var vinp = ctx.NodeVoltage(solution, element.Pins["inp"]);
        var vinn = ctx.NodeVoltage(solution, element.Pins["inn"]);
        var ideal = GetGain(element) * (vinp - vinn);
        var vmax = GetVMax(element);
        var vmin = GetVMin(element);
        var next = ideal > vmax ? 1 : ideal < vmin ? -1 : 0;
        var prev = hint.OpAmpRail.GetValueOrDefault(element.Id, 0);
        if (next == prev) return false;
        hint.OpAmpRail[element.Id] = next;
        return true;
    }

    internal static double GetGain(ElementInstance element)
        => element.Params.TryGetValue("gain", out var g) ? g : 1e5;

    internal static double GetVMax(ElementInstance element)
        => element.Params.TryGetValue("vMax", out var v) ? v : DefaultVMax;

    internal static double GetVMin(ElementInstance element)
        => element.Params.TryGetValue("vMin", out var v) ? v : DefaultVMin;
}
