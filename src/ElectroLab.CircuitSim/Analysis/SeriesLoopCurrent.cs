using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Analysis;

/// <summary>
/// When an ideal inductor short reports ~0 A from (va−vb)×G, copy loop current from a neighbor branch,
/// corrected for pin orientation so the result is the inductor's a→b current.
/// </summary>
internal static class SeriesLoopCurrent
{
    /// <summary>
    /// Estimated current a→b through <paramref name="element"/> (an inductor with pins a, b), taken from the
    /// two-terminal neighbour with the largest |I| that shares exactly one node. Null when no such neighbour.
    /// </summary>
    public static double? NeighborBranchCurrent(
        ElementInstance element,
        IReadOnlyList<(ElementInstance el, IDeviceModel model)> models,
        StampContext ctx,
        double[] solution,
        DcBiasHint? hint)
    {
        if (!element.Pins.TryGetValue("a", out var nodeA) || !element.Pins.TryGetValue("b", out var nodeB))
            return null;
        if (string.Equals(nodeA, nodeB, StringComparison.Ordinal))
            return null;

        double? best = null;

        foreach (var (other, model) in models)
        {
            if (other.Id == element.Id) continue;
            if (!TryGetThroughPins(other, out var pinIn, out var pinOut)) continue;
            if (!other.Pins.TryGetValue(pinIn, out var nodeIn) || !other.Pins.TryGetValue(pinOut, out var nodeOut)) continue;

            // Which inductor pin does the neighbour touch? A neighbour in parallel (touching both) is not in series.
            var touchesA = nodeIn == nodeA || nodeOut == nodeA;
            var touchesB = nodeIn == nodeB || nodeOut == nodeB;
            if (touchesA == touchesB) continue;
            var shared = touchesA ? nodeA : nodeB;

            var i = model.BranchCurrent(other, ctx, solution, hint);
            if (i is not double through) continue;

            // Current delivered INTO the shared node from the neighbour: +I when the shared node is the
            // neighbour's "out" pin, −I when it is the "in" pin.
            var intoShared = nodeOut == shared ? through : -through;

            // KCL at the shared node: that current continues into the inductor. Entering at a means a→b is
            // positive; entering at b means a→b is negative.
            var aToB = touchesA ? intoShared : -intoShared;

            if (best is null || Math.Abs(aToB) > Math.Abs(best.Value))
                best = aToB;
        }

        return best;
    }

    /// <summary>
    /// Pin pair (in, out) such that the model's BranchCurrent is the current flowing through the device
    /// from <c>in</c> to <c>out</c>. Passives report a→b (or a→c); sources report the delivered current,
    /// which flows n→p inside the source.
    /// </summary>
    private static bool TryGetThroughPins(ElementInstance element, out string pinIn, out string pinOut)
    {
        var m = element.Model;
        if (Is(m, "resistor") || Is(m, "switch") || Is(m, "ldr") || Is(m, "dc_motor") || Is(m, "ammeter"))
        {
            (pinIn, pinOut) = ("a", "b");
            return true;
        }

        if (Is(m, "led") || Is(m, "diode") || Is(m, "buzzer"))
        {
            (pinIn, pinOut) = ("a", "c");
            return true;
        }

        if (Is(m, "battery") || Is(m, "current_source"))
        {
            (pinIn, pinOut) = ("n", "p");
            return true;
        }

        pinIn = pinOut = "";
        return false;
    }

    private static bool Is(string model, string key) => model.Equals(key, StringComparison.OrdinalIgnoreCase);
}
