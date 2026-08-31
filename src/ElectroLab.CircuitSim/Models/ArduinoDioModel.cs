using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching Arduino digital I/O pin:
/// mode 0 = input (open), mode 1 = output driving vHigh (level=1) or 0 V (level=0) vs gnd.
/// </summary>
public sealed class ArduinoDioModel : IDeviceModel
{
    public string ModelKey => "arduino_dio";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("sig") || !element.Pins.ContainsKey("gnd"))
            errors.Add($"{element.Id}: arduino_dio requires pins sig, gnd.");
        if (!element.Params.TryGetValue("mode", out var mode) || (mode != 0 && mode != 1))
            errors.Add($"{element.Id}: arduino_dio requires params.mode 0 (input) or 1 (output).");
        if (!element.Params.TryGetValue("level", out var level) || (level != 0 && level != 1))
            errors.Add($"{element.Id}: arduino_dio requires params.level 0 or 1.");
        if (!element.Params.TryGetValue("vHigh", out var vh) || vh <= 0)
            errors.Add($"{element.Id}: arduino_dio requires params.vHigh > 0.");
        if (!element.Params.TryGetValue("ron", out var ron) || ron <= 0)
            errors.Add($"{element.Id}: arduino_dio requires params.ron > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx)
    {
        if (IsOutput(element))
            ctx.RegisterVoltageSource(element.Id);
    }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        if (!IsOutput(element))
            return;

        var v = element.Params["level"] >= 0.5 ? element.Params["vHigh"] : 0;
        var ron = element.Params["ron"];
        var mid = MidNode(element);
        // Ideal pin voltage behind small series Ron (GPIO drive strength).
        ctx.StampVoltageSource(element.Id, mid, element.Pins["gnd"], v);
        ctx.StampConductance(mid, element.Pins["sig"], 1.0 / ron);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (!IsOutput(element))
            return 0;
        return -ctx.VoltageSourceCurrent(solution, element.Id);
    }

    public IReadOnlyList<string> ExtraNodes(ElementInstance element)
        => IsOutput(element) ? [MidNode(element)] : [];

    private static bool IsOutput(ElementInstance element)
        => element.Params.TryGetValue("mode", out var mode) && mode >= 0.5;

    private static string MidNode(ElementInstance element) => $"{element.Id}__mid";
}
