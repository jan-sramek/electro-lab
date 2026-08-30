using System.Numerics;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching inductor: short in DC; Backward Euler companion (G = dt/L) in transient.
/// Optional params.ic = initial current a→b (A); overridden by initFromDc.
/// </summary>
public sealed class InductorModel : IDeviceModel
{
    public string ModelKey => "inductor";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: inductor requires pins a, b.");
        if (!element.Params.TryGetValue("l", out var l) || l <= 0)
            errors.Add($"{element.Id}: inductor requires params.l > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        // Ideal short: large conductance
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1e6);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) * 1e6;
    }

    public void ContributeTransient(
        ElementInstance element,
        StampContext ctx,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        var l = element.Params["l"];
        var g = dt / l;
        var a = element.Pins["a"];
        var b = element.Pins["b"];
        var iPrev = state.IndCurrent.GetValueOrDefault(element.Id);
        // i = iPrev + G*(va - vb)
        ctx.StampConductance(a, b, g);
        ctx.StampCurrentSource(b, a, iPrev);
    }

    public double? BranchCurrentTransient(
        ElementInstance element,
        StampContext ctx,
        double[] solution,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        var l = element.Params["l"];
        var g = dt / l;
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        var iPrev = state.IndCurrent.GetValueOrDefault(element.Id);
        return iPrev + g * (va - vb);
    }

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
        => ctx.StampAdmittance(element.Pins["a"], element.Pins["b"], InductorAdmittance(element, omega));

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) * InductorAdmittance(element, omega);
    }

    private static Complex InductorAdmittance(ElementInstance element, double omega)
        => omega > 0 ? 1.0 / new Complex(0, omega * element.Params["l"]) : new Complex(1e6, 0);
}
