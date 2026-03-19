namespace B1ngo.Domain.Game;

public sealed record WinDetection(WinPatternType Pattern, List<SquarePosition> Squares);
