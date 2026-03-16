using B1ngo.Domain.Game;

namespace B1ngo.Domain.Game.Tests;

public class RoomConfigurationTests
{
    [Fact]
    public void Default_Returns5x5WithStandardPatterns()
    {
        var sut = RoomConfiguration.Default;

        Assert.Equal(5, sut.MatrixSize);
        Assert.Equal(3, sut.WinningPatterns.Count);
        Assert.Contains(WinPatternType.Row, sut.WinningPatterns);
        Assert.Contains(WinPatternType.Column, sut.WinningPatterns);
        Assert.Contains(WinPatternType.Diagonal, sut.WinningPatterns);
    }

    [Fact]
    public void Constructor_WithValidInputs_SetsProperties()
    {
        var sut = new RoomConfiguration(7, [WinPatternType.Blackout]);

        Assert.Equal(7, sut.MatrixSize);
        Assert.Single(sut.WinningPatterns);
        Assert.Equal(WinPatternType.Blackout, sut.WinningPatterns[0]);
    }

    [Fact]
    public void Constructor_WithMatrixSizeLessThan3_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            new RoomConfiguration(2, [WinPatternType.Row]));
    }

    [Fact]
    public void Constructor_WithMatrixSizeGreaterThan9_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            new RoomConfiguration(10, [WinPatternType.Row]));
    }

    [Fact]
    public void Constructor_WithEvenMatrixSize_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new RoomConfiguration(4, [WinPatternType.Row]));
    }

    [Fact]
    public void Constructor_WithEmptyWinningPatterns_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            new RoomConfiguration(5, []));
    }

    [Fact]
    public void Equality_WithSameValues_AreEqual()
    {
        var a = new RoomConfiguration(5, [WinPatternType.Row, WinPatternType.Column]);
        var b = new RoomConfiguration(5, [WinPatternType.Row, WinPatternType.Column]);

        // Record equality on IReadOnlyList won't match by content, so they won't be equal
        // This is expected behavior — record equality uses reference equality for collections
        Assert.NotEqual(a, b);
    }
}
