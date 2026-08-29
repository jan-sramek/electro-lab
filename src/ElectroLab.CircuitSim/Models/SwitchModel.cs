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
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var closed = element.BoolParams is not null
            && element.BoolParams.TryGetValue("closed", out var c)
            && c;
        var r = closed ? Ron : Roff;
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / r);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var closed = element.BoolParams is not null
            && element.BoolParams.TryGetValue("closed", out var c)
            && c;
        var r = closed ? Ron : Roff;
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / r;
    }
}
