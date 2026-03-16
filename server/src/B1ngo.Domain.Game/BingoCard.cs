using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game;

public sealed class BingoCard
{
    private readonly List<BingoSquare> _squares;

    public IReadOnlyList<BingoSquare> Squares => _squares.AsReadOnly();
    public int MatrixSize { get; }

    private BingoCard()
    {
        _squares = [];
    }

    public BingoCard(int matrixSize, List<BingoSquare> squares)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(matrixSize, 3);

        var expectedCount = matrixSize * matrixSize;
        if (squares.Count != expectedCount)
        {
            throw new ArgumentException(
                $"Expected {expectedCount} squares for a {matrixSize}x{matrixSize} card, but got {squares.Count}.",
                nameof(squares)
            );
        }

        MatrixSize = matrixSize;
        _squares = squares;
    }

    public BingoSquare GetSquare(int row, int column) =>
        _squares.Find(s => s.Row == row && s.Column == column)
        ?? throw new DomainNotFoundException("square_not_found", $"No square at position ({row}, {column}).");

    internal void MarkSquare(int row, int column, SquareMarkedBy markedBy, DateTimeOffset markedAt)
    {
        var square = GetSquare(row, column);
        square.Mark(markedBy, markedAt);
    }

    internal void UnmarkSquare(int row, int column)
    {
        var square = GetSquare(row, column);
        square.Unmark();
    }

    internal void EditSquare(int row, int column, string newDisplayText)
    {
        var square = GetSquare(row, column);
        square.Edit(newDisplayText);
    }

    public WinPatternType? CheckForWin(IReadOnlyList<WinPatternType> patterns)
    {
        foreach (var pattern in patterns)
        {
            if (HasWinningPattern(pattern))
            {
                return pattern;
            }
        }

        return null;
    }

    public bool HasWinningPattern(WinPatternType pattern) =>
        pattern switch
        {
            WinPatternType.Row => HasCompletedRow(),
            WinPatternType.Column => HasCompletedColumn(),
            WinPatternType.Diagonal => HasCompletedDiagonal(),
            WinPatternType.Blackout => HasBlackout(),
            _ => false,
        };

    private bool HasCompletedRow()
    {
        for (var row = 0; row < MatrixSize; row++)
        {
            if (IsRowComplete(row))
            {
                return true;
            }
        }

        return false;
    }

    private bool IsRowComplete(int row) => _squares.Where(s => s.Row == row).All(s => s.IsMarked);

    private bool HasCompletedColumn()
    {
        for (var col = 0; col < MatrixSize; col++)
        {
            if (IsColumnComplete(col))
            {
                return true;
            }
        }

        return false;
    }

    private bool IsColumnComplete(int col) => _squares.Where(s => s.Column == col).All(s => s.IsMarked);

    private bool HasCompletedDiagonal() => IsMainDiagonalComplete() || IsAntiDiagonalComplete();

    private bool IsMainDiagonalComplete() => _squares.Where(s => s.Row == s.Column).All(s => s.IsMarked);

    private bool IsAntiDiagonalComplete() =>
        _squares.Where(s => s.Row + s.Column == MatrixSize - 1).All(s => s.IsMarked);

    private bool HasBlackout() => _squares.All(s => s.IsMarked);
}
