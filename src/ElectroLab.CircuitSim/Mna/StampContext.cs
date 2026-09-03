namespace ElectroLab.CircuitSim.Mna;

/// <summary>
/// Builds and solves a dense MNA system G * x = b for DC analysis.
/// Unknowns: non-ground node voltages, then voltage-source branch currents.
/// </summary>
public sealed class StampContext
{
    private readonly Dictionary<string, int> _nodeIndex;
    private readonly List<string> _voltageSourceIds = [];
    private readonly Dictionary<string, int> _vsIndex = new(StringComparer.Ordinal);
    private double[,]? _g;
    private double[]? _b;
    private bool _locked;

    public StampContext(IEnumerable<string> nodes, string ground)
    {
        Ground = ground;
        var ordered = nodes
            .Where(n => !string.Equals(n, ground, StringComparison.Ordinal))
            .Distinct(StringComparer.Ordinal)
            .OrderBy(n => n, StringComparer.Ordinal)
            .ToList();

        _nodeIndex = new Dictionary<string, int>(StringComparer.Ordinal);
        for (var i = 0; i < ordered.Count; i++)
            _nodeIndex[ordered[i]] = i;

        NodeCount = ordered.Count;
        Nodes = ordered;
    }

    public string Ground { get; }
    public int NodeCount { get; }
    public IReadOnlyList<string> Nodes { get; }
    public int VoltageSourceCount => _voltageSourceIds.Count;
    public int Size => NodeCount + VoltageSourceCount;
    public IReadOnlyList<string> VoltageSourceIds => _voltageSourceIds;

    public void RegisterVoltageSource(string elementId)
    {
        if (_vsIndex.ContainsKey(elementId))
            return;
        if (_locked)
            throw new InvalidOperationException($"Cannot register '{elementId}' after BeginStamp.");
        _vsIndex[elementId] = NodeCount + _voltageSourceIds.Count;
        _voltageSourceIds.Add(elementId);
    }

    public void BeginStamp()
    {
        _locked = true;
        var n = Size;
        _g = new double[n, n];
        _b = new double[n];
    }

    public int? NodeRow(string node)
    {
        if (string.Equals(node, Ground, StringComparison.Ordinal))
            return null;
        if (!_nodeIndex.TryGetValue(node, out var idx))
            throw new KeyNotFoundException($"Unknown node '{node}'.");
        return idx;
    }

    /// <summary>
    /// Tiny conductance from every unknown node to ground so piecewise devices can turn
    /// off without leaving a floating node (singular matrix).
    /// </summary>
    public void StampGminToGround(double gmin = 1e-12)
    {
        foreach (var node in Nodes)
            StampConductance(node, Ground, gmin);
    }

    public void StampConductance(string nodeA, string nodeB, double g)
    {
        EnsureStamping();
        var a = NodeRow(nodeA);
        var b = NodeRow(nodeB);
        if (a is int ai)
            _g![ai, ai] += g;
        if (b is int bi)
            _g![bi, bi] += g;
        if (a is int a2 && b is int b2)
        {
            _g![a2, b2] -= g;
            _g![b2, a2] -= g;
        }
    }

    public void StampCurrentSource(string nodeFrom, string nodeTo, double amps)
    {
        EnsureStamping();
        var from = NodeRow(nodeFrom);
        var to = NodeRow(nodeTo);
        if (from is int f)
            _b![f] -= amps;
        if (to is int t)
            _b![t] += amps;
    }

    public void StampVoltageSource(string elementId, string nodeP, string nodeN, double voltage)
    {
        EnsureStamping();
        if (!_vsIndex.TryGetValue(elementId, out var k))
            throw new InvalidOperationException($"Voltage source '{elementId}' was not registered.");

        var p = NodeRow(nodeP);
        var n = NodeRow(nodeN);

        if (p is int pi)
        {
            _g![pi, k] += 1;
            _g![k, pi] += 1;
        }

        if (n is int ni)
        {
            _g![ni, k] -= 1;
            _g![k, ni] -= 1;
        }

        _b![k] += voltage;
    }

    /// <summary>VCVS: V(nodeP)-V(nodeN) = gain * (V(ctrlP)-V(ctrlN)). Uses registered VS branch elementId.</summary>
    public void StampVoltageControlledVoltageSource(
        string elementId, string nodeP, string nodeN, string ctrlP, string ctrlN, double gain)
    {
        EnsureStamping();
        if (!_vsIndex.TryGetValue(elementId, out var k))
            throw new InvalidOperationException($"Voltage source '{elementId}' was not registered.");

        var p = NodeRow(nodeP);
        var n = NodeRow(nodeN);
        var cp = NodeRow(ctrlP);
        var cn = NodeRow(ctrlN);

        if (p is int pi)
        {
            _g![pi, k] += 1;
            _g![k, pi] += 1;
        }

        if (n is int ni)
        {
            _g![ni, k] -= 1;
            _g![k, ni] -= 1;
        }

        if (cp is int cpi)
            _g![k, cpi] -= gain;

        if (cn is int cni)
            _g![k, cni] += gain;
    }

    public bool TrySolve(out double[] solution, out string? error)
    {
        if (_g is null || _b is null)
        {
            solution = [];
            error = "Matrix not initialized.";
            return false;
        }

        var n = Size;
        if (n == 0)
        {
            solution = [];
            error = null;
            return true;
        }

        var a = (double[,])_g.Clone();
        var b = (double[])_b.Clone();
        return GaussianElimination.Solve(a, b, out solution, out error);
    }

    public double NodeVoltage(double[] solution, string node)
    {
        if (string.Equals(node, Ground, StringComparison.Ordinal))
            return 0;
        return solution[_nodeIndex[node]];
    }

    public double VoltageSourceCurrent(double[] solution, string elementId)
        => solution[_vsIndex[elementId]];

    private void EnsureStamping()
    {
        if (_g is null || _b is null)
            throw new InvalidOperationException("Call BeginStamp first.");
    }
}
