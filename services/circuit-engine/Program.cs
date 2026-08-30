using System.Text.Json;
using System.Text.Json.Serialization;
using ElectroLab.CircuitSim;
using ElectroLab.CircuitSim.Analysis;
using ElectroLab.CircuitSim.Netlist;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(_ => new CircuitSimulator());
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowAnyOrigin());
});

var app = builder.Build();
app.UseCors();

app.MapGet("/api/circuit/health", () => Results.Ok(new { status = "ok", service = "circuit-engine" }));

app.MapPost("/api/circuit/simulate", (SimulateRequest request, CircuitSimulator simulator) =>
{
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
    catch (Exception ex)
    {
        return Results.BadRequest(SimulateResponse.Fail(analysisType, ex.Message));
    }

    AnalysisOptions? options = null;
    if (analysisType.Equals("tran", StringComparison.OrdinalIgnoreCase))
    {
        options = new AnalysisOptions
        {
            TStop = request.Analysis?.TStop is > 0 ? request.Analysis.TStop.Value : 0.005,
            Dt = request.Analysis?.Dt is > 0 ? request.Analysis.Dt.Value : 5e-5,
            InitFromDc = request.Analysis?.InitFromDc ?? false
        };
    }
    else if (analysisType.Equals("ac", StringComparison.OrdinalIgnoreCase))
    {
        options = new AnalysisOptions
        {
            Freq = request.Analysis?.Freq is > 0 ? request.Analysis.Freq.Value : 1000,
            FStart = request.Analysis?.FStart is > 0 ? request.Analysis.FStart : null,
            FStop = request.Analysis?.FStop is > 0 ? request.Analysis.FStop : null,
            PointsPerDecade = request.Analysis?.PointsPerDecade is > 0
                ? request.Analysis.PointsPerDecade.Value
                : 10
        };
    }

    var result = simulator.Simulate(circuit, analysisType, options);
    var response = SimulateResponse.From(result, request.SchemaVersion <= 0 ? 1 : request.SchemaVersion);
    return result.Ok ? Results.Ok(response) : Results.BadRequest(response);
});

app.Run();

internal static class RequestMapper
{
    public static Circuit ToCircuit(CircuitDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Ground))
            throw new InvalidOperationException("circuit.ground is required.");

        var elements = new List<ElementInstance>();
        foreach (var el in dto.Elements ?? [])
        {
            if (string.IsNullOrWhiteSpace(el.Id) || string.IsNullOrWhiteSpace(el.Model))
                throw new InvalidOperationException("Each element needs id and model.");

            var pars = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
            var bools = new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase);

            if (el.Params is not null)
            {
                foreach (var (key, value) in el.Params)
                {
                    if (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False)
                        bools[key] = value.GetBoolean();
                    else if (value.ValueKind == JsonValueKind.Number)
                        pars[key] = value.GetDouble();
                    else if (value.ValueKind == JsonValueKind.String &&
                             double.TryParse(value.GetString(), out var d))
                        pars[key] = d;
                }
            }

            elements.Add(new ElementInstance
            {
                Id = el.Id,
                Model = el.Model,
                Pins = el.Pins ?? new Dictionary<string, string>(),
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
    public Dictionary<string, string>? Pins { get; set; }
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

    public static SimulateResponse From(ElectroLab.CircuitSim.Results.SimulationResult result, int schemaVersion) => new()
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
                NodeVoltages = result.DcOp.NodeVoltages.ToDictionary(kv => kv.Key, kv => kv.Value),
                BranchCurrents = result.DcOp.BranchCurrents.ToDictionary(kv => kv.Key, kv => kv.Value)
            },
        Tran = result.Tran is null
            ? null
            : new TranDto
            {
                Time = result.Tran.Time.ToList(),
                NodeVoltages = result.Tran.NodeVoltages
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
                    NodeVoltages = p.NodeVoltages.ToDictionary(
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
