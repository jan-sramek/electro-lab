using System.Numerics;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching capacitor: open in DC; Backward Euler companion in transient.
/// </summary>
public sealed class CapacitorModel : IDeviceModel
{
    public string ModelKey => "capacitor";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: capacitor requires pins a, b.");
        if (!element.Params.TryGetValue("c", out var c) || c <= 0)
            errors.Add($"{element.Id}: capacitor requires params.c > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        // DC open — no stamp
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
        => 0;

    public void ContributeTransient(
        ElementInstance element,
        StampContext ctx,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        var c = element.Params["c"];
        var g = c / dt;
        var a = element.Pins["a"];
        var b = element.Pins["b"];
        var vPrev = state.CapVoltage.GetValueOrDefault(element.Id);
        ctx.StampConductance(a, b, g);
        // i = G*(v - vPrev) into a → inject G*vPrev into a (from b)
        ctx.StampCurrentSource(b, a, g * vPrev);
    }

    public double? BranchCurrentTransient(
        ElementInstance element,
        StampContext ctx,
        double[] solution,
        DcBiasHint? hint,
        TransientState state,
        double dt)
    {
        var c = element.Params["c"];
        var g = c / dt;
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        var vPrev = state.CapVoltage.GetValueOrDefault(element.Id);
        return g * ((va - vb) - vPrev);
    }

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
    {
        var y = new Complex(0, omega * element.Params["c"]);
        ctx.StampAdmittance(element.Pins["a"], element.Pins["b"], y);
    }

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        var y = new Complex(0, omega * element.Params["c"]);
        return (va - vb) * y;
    }
}
