using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

public sealed class ResistorModel : IDeviceModel
{
    public string ModelKey => "resistor";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: resistor requires pins a, b.");
        if (!element.Params.TryGetValue("r", out var r) || r <= 0)
            errors.Add($"{element.Id}: resistor requires params.r > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var r = element.Params["r"];
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / r);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / element.Params["r"];
    }
}
