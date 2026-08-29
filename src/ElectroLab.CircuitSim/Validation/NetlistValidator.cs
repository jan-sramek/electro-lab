using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Validation;

public static class NetlistValidator
{
    public static List<string> Validate(Circuit circuit, DeviceModelRegistry registry)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(circuit.Ground))
            errors.Add("circuit.ground is required.");

        if (circuit.Elements.Count == 0)
            errors.Add("circuit.elements must not be empty.");

        var ids = new HashSet<string>(StringComparer.Ordinal);
        foreach (var el in circuit.Elements)
        {
            if (string.IsNullOrWhiteSpace(el.Id))
            {
                errors.Add("Element id is required.");
                continue;
            }

            if (!ids.Add(el.Id))
                errors.Add($"Duplicate element id '{el.Id}'.");

            if (!registry.TryGet(el.Model, out var model))
            {
                errors.Add($"Unknown model '{el.Model}' on '{el.Id}'.");
                continue;
            }

            errors.AddRange(model.Validate(el));
        }

        return errors;
    }
}
