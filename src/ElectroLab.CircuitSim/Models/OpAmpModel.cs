using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching finite-gain op-amp: Vout = gain * (Vinp - Vinn), referenced to ground.
/// Modeled as an ideal VCVS from `out` to ground (no supply/rail pins — output is unclamped).
/// </summary>
public sealed class OpAmpModel : IDeviceModel
{
    public string ModelKey => "op_amp";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("inp") || !element.Pins.ContainsKey("inn") || !element.Pins.ContainsKey("out"))
            errors.Add($"{element.Id}: op_amp requires pins inp, inn, out.");
        if (element.Params.TryGetValue("gain", out var gain) && gain <= 0)
            errors.Add($"{element.Id}: op_amp params.gain must be > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
        => ctx.StampVoltageControlledVoltageSource(
            element.Id, element.Pins["out"], ctx.Ground, element.Pins["inp"], element.Pins["inn"], GetGain(element));

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

    private static double GetGain(ElementInstance element)
        => element.Params.TryGetValue("gain", out var g) ? g : 1e5;
}
