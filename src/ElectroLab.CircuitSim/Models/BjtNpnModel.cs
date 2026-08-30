using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching NPN BJT modeled as a base-driven switch:
/// when Vbe >= vf the base-emitter junction is Vf in series with rb, and the collector-emitter
/// path closes with a fixed on-resistance (ron); when off, both junctions are open.
/// </summary>
public sealed class BjtNpnModel : IDeviceModel
{
    public string ModelKey => "bjt_npn";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("c") || !element.Pins.ContainsKey("b") || !element.Pins.ContainsKey("e"))
            errors.Add($"{element.Id}: bjt_npn requires pins c, b, e.");
        if (!element.Params.TryGetValue("vf", out var vf) || vf < 0)
            errors.Add($"{element.Id}: bjt_npn requires params.vf >= 0.");
        if (!element.Params.TryGetValue("rb", out var rb) || rb <= 0)
            errors.Add($"{element.Id}: bjt_npn requires params.rb > 0.");
        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: bjt_npn requires params.ron > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var on = hint?.BjtOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on)
            return;

        var vf = element.Params["vf"];
        var rb = element.Params["rb"];
        var ron = element.Params["ron"];
        var b = element.Pins["b"];
        var e = element.Pins["e"];
        var c = element.Pins["c"];

        var gb = 1.0 / rb;
        ctx.StampConductance(b, e, gb);
        ctx.StampCurrentSource(e, b, gb * vf);

        ctx.StampConductance(c, e, 1.0 / ron);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var on = hint?.BjtOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on)
            return 0;

        var ron = element.Params["ron"];
        var vc = ctx.NodeVoltage(solution, element.Pins["c"]);
        var ve = ctx.NodeVoltage(solution, element.Pins["e"]);
        return (vc - ve) / ron;
    }
}
