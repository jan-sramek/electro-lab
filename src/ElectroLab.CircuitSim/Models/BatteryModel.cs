using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Ideal DC voltage source, optionally with series internal resistance (esr).
/// When esr > 0, an internal midpoint node ("{id}__mid") carries the ideal voltage source,
/// with esr as a conductance from the midpoint to pin n — a standard Thévenin equivalent.
/// </summary>
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
        if (element.Params.TryGetValue("esr", out var esr) && esr < 0)
            errors.Add($"{element.Id}: battery params.esr must be >= 0.");
        return errors;
    }

    public IReadOnlyList<string> ExtraNodes(ElementInstance element)
        => GetEsr(element) > 0 ? [MidNode(element)] : [];

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        var v = element.Params["v"];
        var esr = GetEsr(element);
        var p = element.Pins["p"];
        var n = element.Pins["n"];

        if (esr > 0)
        {
            var mid = MidNode(element);
            ctx.StampVoltageSource(element.Id, p, mid, v);
            ctx.StampConductance(mid, n, 1.0 / esr);
        }
        else
        {
            ctx.StampVoltageSource(element.Id, p, n, v);
        }
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    public void RegisterExtrasAc(ElementInstance element, ComplexStampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
    {
        // Ideal battery has no AC component — modeled as an AC short (0V source) in series with esr.
        var esr = GetEsr(element);
        var p = element.Pins["p"];
        var n = element.Pins["n"];

        if (esr > 0)
        {
            var mid = MidNode(element);
            ctx.StampVoltageSource(element.Id, p, mid, Complex.Zero);
            ctx.StampAdmittance(mid, n, new Complex(1.0 / esr, 0));
        }
        else
        {
            ctx.StampVoltageSource(element.Id, p, n, Complex.Zero);
        }
    }

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    private static double GetEsr(ElementInstance element)
        => element.Params.TryGetValue("esr", out var esr) ? esr : 0;

    private static string MidNode(ElementInstance element) => $"{element.Id}__mid";
}
