namespace B1ngo.Application.Features.Rooms.MarkSquare;

public sealed record MarkSquareResponse(
    int Row,
    int Column,
    bool IsMarked,
    string MarkedBy,
    DateTimeOffset MarkedAt,
    BingoInfo? Bingo
);

public sealed record BingoInfo(string Pattern, int Rank);
