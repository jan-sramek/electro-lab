using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Analysis;

/// <summary>
/// When an ideal inductor short reports ~0 A from (va−vb)×G, copy loop current from a neighbor branch.
/// </summary>
internal static class SeriesLoopCurrent
{
    public static double? NeighborBranchCurrent(
        ElementInstance element,
        IReadOnlyList<(ElementInstance el, IDeviceModel model)> models,
        StampContext ctx,
        double[] solution,
        DcBiasHint? hint)
    {
        var nodes = new HashSet<string>(element.Pins.Values, StringComparer.Ordinal);
        double? best = null;

        foreach (var (other, model) in models)
        {
            if (other.Id == element.Id) continue;
            if (!other.Pins.Values.Any(nodes.Contains)) continue;
            if (!ReportsSeriesLoopCurrent(other.Model)) continue;

            var i = model.BranchCurrent(other, ctx, solution, hint);
            if (i is not double amps) continue;
            if (best is null || Math.Abs(amps) > Math.Abs(best.Value))
                best = amps;
        }

        return best;
    }

    private static bool ReportsSeriesLoopCurrent(string model) =>
        model.Equals("resistor", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("battery", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("switch", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("led", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("diode", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("ldr", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("dc_motor", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("buzzer", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("ammeter", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("current_source", StringComparison.OrdinalIgnoreCase);
}
