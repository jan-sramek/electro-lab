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
}

/// <summary>
/// Optional bias from a previous Newton / LED iteration.
/// </summary>
public sealed class DcBiasHint
{
    public Dictionary<string, bool> LedOn { get; } = new(StringComparer.Ordinal);
}
