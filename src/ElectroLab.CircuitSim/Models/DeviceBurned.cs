using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Models;

internal static class DeviceBurned
{
    public static bool IsBurned(ElementInstance element)
        => element.BoolParams is not null
           && element.BoolParams.TryGetValue("burned", out var burned)
           && burned;
}
