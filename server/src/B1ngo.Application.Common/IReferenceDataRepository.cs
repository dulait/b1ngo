namespace B1ngo.Application.Common;

public interface IReferenceDataRepository
{
    Task<IReadOnlyList<SessionTypeDto>> GetSessionTypesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<GrandPrixDto>> GetGrandPrixAsync(CancellationToken cancellationToken = default);
}

public sealed record SessionTypeDto(string Name, string DisplayName, int SortOrder);

public sealed record GrandPrixDto(string Name, int Season, int SortOrder);
