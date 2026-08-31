using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching SSD1306 I2C OLED: VCC/GND supply load; SDA/SCL are high-Z (open-drain idle).
/// Does not decode I2C — use external pull-ups and the address param for wiring lessons.
/// </summary>
public sealed class Ssd1306Model : IDeviceModel
{
    public string ModelKey => "ssd1306";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("vcc") || !element.Pins.ContainsKey("gnd")
            || !element.Pins.ContainsKey("sda") || !element.Pins.ContainsKey("scl"))
            errors.Add($"{element.Id}: ssd1306 requires pins vcc, gnd, sda, scl.");
        if (!element.Params.TryGetValue("rLoad", out var r) || r <= 0)
            errors.Add($"{element.Id}: ssd1306 requires params.rLoad > 0.");
        if (!element.Params.TryGetValue("addr", out var addr) || addr < 0 || addr > 127)
            errors.Add($"{element.Id}: ssd1306 requires params.addr in 0..127 (7-bit).");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx) { }

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        // SDA/SCL stay open-drain idle; tiny leakage keeps an unpulled bus solvable (settles ~0 V).
        const double gLeak = 1e-7;
        ctx.StampConductance(element.Pins["sda"], element.Pins["gnd"], gLeak);
        ctx.StampConductance(element.Pins["scl"], element.Pins["gnd"], gLeak);
        // Supply draws teaching load current.
        var g = 1.0 / element.Params["rLoad"];
        ctx.StampConductance(element.Pins["vcc"], element.Pins["gnd"], g);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
    {
        var vv = ctx.NodeVoltage(solution, element.Pins["vcc"]);
        var vg = ctx.NodeVoltage(solution, element.Pins["gnd"]);
        return (vv - vg) / element.Params["rLoad"];
    }

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
    {
        const double gLeak = 1e-7;
        ctx.StampAdmittance(element.Pins["sda"], element.Pins["gnd"], new Complex(gLeak, 0));
        ctx.StampAdmittance(element.Pins["scl"], element.Pins["gnd"], new Complex(gLeak, 0));
        var g = 1.0 / element.Params["rLoad"];
        ctx.StampAdmittance(element.Pins["vcc"], element.Pins["gnd"], new Complex(g, 0));
    }

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
    {
        var vv = ctx.NodeVoltage(solution, element.Pins["vcc"]);
        var vg = ctx.NodeVoltage(solution, element.Pins["gnd"]);
        return (vv - vg) / element.Params["rLoad"];
    }
}
