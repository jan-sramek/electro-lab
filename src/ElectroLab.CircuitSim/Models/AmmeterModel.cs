using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching series ammeter: a small sense resistor whose branch current is the measured current.
/// Place in series with the path you want to measure.
/// </summary>
public sealed class AmmeterModel : IDeviceModel
{
    public string ModelKey => "ammeter";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: ammeter requires pins a, b.");
        if (element.Params.TryGetValue("r", out var r) && r <= 0)
            errors.Add($"{element.Id}: ammeter params.r must be > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
        => ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / SenseR(element));

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / SenseR(element);
    }

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
        => ctx.StampAdmittance(element.Pins["a"], element.Pins["b"], new Complex(1.0 / SenseR(element), 0));

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / SenseR(element);
    }

    private static double SenseR(ElementInstance element)
        => element.Params.TryGetValue("r", out var r) && r > 0 ? r : 0.01;
}
