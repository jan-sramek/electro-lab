using System.Numerics;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching SPST relay: coil resistance always stamped between cp–cn;
/// contacts a–b close when |Vcoil| ≥ vPull (piecewise), or when bool closed / openAt/closeAt override.
/// Branch current is contact current. AC: coil R linear; contacts open.
/// </summary>
public sealed class RelayModel : IDeviceModel
{
    public string ModelKey => "relay";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("cp") || !element.Pins.ContainsKey("cn")
            || !element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: relay requires pins cp, cn, a, b.");
        if (!element.Params.TryGetValue("rCoil", out var rCoil) || rCoil <= 0)
            errors.Add($"{element.Id}: relay requires params.rCoil > 0.");
        if (!element.Params.TryGetValue("vPull", out var vPull) || vPull < 0)
            errors.Add($"{element.Id}: relay requires params.vPull >= 0.");
        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: relay requires params.ron > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        StampCoil(element, ctx);
        if (ContactsClosed(element, hint, time: 0))
            StampContacts(element, ctx);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (!ContactsClosed(element, hint, time: 0))
            return 0;
        var ron = element.Params["ron"];
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / ron;
    }

    public void ContributeTransient(
        ElementInstance element,
        StampContext ctx,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        StampCoil(element, ctx);
        if (ContactsClosed(element, hint, state.Time))
            StampContacts(element, ctx);
    }

    public double? BranchCurrentTransient(
        ElementInstance element,
        StampContext ctx,
        double[] solution,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        if (!ContactsClosed(element, hint, state.Time))
            return 0;
        var ron = element.Params["ron"];
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / ron;
    }

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
    {
        // Coil is linear; contacts treated as open in AC (see AcAnalysis nonlinear warning).
        var g = 1.0 / element.Params["rCoil"];
        ctx.StampAdmittance(element.Pins["cp"], element.Pins["cn"], new Complex(g, 0));
    }

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
    {
        // Report coil current in AC (contacts open).
        var g = 1.0 / element.Params["rCoil"];
        var vcp = ctx.NodeVoltage(solution, element.Pins["cp"]);
        var vcn = ctx.NodeVoltage(solution, element.Pins["cn"]);
        return (vcp - vcn) * g;
    }

    /// <summary>Update RelayOn from |Vcoil| ≥ vPull. Returns true if state changed.</summary>
    public static bool UpdateCoilBias(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint hint)
    {
        var vcp = ctx.NodeVoltage(solution, element.Pins["cp"]);
        var vcn = ctx.NodeVoltage(solution, element.Pins["cn"]);
        var vPull = element.Params["vPull"];
        var nextOn = Math.Abs(vcp - vcn) >= vPull;
        var previouslyOn = hint.RelayOn.GetValueOrDefault(element.Id, false);
        if (nextOn == previouslyOn)
            return false;
        hint.RelayOn[element.Id] = nextOn;
        return true;
    }

    /// <summary>
    /// Timeline (openAt/closeAt) overrides everything when active.
    /// Else bool closed=true forces contacts closed.
    /// Else coil-driven RelayOn from hint.
    /// </summary>
    internal static bool ContactsClosed(ElementInstance element, DcBiasHint? hint, double? time)
    {
        var closed = element.BoolParams is not null
            && element.BoolParams.TryGetValue("closed", out var c)
            && c;

        var hasOpen = element.Params.TryGetValue("openAt", out var openAt) && openAt >= 0;
        var hasClose = element.Params.TryGetValue("closeAt", out var closeAt) && closeAt >= 0;

        if (time is double t && (hasOpen || hasClose))
        {
            if (hasOpen && hasClose)
            {
                return closeAt <= openAt
                    ? t >= closeAt && t < openAt
                    : !(t >= openAt && t < closeAt);
            }
            if (hasOpen)
                return t < openAt;
            return t >= closeAt;
        }

        if (closed)
            return true;

        return hint?.RelayOn.GetValueOrDefault(element.Id, false) ?? false;
    }

    private static void StampCoil(ElementInstance element, StampContext ctx)
        => ctx.StampConductance(element.Pins["cp"], element.Pins["cn"], 1.0 / element.Params["rCoil"]);

    private static void StampContacts(ElementInstance element, StampContext ctx)
        => ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / element.Params["ron"]);
}
