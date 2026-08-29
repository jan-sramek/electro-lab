using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Ideal DC current source: current leaves pin n and enters pin p (conventional arrow p←n).
/// </summary>
public sealed class CurrentSourceModel : IDeviceModel
{
    public string ModelKey => "current_source";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("p") || !element.Pins.ContainsKey("n"))
            errors.Add($"{element.Id}: current_source requires pins p, n.");
        if (!element.Params.TryGetValue("i", out var i) || i < 0)
            errors.Add($"{element.Id}: current_source requires params.i >= 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var i = element.Params["i"];
        // Current into p from n through the source: StampCurrentSource(from, to, amps)
        // matches LED helper: from loses current, to gains. Flow n → p:
        ctx.StampCurrentSource(element.Pins["n"], element.Pins["p"], i);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
        => element.Params["i"];
}
