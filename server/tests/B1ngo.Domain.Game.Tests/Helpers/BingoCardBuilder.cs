using B1ngo.Domain.Game;

namespace B1ngo.Domain.Game.Tests.Helpers;

/// <summary>
/// Builds BingoCard instances for tests. Defaults to a 5x5 card with predefined events and a center free space.
/// </summary>
internal sealed class BingoCardBuilder
{
    private int _matrixSize = 5;
    private readonly Dictionary<(int Row, int Col), BingoSquare> _overrides = [];

    public BingoCardBuilder WithMatrixSize(int size)
    {
        _matrixSize = size;
        return this;
    }

    public BingoCardBuilder WithSquare(int row, int col, BingoSquare square)
    {
        _overrides[(row, col)] = square;
        return this;
    }

    public BingoCard Build()
    {
        var center = _matrixSize / 2;
        var squares = new List<BingoSquare>();

        for (var row = 0; row < _matrixSize; row++)
        {
            for (var col = 0; col < _matrixSize; col++)
            {
                if (_overrides.TryGetValue((row, col), out var overrideSquare))
                {
                    squares.Add(overrideSquare);
                }
                else if (row == center && col == center)
                {
                    squares.Add(BingoSquare.CreateFreeSpace(row, col));
                }
                else
                {
                    squares.Add(BingoSquare.CreatePredefined(row, col, $"Event R{row}C{col}", $"EVENT_{row}_{col}"));
                }
            }
        }

        return new BingoCard(_matrixSize, squares);
    }
}
