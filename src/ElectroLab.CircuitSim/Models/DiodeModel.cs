using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching diode: when on, Vf + Ron series equivalent; when off, open circuit.
/// BoolParams["burned"] = true → permanently open (teaching overload failure).
/// </summary>
public sealed class DiodeModel : IDeviceModel
{
    public string ModelKey => "diode";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("c"))
            errors.Add($"{element.Id}: diode requires pins a, c.");
        if (!element.Params.TryGetValue("vf", out var vf) || vf < 0)
            errors.Add($"{element.Id}: diode requires params.vf >= 0.");
        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: diode requires params.ron > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return;

        var on = hint?.LedOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on)
            return;

        var vf = element.Params["vf"];
        var ron = element.Params["ron"];
        var g = 1.0 / ron;
        var a = element.Pins["a"];
        var c = element.Pins["c"];
        ctx.StampConductance(a, c, g);
        ctx.StampCurrentSource(c, a, g * vf);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;

        var on = hint?.LedOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on)
            return 0;

        var vf = element.Params["vf"];
        var ron = element.Params["ron"];
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vc = ctx.NodeVoltage(solution, element.Pins["c"]);
        return (va - vc - vf) / ron;
    }
}
