using System.Numerics;
using ElectroLab.CircuitSim.Mna;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

/// <summary>
/// Teaching Arduino Wire host: 5V rail vs GND; SDA/SCL are high-Z (open-drain idle).
/// External pull-ups set the idle-high bus — same lesson as real I2C wiring.
/// </summary>
public sealed class ArduinoI2cModel : IDeviceModel
{
    public string ModelKey => "arduino_i2c";

    public IReadOnlyList<string> Validate(ElementInstance element)
    {
        var errors = new List<string>();
        if (!element.Pins.ContainsKey("v5") || !element.Pins.ContainsKey("gnd")
            || !element.Pins.ContainsKey("sda") || !element.Pins.ContainsKey("scl"))
            errors.Add($"{element.Id}: arduino_i2c requires pins v5, gnd, sda, scl.");
        if (!element.Params.TryGetValue("vHigh", out var vh) || vh <= 0)
            errors.Add($"{element.Id}: arduino_i2c requires params.vHigh > 0.");
        return errors;
    }

    public void RegisterExtras(ElementInstance element, StampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeDc(ElementInstance element, StampContext ctx, DcBiasHint? hint)
    {
        // SDA/SCL stay open-drain idle; tiny leakage keeps an unpulled bus solvable (settles ~0 V).
        const double gLeak = 1e-7;
        ctx.StampConductance(element.Pins["sda"], element.Pins["gnd"], gLeak);
        ctx.StampConductance(element.Pins["scl"], element.Pins["gnd"], gLeak);
        ctx.StampVoltageSource(element.Id, element.Pins["v5"], element.Pins["gnd"], element.Params["vHigh"]);
    }

    public double? BranchCurrent(ElementInstance element, StampContext ctx, double[] solution, DcBiasHint? hint)
        => -ctx.VoltageSourceCurrent(solution, element.Id);

    public void RegisterExtrasAc(ElementInstance element, ComplexStampContext ctx)
        => ctx.RegisterVoltageSource(element.Id);

    public void ContributeAc(ElementInstance element, ComplexStampContext ctx, double omega)
    {
        const double gLeak = 1e-7;
        ctx.StampAdmittance(element.Pins["sda"], element.Pins["gnd"], new Complex(gLeak, 0));
        ctx.StampAdmittance(element.Pins["scl"], element.Pins["gnd"], new Complex(gLeak, 0));
        ctx.StampVoltageSource(element.Id, element.Pins["v5"], element.Pins["gnd"], Complex.Zero);
    }

    public Complex? BranchCurrentAc(ElementInstance element, ComplexStampContext ctx, Complex[] solution, double omega)
        => -ctx.VoltageSourceCurrent(solution, element.Id);
}
