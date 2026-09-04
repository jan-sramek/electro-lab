using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Analysis;

/// <summary>
/// Single source of truth for the piecewise-linear bias loop shared by the DC operating point,
/// the transient per-step settle, and the transient initFromDc seed. Keeping the initial hints
/// and the per-iteration update in one place guarantees the three paths cannot diverge.
/// </summary>
internal static class PiecewiseBias
{
    public const string NotSettledWarning =
        "Diode/LED/BJT/MOSFET/relay/NE555/op-amp bias iteration did not fully settle; using last state.";

    /// <summary>Initial on/off guesses for every piecewise device in the netlist.</summary>
    public static void Initialize(IEnumerable<(ElementInstance el, IDeviceModel model)> models, DcBiasHint hint)
    {
        foreach (var (el, _) in models)
        {
            if (IsPiecewiseDiode(el.Model))
                hint.LedOn[el.Id] = true;
            if (IsZener(el.Model))
            {
                hint.LedOn[el.Id] = false;
                hint.ZenerRevOn[el.Id] = true;
            }
            if (IsVreg(el.Model))
                hint.VregOn[el.Id] = true;
            if (IsPiecewiseBjt(el.Model))
                hint.BjtOn[el.Id] = true;
            if (IsPiecewiseMosfet(el.Model))
                hint.MosfetOn[el.Id] = true;
            if (IsPiecewiseRelay(el.Model))
                hint.RelayOn[el.Id] = false;
            if (IsNe555(el.Model))
                hint.Ne555High[el.Id] = false;
            if (IsPiecewiseMotor(el.Model))
                hint.MotorOn[el.Id] = true;
        }
    }

    /// <summary>
    /// One bias-update pass over all piecewise devices using the latest solution.
    /// Returns true when any device changed state (caller must restamp and re-solve).
    /// </summary>
    public static bool Update(
        IEnumerable<(ElementInstance el, IDeviceModel model)> models,
        StampContext ctx,
        double[] solution,
        DcBiasHint hint)
    {
        var changed = false;
        foreach (var (el, model) in models)
        {
            if (IsPiecewiseDiode(el.Model))
            {
                var va = ctx.NodeVoltage(solution, el.Pins["a"]);
                var vc = ctx.NodeVoltage(solution, el.Pins["c"]);
                var vf = el.Params["vf"];
                var current = model.BranchCurrent(el, ctx, solution, hint) ?? 0;
                var previouslyOn = hint.LedOn[el.Id];
                var nextOn = previouslyOn ? current > 1e-12 : va - vc >= vf;
                if (nextOn != previouslyOn)
                {
                    hint.LedOn[el.Id] = nextOn;
                    changed = true;
                }
            }
            else if (IsZener(el.Model))
            {
                if (ZenerModel.UpdateBias(el, ctx, solution, hint))
                    changed = true;
            }
            else if (IsVreg(el.Model))
            {
                if (Vreg7805Model.UpdateBias(el, ctx, solution, hint))
                    changed = true;
            }
            else if (IsPiecewiseBjt(el.Model))
            {
                var vb = ctx.NodeVoltage(solution, el.Pins["b"]);
                var ve = ctx.NodeVoltage(solution, el.Pins["e"]);
                var vf = el.Params["vf"];
                var rb = el.Params["rb"];
                var previouslyOn = hint.BjtOn[el.Id];
                var baseCurrent = previouslyOn ? (vb - ve - vf) / rb : 0;
                var nextOn = previouslyOn ? baseCurrent > 1e-12 : vb - ve >= vf;
                if (nextOn != previouslyOn)
                {
                    hint.BjtOn[el.Id] = nextOn;
                    changed = true;
                }
            }
            else if (IsPiecewiseMosfet(el.Model))
            {
                if (NmosModel.UpdateGateBias(el, ctx, solution, hint))
                    changed = true;
            }
            else if (IsPiecewiseRelay(el.Model))
            {
                if (RelayModel.UpdateCoilBias(el, ctx, solution, hint))
                    changed = true;
            }
            else if (IsNe555(el.Model))
            {
                if (Ne555Model.UpdateLatch(el, ctx, solution, hint))
                    changed = true;
            }
            else if (IsPiecewiseMotor(el.Model))
            {
                if (DcMotorModel.UpdateBias(el, ctx, solution, hint))
                    changed = true;
            }
            else if (IsOpAmp(el.Model))
            {
                if (OpAmpModel.UpdateRailBias(el, ctx, solution, hint))
                    changed = true;
            }
        }

        return changed;
    }

    /// <summary>Warnings for op-amps that ended the bias loop clamped to a rail.</summary>
    public static void AddRailWarnings(DcBiasHint hint, List<string> warnings)
    {
        foreach (var (id, rail) in hint.OpAmpRail)
        {
            if (rail == 0) continue;
            var side = rail > 0 ? "vMax" : "vMin";
            warnings.Add($"{id}: op-amp output clamped to teaching rail ({side}).");
        }
    }

    /// <summary>All pin nodes plus every model's internal extra nodes (ground included).</summary>
    public static HashSet<string> CollectNodes(Circuit circuit, IEnumerable<(ElementInstance el, IDeviceModel model)> models)
    {
        var nodes = new HashSet<string>(StringComparer.Ordinal) { circuit.Ground };
        foreach (var el in circuit.Elements)
        {
            foreach (var n in el.Pins.Values)
                nodes.Add(n);
        }

        foreach (var (el, model) in models)
        {
            foreach (var n in model.ExtraNodes(el))
                nodes.Add(n);
        }

        return nodes;
    }

    public static bool IsPiecewiseDiode(string model) =>
        model.Equals("led", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("diode", StringComparison.OrdinalIgnoreCase) ||
        model.Equals("buzzer", StringComparison.OrdinalIgnoreCase);

    public static bool IsZener(string model) =>
        model.Equals("zener", StringComparison.OrdinalIgnoreCase);

    public static bool IsVreg(string model) =>
        model.Equals("vreg_7805", StringComparison.OrdinalIgnoreCase);

    public static bool IsPiecewiseBjt(string model) =>
        model.Equals("bjt_npn", StringComparison.OrdinalIgnoreCase);

    public static bool IsPiecewiseMosfet(string model) =>
        model.Equals("nmos", StringComparison.OrdinalIgnoreCase);

    public static bool IsPiecewiseRelay(string model) =>
        model.Equals("relay", StringComparison.OrdinalIgnoreCase);

    public static bool IsNe555(string model) =>
        model.Equals("ne555", StringComparison.OrdinalIgnoreCase);

    public static bool IsPiecewiseMotor(string model) =>
        model.Equals("dc_motor", StringComparison.OrdinalIgnoreCase);

    public static bool IsOpAmp(string model) =>
        model.Equals("op_amp", StringComparison.OrdinalIgnoreCase);
}
