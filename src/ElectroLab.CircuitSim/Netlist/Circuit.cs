namespace ElectroLab.CircuitSim.Netlist;

public sealed class Circuit
{
    public required string Ground { get; init; }
    public required IReadOnlyList<ElementInstance> Elements { get; init; }
}

public sealed class ElementInstance
{
    public required string Id { get; init; }
    public required string Model { get; init; }
    public required IReadOnlyDictionary<string, string> Pins { get; init; }
    public required IReadOnlyDictionary<string, double> Params { get; init; }
    public IReadOnlyDictionary<string, bool>? BoolParams { get; init; }
}
