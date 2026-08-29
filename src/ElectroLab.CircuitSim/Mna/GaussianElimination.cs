namespace ElectroLab.CircuitSim.Mna;

public static class GaussianElimination
{
    public static bool Solve(double[,] a, double[] b, out double[] x, out string? error)
    {
        var n = b.Length;
        x = new double[n];
        if (n == 0)
        {
            error = null;
            return true;
        }

        // Augment in place: use a copy of columns + b as last conceptually via separate b
        for (var col = 0; col < n; col++)
        {
            var pivot = col;
            var max = Math.Abs(a[col, col]);
            for (var row = col + 1; row < n; row++)
            {
                var v = Math.Abs(a[row, col]);
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
                if (Math.Abs(factor) < 1e-18)
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
