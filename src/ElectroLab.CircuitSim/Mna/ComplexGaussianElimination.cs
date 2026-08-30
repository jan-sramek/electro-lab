using System.Numerics;

namespace ElectroLab.CircuitSim.Mna;

/// <summary>Complex-valued counterpart of <see cref="GaussianElimination"/>, used for AC (phasor) solves.</summary>
public static class ComplexGaussianElimination
{
    public static bool Solve(Complex[,] a, Complex[] b, out Complex[] x, out string? error)
    {
        var n = b.Length;
        x = new Complex[n];
        if (n == 0)
        {
            error = null;
            return true;
        }

        for (var col = 0; col < n; col++)
        {
            var pivot = col;
            var max = a[col, col].Magnitude;
            for (var row = col + 1; row < n; row++)
            {
                var v = a[row, col].Magnitude;
                if (v > max)
                {
                    max = v;
                    pivot = row;
                }
            }

            if (max < 1e-14)
            {
                error = "Singular circuit matrix (check ground connection and floating nodes).";
                return false;
            }

            if (pivot != col)
            {
                for (var j = col; j < n; j++)
                    (a[col, j], a[pivot, j]) = (a[pivot, j], a[col, j]);
                (b[col], b[pivot]) = (b[pivot], b[col]);
            }

            var diag = a[col, col];
            for (var row = col + 1; row < n; row++)
            {
                var factor = a[row, col] / diag;
                if (factor.Magnitude < 1e-18)
                    continue;
                for (var j = col; j < n; j++)
                    a[row, j] -= factor * a[col, j];
                b[row] -= factor * b[col];
            }
        }

        for (var i = n - 1; i >= 0; i--)
        {
            var sum = b[i];
            for (var j = i + 1; j < n; j++)
                sum -= a[i, j] * x[j];
            x[i] = sum / a[i, i];
        }

        error = null;
        return true;
    }
}
