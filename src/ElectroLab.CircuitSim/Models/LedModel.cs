using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching LED model: when on, Vf + Ron series equivalent; when off, open circuit.
/// </summary>
public sealed class LedModel : IDeviceModel
{
    public string ModelKey => "led";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("c"))
            errors.Add($"{element.Id}: led requires pins a, c.");
        if (!element.Params.TryGetValue("vf", out var vf) || vf < 0)
            errors.Add($"{element.Id}: led requires params.vf >= 0.");
        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: led requires params.ron > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var on = hint?.LedOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on)
            return;

        var vf = element.Params["vf"];
        var ron = element.Params["ron"];
        var g = 1.0 / ron;
        var a = element.Pins["a"];
        var c = element.Pins["c"];
        ctx.StampConductance(a, c, g);
        // I = G*(Va-Vc) - G*Vf → KCL needs +G*Vf on anode RHS, -G*Vf on cathode RHS
        ctx.StampCurrentSource(c, a, g * vf);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
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
