using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Pure AC excitation source: contributes 0V in DC/transient (short), and a fixed phasor
/// mag∠phase (independent of the sweep frequency) in AC analysis.
/// </summary>
public sealed class AcSourceModel : IDeviceModel
{
    public string ModelKey => "ac_source";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("p") || !element.Pins.ContainsKey("n"))
            errors.Add($"{element.Id}: ac_source requires pins p, n.");
        if (!element.Params.TryGetValue("mag", out var mag) || mag < 0)
            errors.Add($"{element.Id}: ac_source requires params.mag >= 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
        => ctx.StampVoltageSource(element.Id, element.Pins["p"], element.Pins["n"], 0);

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    public void RegisterExtrasAc(ElementInstance element, ComplexStampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
    {
        var mag = element.Params["mag"];
        var phaseDeg = element.Params.GetValueOrDefault("phase", 0);
        var phaseRad = phaseDeg * Math.PI / 180.0;
        var phasor = Complex.FromPolarCoordinates(mag, phaseRad);
        ctx.StampVoltageSource(element.Id, element.Pins["p"], element.Pins["n"], phasor);
    }

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
        => -ctx.VoltageSourceCurrent(solution, element.Id);
}
