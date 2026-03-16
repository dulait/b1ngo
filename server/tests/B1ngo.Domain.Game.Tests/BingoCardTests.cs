using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using B1ngo.Domain.Game.Tests.Helpers;

namespace B1ngo.Domain.Game.Tests;

public class BingoCardTests
{
    private readonly BingoCardBuilder _builder = new();

    [Fact]
    public void Constructor_WithCorrectSquareCount_Succeeds()
    {
        var sut = _builder.Build();

        Assert.Equal(25, sut.Squares.Count);
        Assert.Equal(5, sut.MatrixSize);
    }

    [Fact]
    public void Constructor_WithIncorrectSquareCount_ThrowsArgumentException()
    {
        var squares = Enumerable
            .Range(0, 10)
            .Select(i => BingoSquare.CreatePredefined(i / 5, i % 5, $"E{i}", $"E{i}"))
            .ToList();

        Assert.Throws<ArgumentException>(() => new BingoCard(5, squares));
    }

    [Fact]
    public void GetSquare_ReturnsCorrectSquare()
    {
        var sut = _builder.Build();

        var square = sut.GetSquare(0, 1);

        Assert.Equal(0, square.Row);
        Assert.Equal(1, square.Column);
    }

    [Fact]
    public void GetSquare_WithInvalidPosition_ThrowsDomainNotFoundException()
    {
        var sut = _builder.Build();

        var ex = Assert.Throws<DomainNotFoundException>(() => sut.GetSquare(99, 99));
        Assert.Equal("square_not_found", ex.Code);
    }

    [Fact]
    public void HasWinningPattern_Row_WhenFirstRowComplete_ReturnsTrue()
    {
        var sut = _builder.Build();

        // Mark entire first row (row 0, columns 0-4)
        for (var col = 0; col < 5; col++)
        {
            var square = sut.GetSquare(0, col);
            if (!square.IsFreeSpace)
            {
                square.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);
            }
        }

        Assert.True(sut.HasWinningPattern(WinPatternType.Row));
    }

    [Fact]
    public void HasWinningPattern_Row_WhenIncomplete_ReturnsFalse()
    {
        var sut = _builder.Build();

        // Mark only 4 of 5 in row 0
        for (var col = 0; col < 4; col++)
        {
            var square = sut.GetSquare(0, col);
            if (!square.IsFreeSpace)
            {
                square.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);
            }
        }

        Assert.False(sut.HasWinningPattern(WinPatternType.Row));
    }

    [Fact]
    public void HasWinningPattern_Column_WhenFirstColumnComplete_ReturnsTrue()
    {
        var sut = _builder.Build();

        for (var row = 0; row < 5; row++)
        {
            var square = sut.GetSquare(row, 0);
            if (!square.IsFreeSpace)
            {
                square.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);
            }
        }

        Assert.True(sut.HasWinningPattern(WinPatternType.Column));
    }

    [Fact]
    public void HasWinningPattern_Diagonal_WhenMainDiagonalComplete_ReturnsTrue()
    {
        var sut = _builder.Build();

        // Main diagonal: (0,0), (1,1), (2,2) [free], (3,3), (4,4)
        for (var i = 0; i < 5; i++)
        {
            var square = sut.GetSquare(i, i);
            if (!square.IsFreeSpace)
            {
                square.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);
            }
        }

        Assert.True(sut.HasWinningPattern(WinPatternType.Diagonal));
    }

    [Fact]
    public void HasWinningPattern_Diagonal_WhenAntiDiagonalComplete_ReturnsTrue()
    {
        var sut = _builder.Build();

        // Anti-diagonal: (0,4), (1,3), (2,2) [free], (3,1), (4,0)
        for (var i = 0; i < 5; i++)
        {
            var square = sut.GetSquare(i, 4 - i);
            if (!square.IsFreeSpace)
            {
                square.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);
            }
        }

        Assert.True(sut.HasWinningPattern(WinPatternType.Diagonal));
    }

    [Fact]
    public void HasWinningPattern_Blackout_WhenAllMarked_ReturnsTrue()
    {
        var sut = _builder.Build();

        foreach (var square in sut.Squares)
        {
            if (!square.IsFreeSpace)
            {
                square.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);
            }
        }

        Assert.True(sut.HasWinningPattern(WinPatternType.Blackout));
    }

    [Fact]
    public void HasWinningPattern_Blackout_WhenOneUnmarked_ReturnsFalse()
    {
        var sut = _builder.Build();

        // Mark all except (0,0)
        foreach (var square in sut.Squares)
        {
            if (!square.IsFreeSpace && !(square.Row == 0 && square.Column == 0))
            {
                square.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);
            }
        }

        Assert.False(sut.HasWinningPattern(WinPatternType.Blackout));
    }

    [Fact]
    public void CheckForWin_ReturnsFirstMatchingPattern()
    {
        var sut = _builder.Build();

        // Complete row 0
        for (var col = 0; col < 5; col++)
        {
            var square = sut.GetSquare(0, col);
            if (!square.IsFreeSpace)
            {
                square.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);
            }
        }

        var result = sut.CheckForWin([WinPatternType.Row, WinPatternType.Column, WinPatternType.Diagonal]);

        Assert.Equal(WinPatternType.Row, result);
    }

    [Fact]
    public void CheckForWin_WhenNoPattern_ReturnsNull()
    {
        var sut = _builder.Build();

        var result = sut.CheckForWin([WinPatternType.Row, WinPatternType.Column]);

        Assert.Null(result);
    }

    [Fact]
    public void CenterSquare_IsFreeSpace()
    {
        var sut = _builder.Build();

        var center = sut.GetSquare(2, 2);

        Assert.True(center.IsFreeSpace);
        Assert.True(center.IsMarked);
    }
}
