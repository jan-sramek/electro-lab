using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching 7805-style linear regulator: OUT held at vOut vs GND when
/// Vin − Vgnd ≥ vOut + dropout; otherwise IN–OUT pass-through (Ron only).
/// </summary>
public sealed class Vreg7805Model : IDeviceModel
{
    public const double DefaultVOut = 5;
    public const double DefaultDropout = 2;
    public const double DefaultRon = 2;

    public string ModelKey => "vreg_7805";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("in") || !element.Pins.ContainsKey("gnd") || !element.Pins.ContainsKey("out"))
            errors.Add($"{element.Id}: vreg_7805 requires pins in, gnd, out.");
        if (element.Params.TryGetValue("vOut", out var vOut) && vOut <= 0)
            errors.Add($"{element.Id}: vreg_7805 params.vOut must be > 0.");
        if (element.Params.TryGetValue("dropout", out var drop) && drop < 0)
            errors.Add($"{element.Id}: vreg_7805 params.dropout must be >= 0.");
        if (element.Params.TryGetValue("ron", out var ron) && ron <= 0)
            errors.Add($"{element.Id}: vreg_7805 params.ron must be > 0.");
        return errors;
    }

    public IReadOnlyList<string> ExtraNodes(ElementInstance element) => [IdleNode(element)];

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var pinIn = element.Pins["in"];
        var pinOut = element.Pins["out"];
        var pinGnd = element.Pins["gnd"];
        var idle = IdleNode(element);

        if (DeviceBurned.IsBurned(element))
        {
            ctx.StampVoltageSource(element.Id, idle, pinGnd, 0);
            return;
        }

        var ron = GetRon(element);
        ctx.StampConductance(pinIn, pinOut, 1.0 / ron);

        var regulating = hint?.VregOn.GetValueOrDefault(element.Id, true) ?? true;
        if (regulating)
        {
            ctx.StampVoltageSource(element.Id, pinOut, pinGnd, GetVOut(element));
            // Keep the unused idle node from floating (singular matrix).
            ctx.StampConductance(idle, pinGnd, 1e-9);
        }
        else
        {
            ctx.StampVoltageSource(element.Id, idle, pinGnd, 0);
        }
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;

        var regulating = hint?.VregOn.GetValueOrDefault(element.Id, true) ?? true;
        if (regulating)
            return -ctx.VoltageSourceCurrent(solution, element.Id);

        var vin = ctx.NodeVoltage(solution, element.Pins["in"]);
        var vout = ctx.NodeVoltage(solution, element.Pins["out"]);
        return (vin - vout) / GetRon(element);
    }

    public static bool UpdateBias(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint hint)
    {
        var vin = ctx.NodeVoltage(solution, element.Pins["in"]);
        var vgnd = ctx.NodeVoltage(solution, element.Pins["gnd"]);
        var need = GetVOut(element) + GetDropout(element);
        var next = vin - vgnd >= need - 1e-6;
        var prev = hint.VregOn.GetValueOrDefault(element.Id, true);
        if (next == prev) return false;
        hint.VregOn[element.Id] = next;
        return true;
    }

    private static string IdleNode(ElementInstance element) => $"{element.Id}__idle";

    internal static double GetVOut(ElementInstance element)
        => element.Params.TryGetValue("vOut", out var v) ? v : DefaultVOut;

    internal static double GetDropout(ElementInstance element)
        => element.Params.TryGetValue("dropout", out var v) ? v : DefaultDropout;

    internal static double GetRon(ElementInstance element)
        => element.Params.TryGetValue("ron", out var v) && v > 0 ? v : DefaultRon;
}
