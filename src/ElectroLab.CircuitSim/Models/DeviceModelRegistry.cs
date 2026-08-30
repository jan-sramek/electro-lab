using ElectroLab.CircuitSim.Models;

namespace ElectroLab.CircuitSim.Models;

public sealed class DeviceModelRegistry
{
    private readonly Dictionary<string, IDeviceModel> _models;

    public DeviceModelRegistry(IEnumerable<IDeviceModel>? models = null)
    {
        var list = models?.ToList() ?? DefaultModels();
        _models = list.ToDictionary(m => m.ModelKey, StringComparer.OrdinalIgnoreCase);
    }

    public static List<IDeviceModel> DefaultModels() =>
    [
        new ResistorModel(),
        new BatteryModel(),
        new LedModel(),
        new DiodeModel(),
        new SwitchModel(),
        new CurrentSourceModel(),
        new CapacitorModel(),
        new InductorModel(),
        new PotentiometerModel(),
        new PulseSourceModel(),
        new OpAmpModel(),
        new BjtNpnModel(),
        new RelayModel(),
        new AcSourceModel(),
        new AmmeterModel()
    ];

    public bool TryGet(string modelKey, out IDeviceModel model)
        => _models.TryGetValue(modelKey, out model!);

    public IEnumerable<IDeviceModel> All => _models.Values;
}
