using ElectroLab.CircuitSim.Models;
using ElectroLab.CircuitSim.Netlist;

namespace ElectroLab.CircuitSim.Validation;

public static class NetlistValidator
{
    /// <summary>Hard cap on elements per circuit (each solve is a dense O(n³) elimination).</summary>
    public const int MaxElements = 500;

    /// <summary>Hard cap on distinct nodes referenced by pins (ground included).</summary>
    public const int MaxNodes = 600;

    /// <summary>Internal nodes created by models (e.g. battery ESR midpoint) use this separator.</summary>
    public const string InternalNodeMarker = "__";

    /// <summary>True for engine-internal node ids (e.g. <c>b1__mid</c>) that should not surface to clients.</summary>
    public static bool IsInternalNode(string node) => node.Contains(InternalNodeMarker, StringComparison.Ordinal);

    public static List<string> Validate(Circuit circuit, DeviceModelRegistry registry)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(circuit.Ground))
            errors.Add("circuit.ground is required.");

        if (circuit.Elements.Count == 0)
            errors.Add("circuit.elements must not be empty.");

        if (circuit.Elements.Count > MaxElements)
        {
            errors.Add($"circuit.elements has {circuit.Elements.Count} elements; the limit is {MaxElements}.");
            return errors;
        }

        var ids = new HashSet<string>(StringComparer.Ordinal);
        var nodes = new HashSet<string>(StringComparer.Ordinal);
        if (!string.IsNullOrWhiteSpace(circuit.Ground))
            nodes.Add(circuit.Ground);

        foreach (var el in circuit.Elements)
        {
            if (string.IsNullOrWhiteSpace(el.Id))
            {
                errors.Add("Element id is required.");
                continue;
            }

            if (!ids.Add(el.Id))
                errors.Add($"Duplicate element id '{el.Id}'.");

            // Pin values and params must be well-formed before any model looks at them, otherwise
            // StampContext/ContributeDc would throw instead of returning a validation error.
            var shapeOk = true;
            foreach (var (pin, node) in el.Pins)
            {
                if (string.IsNullOrWhiteSpace(node))
                {
                    errors.Add($"{el.Id}: pin '{pin}' must name a node (got null/empty).");
                    shapeOk = false;
                    continue;
                }
                nodes.Add(node);
            }

            foreach (var (key, value) in el.Params)
            {
                if (!double.IsFinite(value))
                {
                    errors.Add($"{el.Id}: params.{key} must be a finite number (got {value.ToString(System.Globalization.CultureInfo.InvariantCulture)}).");
                    shapeOk = false;
                }
            }

            if (!shapeOk)
                continue;

            if (!registry.TryGet(el.Model, out var model))
            {
                errors.Add($"Unknown model '{el.Model}' on '{el.Id}'.");
                continue;
            }

            errors.AddRange(model.Validate(el));
        }

        if (nodes.Count > MaxNodes)
            errors.Add($"circuit references {nodes.Count} nodes; the limit is {MaxNodes}.");

        return errors;
    }
}
