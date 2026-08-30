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
        // openAt < 0 means “unused” (DC closed flag only).
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var r = ResistanceFor(element, time: null);
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / r);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var r = ResistanceFor(element, time: null);
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
        => ctx.StampAdmittance(element.Pins["a"], element.Pins["b"], new Complex(1.0 / ResistanceFor(element, time: null), 0));

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / ResistanceFor(element, time: null);
    }

    /// <summary>
    /// DC/AC: use bool <c>closed</c>.
    /// Transient: if <c>openAt</c> is set, switch is closed for t &lt; openAt and open after
    /// (teaching “flip the switch off mid-run”). Otherwise use <c>closed</c>.
    /// </summary>
    private static double ResistanceFor(ElementInstance element, double? time)
    {
        var closed = element.BoolParams is not null
            && element.BoolParams.TryGetValue("closed", out var c)
            && c;

        if (time is double t
            && element.Params.TryGetValue("openAt", out var openAt)
            && openAt >= 0)
        {
            closed = t < openAt;
        }

        return closed ? Ron : Roff;
    }
}
