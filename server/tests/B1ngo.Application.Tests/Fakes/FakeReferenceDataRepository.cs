using B1ngo.Application.Common.Ports;

namespace B1ngo.Application.Tests.Fakes;

public sealed class FakeReferenceDataRepository : IReferenceDataRepository
{
    private readonly List<GrandPrixDto> _grandPrix =
    [
        new GrandPrixDto("Bahrain Grand Prix", 2026, 1, false, ["FP1", "FP2", "FP3", "Qualifying", "Race"]),
        new GrandPrixDto(
            "Sprint Grand Prix",
            2026,
            2,
            true,
            ["FP1", "SprintQualifying", "Sprint", "Qualifying", "Race"]
        ),
    ];

    public Task<IReadOnlyList<GrandPrixDto>> GetGrandPrixAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<GrandPrixDto>>(_grandPrix);
    }

    public Task<GrandPrixDto?> GetGrandPrixAsync(string name, int season, CancellationToken cancellationToken = default)
    {
        var match = _grandPrix.FirstOrDefault(g => g.Name == name && g.Season == season);
        return Task.FromResult(match);
    }
}
