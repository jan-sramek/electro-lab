using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

public sealed class BatteryModel : IDeviceModel
{
    public string ModelKey => "battery";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("p") || !element.Pins.ContainsKey("n"))
            errors.Add($"{element.Id}: battery requires pins p, n.");
        if (!element.Params.ContainsKey("v"))
            errors.Add($"{element.Id}: battery requires params.v.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
        => ctx.StampVoltageSource(element.Id, element.Pins["p"], element.Pins["n"], element.Params["v"]);

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
        => -ctx.VoltageSourceCurrent(solution, element.Id);
}
