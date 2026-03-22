using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game.Events;

public sealed record BingoAchievedDomainEvent(
    RoomId RoomId,
    PlayerId PlayerId,
    WinPatternType Pattern,
    List<SquarePosition> WinningSquares,
    int Rank,
    DateTimeOffset CompletedAt
) : DomainEvent;
