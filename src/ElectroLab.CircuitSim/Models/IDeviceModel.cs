using System.Numerics;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

public interface IDeviceModel
{
    string ModelKey { get; }
    IReadOnlyList<string> Validate(ElementInstance element);
    void RegisterExtras(ElementInstance element, StampContext ctx);
    void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint);
    double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint);

    /// <summary>Default: same stamp as DC (for R, V, I, switch, diode).</summary>
    void ContributeTransient(
        ElementInstance element,
        StampContext ctx,
        DcBiasHint? hint,
        TransientState state,
        double dt)
        => ContributeDc(element, ctx, hint);

    double? BranchCurrentTransient(
        ElementInstance element,
        StampContext ctx,
        double[] solution,
        DcBiasHint? hint,
        TransientState state,
        double dt)
        => BranchCurrent(element, ctx, solution, hint);

    /// <summary>Extra internal nodes this device needs beyond its pins (e.g. battery ESR midpoint).</summary>
    IReadOnlyList<string> ExtraNodes(ElementInstance element) => [];

    /// <summary>Default: no voltage-source branch needed for AC. Override alongside ContributeAc when one is required.</summary>
    void RegisterExtrasAc(ElementInstance element, ComplexStampContext ctx) { }

    /// <summary>
    /// AC small-signal stamp at angular frequency omega (rad/s).
    /// Default: no stamp (open circuit) — used for nonlinear teaching devices (led, diode, bjt_npn)
    /// whose small-signal linearization around a bias point is out of scope for AC analysis v1.
    /// </summary>
    void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega) { }

    /// <summary>Default: not reported in AC results.</summary>
    Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega) => null;
}

/// <summary>
/// Optional bias from a previous Newton / piecewise-device iteration.
/// </summary>
public sealed class DcBiasHint
{
    public Dictionary<string, bool> LedOn { get; } = new(StringComparer.Ordinal);
    public Dictionary<string, bool> BjtOn { get; } = new(StringComparer.Ordinal);
}
