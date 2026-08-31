using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching NE555 behavioral model (astable/monostable capable):
/// SR latch driven by thr (&gt; 2/3 Vcc → reset) and trig (&lt; 1/3 Vcc → set),
/// with active-low reset. Output drives toward Vcc or GND; discharge is open-drain to GND when low.
/// BoolParams["burned"] → permanently inactive (open out/dis).
/// </summary>
public sealed class Ne555Model : IDeviceModel
{
    private const double ResetThreshold = 0.7;

    public string ModelKey => "ne555";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        string[] required = ["gnd", "trig", "out", "reset", "ctrl", "thr", "dis", "vcc"];
        foreach (var pin in required)
        {
            if (!element.Pins.ContainsKey(pin))
                errors.Add($"{element.Id}: ne555 requires pin '{pin}'.");
        }

        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: ne555 requires params.ron > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return;

        StampState(element, ctx, IsHigh(element, hint));
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;

        var high = IsHigh(element, hint);
        var ron = element.Params["ron"];
        var vout = ctx.NodeVoltage(solution, element.Pins["out"]);
        if (high)
        {
            var vcc = ctx.NodeVoltage(solution, element.Pins["vcc"]);
            return (vcc - vout) / ron;
        }

        var gnd = ctx.NodeVoltage(solution, element.Pins["gnd"]);
        return (vout - gnd) / ron;
    }

    /// <summary>Update latch from thr/trig/reset. Returns true if state changed.</summary>
    public static bool UpdateLatch(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint hint)
    {
        if (DeviceBurned.IsBurned(element))
            return false;

        var vcc = ctx.NodeVoltage(solution, element.Pins["vcc"]);
        var gnd = ctx.NodeVoltage(solution, element.Pins["gnd"]);
        var supply = vcc - gnd;
        if (supply < 0.5)
            supply = 5; // avoid divide-by-zero before rails settle

        var thr = ctx.NodeVoltage(solution, element.Pins["thr"]);
        var trig = ctx.NodeVoltage(solution, element.Pins["trig"]);
        var reset = ctx.NodeVoltage(solution, element.Pins["reset"]);
        var ctrl = ctx.NodeVoltage(solution, element.Pins["ctrl"]);

        // ctrl defaults near 2/3 Vcc when tied to divider; use measured ctrl when above gnd+0.2.
        var upper = ctrl - gnd > 0.2 ? ctrl : gnd + (2.0 / 3.0) * supply;
        var lower = gnd + (1.0 / 3.0) * supply;

        var previouslyHigh = hint.Ne555High.GetValueOrDefault(element.Id, false);
        var nextHigh = previouslyHigh;

        if (reset - gnd < ResetThreshold)
            nextHigh = false;
        else
        {
            if (thr >= upper)
                nextHigh = false;
            if (trig <= lower)
                nextHigh = true;
        }

        if (nextHigh == previouslyHigh)
            return false;
        hint.Ne555High[element.Id] = nextHigh;
        return true;
    }

    private static bool IsHigh(ElementInstance element, DcBiasHint? hint)
        => hint?.Ne555High.GetValueOrDefault(element.Id, false) ?? false;

    private static void StampState(ElementInstance element, StampContext ctx, bool high)
    {
        var ron = element.Params["ron"];
        var g = 1.0 / ron;
        const double Goff = 1e-9;
        var outPin = element.Pins["out"];
        var dis = element.Pins["dis"];
        var gnd = element.Pins["gnd"];
        var vcc = element.Pins["vcc"];

        if (high)
        {
            ctx.StampConductance(outPin, vcc, g);
            // Keep discharge node referenced when open-drain is off.
            ctx.StampConductance(dis, gnd, Goff);
        }
        else
        {
            ctx.StampConductance(outPin, gnd, g);
            ctx.StampConductance(dis, gnd, g);
        }
    }
}
