using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching DC motor as a bidirectional load: when |Vab| ≥ vStart, draws current through ron.
/// BoolParams["burned"] → permanently open.
/// </summary>
public sealed class DcMotorModel : IDeviceModel
{
    public string ModelKey => "dc_motor";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: dc_motor requires pins a, b.");
        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: dc_motor requires params.ron > 0.");
        if (!element.Params.TryGetValue("vStart", out var vs) || vs < 0)
            errors.Add($"{element.Id}: dc_motor requires params.vStart >= 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return;

        var on = hint?.MotorOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on) return;

        var ron = element.Params["ron"];
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / ron);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;

        var on = hint?.MotorOn.GetValueOrDefault(element.Id, true) ?? true;
        if (!on) return 0;

        var ron = element.Params["ron"];
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / ron;
    }

    /// <summary>Update MotorOn from |Vab| vs vStart. Returns true if state changed.</summary>
    public static bool UpdateBias(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint hint)
    {
        if (DeviceBurned.IsBurned(element))
            return false;

        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        var vStart = element.Params["vStart"];
        var previouslyOn = hint.MotorOn.GetValueOrDefault(element.Id, true);
        var mag = Math.Abs(va - vb);
        var current = previouslyOn ? mag / element.Params["ron"] : 0;
        var nextOn = previouslyOn ? current > 1e-12 : mag >= vStart;
        if (nextOn == previouslyOn)
            return false;
        hint.MotorOn[element.Id] = nextOn;
        return true;
    }
}
