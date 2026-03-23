namespace B1ngo.Application.Common.Ports;

public interface IReferenceDataRepository
{
    Task<IReadOnlyList<GrandPrixDto>> GetGrandPrixAsync(CancellationToken cancellationToken = default);

    Task<GrandPrixDto?> GetGrandPrixAsync(string name, int season, CancellationToken cancellationToken = default);
}

public sealed record GrandPrixDto(
    string Name,
    int Season,
    int Round,
    bool IsSprint,
    IReadOnlyList<string> SessionTypes
);
