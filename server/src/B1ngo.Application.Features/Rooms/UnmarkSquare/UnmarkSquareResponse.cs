namespace B1ngo.Application.Features.Rooms.UnmarkSquare;

public sealed record UnmarkSquareResponse(
    int Row,
    int Column,
    bool IsMarked,
    string? MarkedBy,
    DateTimeOffset? MarkedAt,
    bool WinRevoked);
