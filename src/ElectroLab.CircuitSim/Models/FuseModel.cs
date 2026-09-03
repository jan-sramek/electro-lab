using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching fuse: low series Ron until burned open (frontend / BoolParams["burned"]).
/// </summary>
public sealed class FuseModel : IDeviceModel
{
    public const double DefaultIMax = 0.1;
    public const double DefaultRon = 0.05;

    public string ModelKey => "fuse";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("a") || !element.Pins.ContainsKey("b"))
            errors.Add($"{element.Id}: fuse requires pins a, b.");
        if (element.Params.TryGetValue("iMax", out var iMax) && iMax <= 0)
            errors.Add($"{element.Id}: fuse params.iMax must be > 0.");
        if (element.Params.TryGetValue("ron", out var ron) && ron <= 0)
            errors.Add($"{element.Id}: fuse params.ron must be > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return;
        var ron = GetRon(element);
        ctx.StampConductance(element.Pins["a"], element.Pins["b"], 1.0 / ron);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        if (DeviceBurned.IsBurned(element))
            return 0;
        var va = ctx.NodeVoltage(solution, element.Pins["a"]);
        var vb = ctx.NodeVoltage(solution, element.Pins["b"]);
        return (va - vb) / GetRon(element);
    }

    internal static double GetRon(ElementInstance element)
        => element.Params.TryGetValue("ron", out var v) && v > 0 ? v : DefaultRon;

    internal static double GetIMax(ElementInstance element)
        => element.Params.TryGetValue("iMax", out var v) && v > 0 ? v : DefaultIMax;
}
