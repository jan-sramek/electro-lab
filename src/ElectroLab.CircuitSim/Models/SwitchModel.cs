using System.Numerics;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

public sealed class SwitchModel : IDeviceModel
{
    private const double Ron = 0.01;
    private const double Roff = 1e12;

    public string ModelKey => "switch";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: switch requires pins a, b.");
        // openAt / closeAt < 0 means “unused” (DC closed flag only).
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        // Evaluate timeline at t=0 so DC / initFromDc match the start of a transient.
        var r = ResistanceFor(element, time: 0);
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / r);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var r = ResistanceFor(element, time: 0);
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / r;
    }

    public void ContributeTransient(
        ElementInstance element,
        StampContext ctx,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        var r = ResistanceFor(element, state.Time);
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / r);
    }

    public double? BranchCurrentTransient(
        ElementInstance element,
        StampContext ctx,
        double[] solution,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        var r = ResistanceFor(element, state.Time);
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / r;
    }

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
        => ctx.StampAdmittance(element.Pins["a"], element.Pins["b"], new Complex(1.0 / ResistanceFor(element, time: 0), 0));

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / ResistanceFor(element, time: 0);
    }

    /// <summary>
    /// DC/AC: timeline evaluated at t=0 (then falls back to bool <c>closed</c>).
    /// Transient: <c>openAt</c> / <c>closeAt</c> (≥0) override the bool.
    /// Both set with closeAt ≤ openAt → closed on [closeAt, openAt).
    /// </summary>
    internal static double ResistanceFor(ElementInstance element, double? time)
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
                closed = closeAt <= openAt
                    ? t >= closeAt && t < openAt
                    : !(t >= openAt && t < closeAt);
            }
            else if (hasOpen)
            {
                closed = t < openAt;
            }
            else
            {
                closed = t >= closeAt;
            }
        }

        return closed ? Ron : Roff;
    }
}
