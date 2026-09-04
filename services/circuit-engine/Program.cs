using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using ElectroLab.CircuitSim;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Netlist;
using ElectroLab.CircuitSim.Results;
using ElectroLab.CircuitSim.Validation;
using Microsoft.AspNetCore.Http.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(_ => new CircuitSimulator());
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// A netlist within the element/node limits is a few hundred KB at most; anything larger is abuse.
builder.WebHost.ConfigureKestrel(k => k.Limits.MaxRequestBodySize = ApiLimits.MaxRequestBodyBytes);

builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowAnyOrigin());
});

var app = builder.Build();

// Global exception boundary: never leak a stack trace; always answer with the SimulateResponse envelope.
app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
    var ex = feature?.Error;
    var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("CircuitEngine");

    int status;
    string message;
    switch (ex)
    {
        case BadHttpRequestException bad:
            // Malformed JSON, oversized body (413), etc. Kestrel's message is already client-safe.
            status = bad.StatusCode;
            message = bad.StatusCode == StatusCodes.Status413PayloadTooLarge
                ? $"Request body exceeds {ApiLimits.MaxRequestBodyBytes} bytes."
                : "Malformed request: " + bad.Message;
            logger.LogInformation(ex, "Rejected request ({Status}).", status);
            break;
        case JsonException:
            status = StatusCodes.Status400BadRequest;
            message = "Malformed JSON request body.";
            logger.LogInformation(ex, "Rejected request (400).");
            break;
        default:
            status = StatusCodes.Status500InternalServerError;
            message = "Internal simulator error.";
            logger.LogError(ex, "Unhandled exception while serving {Path}.", context.Request.Path);
            break;
    }

    context.Response.StatusCode = status;
    var jsonOptions = context.RequestServices.GetRequiredService<Microsoft.Extensions.Options.IOptions<JsonOptions>>().Value.SerializerOptions;
    await context.Response.WriteAsJsonAsync(SimulateResponse.Fail("unknown", message), jsonOptions);
}));

app.UseCors();

app.MapGet("/api/circuit/health", () => Results.Ok(new { status = "ok", service = "circuit-engine" }));

app.MapPost("/api/circuit/simulate", async (HttpRequest http, CircuitSimulator simulator, ILogger<Program> logger) =>
{
    // Read the body ourselves so malformed / oversized requests still get the JSON envelope (not a bare 400/413).
    SimulateRequest? request;
    try
    {
        request = await http.ReadFromJsonAsync<SimulateRequest>(http.HttpContext.RequestAborted);
    }
    catch (BadHttpRequestException bad) when (bad.StatusCode == StatusCodes.Status413PayloadTooLarge)
    {
        return Results.Json(
            SimulateResponse.Fail("unknown", $"Request body exceeds {ApiLimits.MaxRequestBodyBytes} bytes."),
            statusCode: StatusCodes.Status413PayloadTooLarge);
    }
    catch (Exception ex) when (ex is JsonException or BadHttpRequestException or InvalidOperationException)
    {
        return Results.BadRequest(SimulateResponse.Fail("unknown", "Malformed JSON request body."));
    }

    if (request is null)
        return Results.BadRequest(SimulateResponse.Fail("dcOp", "Request body is required."));

    if (request.Circuit is null)
        return Results.BadRequest(SimulateResponse.Fail(request.Analysis?.Type ?? "dcOp", "circuit is required."));

    var analysisType = string.IsNullOrWhiteSpace(request.Analysis?.Type)
        ? "dcOp"
        : request.Analysis.Type;

    Circuit circuit;
    try
    {
        circuit = RequestMapper.ToCircuit(request.Circuit);
    }
    catch (Exception ex) when (ex is InvalidOperationException or ArgumentException or FormatException)
    {
        return Results.BadRequest(SimulateResponse.Fail(analysisType, ex.Message));
    }

    var optionErrors = new List<string>();
    var options = RequestMapper.ToOptions(analysisType, request.Analysis, optionErrors);
    if (optionErrors.Count > 0)
        return Results.BadRequest(SimulateResponse.Fail(analysisType, optionErrors.ToArray()));

    SimulationResult result;
    try
    {
        result = simulator.Simulate(circuit, analysisType, options);
    }
    catch (Exception ex) when (ex is ArgumentException or KeyNotFoundException or InvalidOperationException)
    {
        // Netlist shapes the validator did not anticipate: the client's input is at fault, not the server.
        logger.LogWarning(ex, "Simulation rejected netlist for analysis {Analysis}.", analysisType);
        return Results.BadRequest(SimulateResponse.Fail(analysisType, "Invalid netlist: " + ex.Message));
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Simulator threw for analysis {Analysis}.", analysisType);
        return Results.Json(
            SimulateResponse.Fail(analysisType, "Internal simulator error."),
            statusCode: StatusCodes.Status500InternalServerError);
    }

    var schemaVersion = request.SchemaVersion <= 0 ? 1 : request.SchemaVersion;
    if (result.Ok && result.HasNonFiniteValues())
    {
        logger.LogWarning("Simulation produced a non-finite solution for analysis {Analysis}.", analysisType);
        return Results.BadRequest(SimulateResponse.Fail(analysisType, "solution is not finite (check for floating nodes or degenerate element values)."));
    }

    var response = SimulateResponse.From(result, schemaVersion);
    return result.Ok ? Results.Ok(response) : Results.BadRequest(response);
});

app.Run();

/// <summary>API-boundary limits. Solver-level limits live on the analyses/validator themselves.</summary>
internal static class ApiLimits
{
    public const long MaxRequestBodyBytes = 1024 * 1024;
    public const int MaxElements = NetlistValidator.MaxElements;
    public const int MaxNodes = NetlistValidator.MaxNodes;
    public const int MaxTranSteps = TransientAnalysis.MaxSteps;
    public const int MaxAcPointsPerDecade = AcAnalysis.MaxPointsPerDecade;
    public const int MaxAcTotalPoints = AcAnalysis.MaxTotalPoints;
}

internal static class RequestMapper
{
    public static Circuit ToCircuit(CircuitDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Ground))
            throw new InvalidOperationException("circuit.ground is required.");

        var dtoElements = dto.Elements ?? [];
        if (dtoElements.Count > ApiLimits.MaxElements)
            throw new InvalidOperationException($"circuit.elements has {dtoElements.Count} elements; the limit is {ApiLimits.MaxElements}.");

        var elements = new List<ElementInstance>();
        foreach (var el in dtoElements)
        {
            if (el is null || string.IsNullOrWhiteSpace(el.Id) || string.IsNullOrWhiteSpace(el.Model))
                throw new InvalidOperationException("Each element needs id and model.");

            var pins = new Dictionary<string, string>(StringComparer.Ordinal);
            foreach (var (pin, node) in el.Pins ?? new Dictionary<string, string?>())
            {
                if (string.IsNullOrWhiteSpace(node))
                    throw new InvalidOperationException($"{el.Id}: pin '{pin}' must name a node (got null/empty).");
                pins[pin] = node;
            }

            var pars = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
            var bools = new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase);

            if (el.Params is not null)
            {
                foreach (var (key, value) in el.Params)
                {
                    if (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False)
                    {
                        bools[key] = value.GetBoolean();
                    }
                    else if (value.ValueKind == JsonValueKind.Number)
                    {
                        pars[key] = RequireFinite(el.Id, key, value.GetDouble());
                    }
                    else if (value.ValueKind == JsonValueKind.String &&
                             double.TryParse(value.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var d))
                    {
                        pars[key] = RequireFinite(el.Id, key, d);
                    }
                }
            }

            elements.Add(new ElementInstance
            {
                Id = el.Id,
                Model = el.Model,
                Pins = pins,
                Params = pars,
                BoolParams = bools
            });
        }

        return new Circuit
        {
            Ground = dto.Ground,
            Elements = elements
        };
    }

    /// <summary>
    /// Builds analysis options, substituting defaults only for ABSENT fields. A supplied value that is
    /// non-finite, non-positive, or exceeds the solver's work caps is reported in <paramref name="errors"/>.
    /// </summary>
    public static AnalysisOptions? ToOptions(string analysisType, AnalysisDto? dto, List<string> errors)
    {
        if (analysisType.Equals("tran", StringComparison.OrdinalIgnoreCase))
        {
            var tStop = Positive(dto?.TStop, "tStop", 0.005, errors);
            var dt = Positive(dto?.Dt, "dt", 5e-5, errors);
            if (errors.Count > 0)
                return null;

            if (dt > tStop)
            {
                errors.Add("tran requires dt <= tStop.");
                return null;
            }

            var steps = TransientAnalysis.StepCount(tStop, dt);
            if (steps > ApiLimits.MaxTranSteps)
            {
                errors.Add($"tran would take {steps} steps (tStop/dt); the limit is {ApiLimits.MaxTranSteps}. Increase dt or reduce tStop.");
                return null;
            }

            return new AnalysisOptions
            {
                TStop = tStop,
                Dt = dt,
                InitFromDc = dto?.InitFromDc ?? false
            };
        }

        if (analysisType.Equals("ac", StringComparison.OrdinalIgnoreCase))
        {
            var freq = Positive(dto?.Freq, "freq", 1000, errors);
            var fStart = dto?.FStart is null ? null : (double?)Positive(dto.FStart, "fStart", 0, errors);
            var fStop = dto?.FStop is null ? null : (double?)Positive(dto.FStop, "fStop", 0, errors);
            var ppd = dto?.PointsPerDecade ?? 10;
            if (dto?.PointsPerDecade is not null && ppd <= 0)
                errors.Add("analysis.pointsPerDecade must be > 0.");
            if (ppd > ApiLimits.MaxAcPointsPerDecade)
                errors.Add($"analysis.pointsPerDecade {ppd} exceeds the limit of {ApiLimits.MaxAcPointsPerDecade}.");
            if (errors.Count > 0)
                return null;

            if (fStart is double fs && fStop is double fe)
            {
                if (fe < fs)
                {
                    errors.Add("ac requires fStop >= fStart.");
                    return null;
                }

                var points = AcAnalysis.SweepPointCount(fs, fe, ppd);
                if (points > ApiLimits.MaxAcTotalPoints)
                {
                    errors.Add($"ac sweep would produce {points.ToString("0", CultureInfo.InvariantCulture)} points; the limit is {ApiLimits.MaxAcTotalPoints}. Narrow fStart/fStop or lower pointsPerDecade.");
                    return null;
                }
            }

            return new AnalysisOptions
            {
                Freq = freq,
                FStart = fStart,
                FStop = fStop,
                PointsPerDecade = ppd
            };
        }

        return null;
    }

    private static double Positive(double? supplied, string field, double fallback, List<string> errors)
    {
        if (supplied is null)
            return fallback;
        var v = supplied.Value;
        if (!double.IsFinite(v) || v <= 0)
        {
            errors.Add($"analysis.{field} must be a finite number > 0 (got {v.ToString(CultureInfo.InvariantCulture)}).");
            return fallback;
        }
        return v;
    }

    private static double RequireFinite(string elementId, string key, double value)
    {
        if (!double.IsFinite(value))
            throw new InvalidOperationException($"{elementId}: params.{key} must be a finite number (got {value.ToString(CultureInfo.InvariantCulture)}).");
        return value;
    }
}

internal sealed class SimulateRequest
{
    public int SchemaVersion { get; set; } = 1;
    public AnalysisDto? Analysis { get; set; }
    public CircuitDto? Circuit { get; set; }
}

internal sealed class AnalysisDto
{
    public string Type { get; set; } = "dcOp";
    public double? TStop { get; set; }
    public double? Dt { get; set; }
    public bool? InitFromDc { get; set; }
    public double? Freq { get; set; }
    public double? FStart { get; set; }
    public double? FStop { get; set; }
    public int? PointsPerDecade { get; set; }
}

internal sealed class CircuitDto
{
    public string Ground { get; set; } = "gnd";
    public List<ElementDto>? Elements { get; set; }
}

internal sealed class ElementDto
{
    public string Id { get; set; } = "";
    public string Model { get; set; } = "";
    public Dictionary<string, string?>? Pins { get; set; }
    public Dictionary<string, JsonElement>? Params { get; set; }
}

internal sealed class SimulateResponse
{
    public int SchemaVersion { get; init; } = 1;
    public bool Ok { get; init; }
    public string AnalysisType { get; init; } = "dcOp";
    public string[] Errors { get; init; } = [];
    public string[] Warnings { get; init; } = [];
    public DcOpDto? DcOp { get; init; }
    public TranDto? Tran { get; init; }
    public AcDto? Ac { get; init; }

    public static SimulateResponse Fail(string analysisType, params string[] errors) => new()
    {
        Ok = false,
        AnalysisType = analysisType,
        Errors = errors
    };

    /// <summary>Maps a library result to the wire DTO, dropping engine-internal nodes (e.g. <c>b1__mid</c>).</summary>
    public static SimulateResponse From(SimulationResult result, int schemaVersion) => new()
    {
        SchemaVersion = schemaVersion,
        Ok = result.Ok,
        AnalysisType = result.AnalysisType,
        Errors = result.Errors.ToArray(),
        Warnings = result.Warnings.ToArray(),
        DcOp = result.DcOp is null
            ? null
            : new DcOpDto
            {
                NodeVoltages = result.DcOp.NodeVoltages
                    .Where(kv => !NetlistValidator.IsInternalNode(kv.Key))
                    .ToDictionary(kv => kv.Key, kv => kv.Value),
                BranchCurrents = result.DcOp.BranchCurrents.ToDictionary(kv => kv.Key, kv => kv.Value)
            },
        Tran = result.Tran is null
            ? null
            : new TranDto
            {
                Time = result.Tran.Time.ToList(),
                NodeVoltages = result.Tran.NodeVoltages
                    .Where(s => !NetlistValidator.IsInternalNode(s.Id))
                    .Select(s => new TranSeriesDto { Id = s.Id, Values = s.Values.ToList() })
                    .ToList(),
                BranchCurrents = result.Tran.BranchCurrents
                    .Select(s => new TranSeriesDto { Id = s.Id, Values = s.Values.ToList() })
                    .ToList()
            },
        Ac = result.Ac is null
            ? null
            : new AcDto
            {
                Points = result.Ac.Points.Select(p => new AcPointDto
                {
                    Frequency = p.Frequency,
                    NodeVoltages = p.NodeVoltages
                        .Where(kv => !NetlistValidator.IsInternalNode(kv.Key))
                        .ToDictionary(
                            kv => kv.Key,
                            kv => new PhasorDto { Mag = kv.Value.Mag, PhaseDeg = kv.Value.PhaseDeg }),
                    BranchCurrents = p.BranchCurrents.ToDictionary(
                        kv => kv.Key,
                        kv => new PhasorDto { Mag = kv.Value.Mag, PhaseDeg = kv.Value.PhaseDeg })
                }).ToList()
            }
    };
}

internal sealed class DcOpDto
{
    public Dictionary<string, double> NodeVoltages { get; init; } = new();
    public Dictionary<string, double> BranchCurrents { get; init; } = new();
}

internal sealed class TranDto
{
    public List<double> Time { get; init; } = [];
    public List<TranSeriesDto> NodeVoltages { get; init; } = [];
    public List<TranSeriesDto> BranchCurrents { get; init; } = [];
}

internal sealed class TranSeriesDto
{
    public string Id { get; init; } = "";
    public List<double> Values { get; init; } = [];
}

internal sealed class AcDto
{
    public List<AcPointDto> Points { get; init; } = [];
}

internal sealed class AcPointDto
{
    public double Frequency { get; init; }
    public Dictionary<string, PhasorDto> NodeVoltages { get; init; } = new();
    public Dictionary<string, PhasorDto> BranchCurrents { get; init; } = new();
}

internal sealed class PhasorDto
{
    public double Mag { get; init; }
    public double PhaseDeg { get; init; }
}

public partial class Program;
