using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching LDR: resistance interpolates from rDark (light=0) to rLight (light=1).
/// BoolParams["burned"] → permanently open (teaching power overload).
/// </summary>
public sealed class LdrModel : IDeviceModel
{
    public string ModelKey => "ldr";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: ldr requires pins a, b.");
        if (!element.Params.TryGetValue("rDark", out var rd) || rd <= 0)
            errors.Add($"{element.Id}: ldr requires params.rDark > 0.");
        if (!element.Params.TryGetValue("rLight", out var rl) || rl <= 0)
            errors.Add($"{element.Id}: ldr requires params.rLight > 0.");
        if (!element.Params.TryGetValue("light", out var light) || light < 0 || light > 1)
            errors.Add($"{element.Id}: ldr requires params.light in [0, 1].");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return;

        var r = Resistance(element);
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / r);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;

        var r = Resistance(element);
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / r;
    }

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
    {
        if (DeviceBurned.IsBurned(element))
            return;
        ctx.StampAdmittance(
            element.Pins["a"],
            element.Pins["b"],
            new Complex(1.0 / Resistance(element), 0));
    }

    public Complex? BranchCurrentAc(
        ElementInstance element,
        ComplexStampContext ctx,
        Complex[] solution,
        double omega)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / Resistance(element);
    }

    internal static double Resistance(ElementInstance element)
    {
        var light = Math.Clamp(element.Params["light"], 0, 1);
        var rDark = element.Params["rDark"];
        var rLight = element.Params["rLight"];
        // Smooth log-ish blend so mid light is usable in teaching dividers.
        return rDark * Math.Pow(rLight / rDark, light);
    }
}
