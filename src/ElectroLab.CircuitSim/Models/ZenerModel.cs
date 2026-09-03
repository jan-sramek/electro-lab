using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching Zener: forward like a diode (Vf); reverse breakdown at Vz with Ron.
/// Bias: LedOn = forward, ZenerRevOn = reverse regulation.
/// </summary>
public sealed class ZenerModel : IDeviceModel
{
    public string ModelKey => "zener";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("c"))
            errors.Add($"{element.Id}: zener requires pins a, c.");
        if (!element.Params.TryGetValue("vf", out var vf) || vf < 0)
            errors.Add($"{element.Id}: zener requires params.vf >= 0.");
        if (!element.Params.TryGetValue("vz", out var vz) || vz <= 0)
            errors.Add($"{element.Id}: zener requires params.vz > 0.");
        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: zener requires params.ron > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return;

        var fwd = hint?.LedOn.GetValueOrDefault(element.Id, false) ?? false;
        var rev = hint?.ZenerRevOn.GetValueOrDefault(element.Id, false) ?? false;
        if (!fwd && !rev)
            return;

        var ron = element.Params["ron"];
        var g = 1.0 / ron;
        var a = element.Pins["a"];
        var c = element.Pins["c"];
        ctx.StampConductance(a, c, g);

        if (fwd)
        {
            var vf = element.Params["vf"];
            ctx.StampCurrentSource(c, a, g * vf);
        }
        else
        {
            var vz = element.Params["vz"];
            // Reverse: I(a→c) = (Va − Vc + Vz)/Ron  → source G·Vz from a toward c
            ctx.StampCurrentSource(a, c, g * vz);
        }
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;

        var fwd = hint?.LedOn.GetValueOrDefault(element.Id, false) ?? false;
        var rev = hint?.ZenerRevOn.GetValueOrDefault(element.Id, false) ?? false;
        if (!fwd && !rev)
            return 0;

        var ron = element.Params["ron"];
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vc = ctx.NodeVoltage(solution, element.Pins["c"]);
        if (fwd)
            return (va - vc - element.Params["vf"]) / ron;
        return (va - vc + element.Params["vz"]) / ron;
    }

    /// <summary>Updates forward / reverse Zener bias. Returns true if either mode changed.</summary>
    public static bool UpdateBias(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint hint)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vc = ctx.NodeVoltage(solution, element.Pins["c"]);
        var vf = element.Params["vf"];
        var vz = element.Params["vz"];
        var vad = va - vc;

        var prevFwd = hint.LedOn.GetValueOrDefault(element.Id, false);
        var prevRev = hint.ZenerRevOn.GetValueOrDefault(element.Id, false);
        var i = new ZenerModel().BranchCurrent(element, ctx, solution, hint) ?? 0;

        bool nextFwd;
        bool nextRev;
        if (prevFwd)
            nextFwd = i > 1e-12;
        else
            nextFwd = vad >= vf;

        if (prevRev)
            nextRev = i < -1e-12;
        else
            nextRev = -vad >= vz;

        // Prefer reverse regulation if both thresholds fire (shouldn't at steady state).
        if (nextFwd && nextRev)
            nextFwd = false;

        var changed = nextFwd != prevFwd || nextRev != prevRev;
        if (changed)
        {
            hint.LedOn[element.Id] = nextFwd;
            hint.ZenerRevOn[element.Id] = nextRev;
        }
        return changed;
    }
}
