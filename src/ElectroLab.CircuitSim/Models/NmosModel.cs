using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching N-channel MOSFET as a gate-threshold switch:
/// when Vgs >= vth the drain-source path closes with ron; otherwise open.
/// BoolParams["burned"] = true → permanently open (teaching overcurrent / overvoltage failure).
/// </summary>
public sealed class NmosModel : IDeviceModel
{
    public string ModelKey => "nmos";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("d") || !element.Pins.ContainsKey("g") || !element.Pins.ContainsKey("s"))
            errors.Add($"{element.Id}: nmos requires pins d, g, s.");
        if (!element.Params.TryGetValue("vth", out var vth) || vth < 0)
            errors.Add($"{element.Id}: nmos requires params.vth >= 0.");
        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: nmos requires params.ron > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return;

        var on = hint?.MosfetOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on)
            return;

        var ron = element.Params["ron"];
        ctx.StampConductance(element.Pins["d"], element.Pins["s"], 1.0 / ron);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;

        var on = hint?.MosfetOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on)
            return 0;

        var ron = element.Params["ron"];
        var vd = ctx.NodeVoltage(solution, element.Pins["d"]);
        var vs = ctx.NodeVoltage(solution, element.Pins["s"]);
        return (vd - vs) / ron;
    }

    /// <summary>Update MosfetOn from Vgs vs vth. Returns true if state changed.</summary>
    public static bool UpdateGateBias(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint hint)
    {
        if (DeviceBurned.IsBurned(element))
            return false;

        var vg = ctx.NodeVoltage(solution, element.Pins["g"]);
        var vs = ctx.NodeVoltage(solution, element.Pins["s"]);
        var vth = element.Params["vth"];
        var previouslyOn = hint.MosfetOn.GetValueOrDefault(element.Id, true);
        var nextOn = vg - vs >= vth;
        if (nextOn == previouslyOn)
            return false;
        hint.MosfetOn[element.Id] = nextOn;
        return true;
    }
}
