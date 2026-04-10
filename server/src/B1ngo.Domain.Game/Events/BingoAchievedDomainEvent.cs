using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game.Events;

public sealed record BingoAchievedDomainEvent(
    RoomId RoomId,
    PlayerId PlayerId,
    WinPatternType Pattern,
    IReadOnlyList<SquarePosition> WinningSquares,
    int Rank,
    DateTimeOffset CompletedAt,
    TimeSpan ElapsedTime,
    TimeSpan? IntervalToPrevious
) : DomainEvent;
