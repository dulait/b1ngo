namespace B1ngo.Domain.Game;

public sealed record SquarePosition(int Row, int Column)
{
    private SquarePosition()
        : this(0, 0) { }
}
