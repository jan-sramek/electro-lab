using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>Three-terminal potentiometer: series Ra + Rb from a–w–b.</summary>
public sealed class PotentiometerModel : IDeviceModel
{
    public string ModelKey => "potentiometer";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("w") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: potentiometer requires pins a, w, b.");
        if (!element.Params.TryGetValue("r", out var r) || r <= 0)
            errors.Add($"{element.Id}: potentiometer requires params.r > 0.");
        if (!element.Params.ContainsKey("pos"))
            errors.Add($"{element.Id}: potentiometer requires params.pos (0–1).");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var r = element.Params["r"];
        var pos = Math.Clamp(element.Params["pos"], 0.01, 0.99);
        var ra = Math.Max(r * pos, 1e-6);
        var rb = Math.Max(r * (1.0 - pos), 1e-6);
        ctx.StampConductance(element.Pins["a"], element.Pins["w"], 1.0 / ra);
        ctx.StampConductance(element.Pins["w"], element.Pins["b"], 1.0 / rb);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var r = element.Params["r"];
        var pos = Math.Clamp(element.Params["pos"], 0.01, 0.99);
        var ra = Math.Max(r * pos, 1e-6);
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vw = ctx.NodeVoltage(solution, element.Pins["w"]);
        return (va - vw) / ra;
    }
}
