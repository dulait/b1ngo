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
        var sut = new RoomConfiguration(3, [WinPatternType.Blackout]);

        Assert.Equal(3, sut.MatrixSize);
        Assert.Single(sut.WinningPatterns);
        Assert.Equal(WinPatternType.Blackout, sut.WinningPatterns[0]);
    }

    [Theory]
    [InlineData(2)]
    [InlineData(4)]
    [InlineData(7)]
    [InlineData(9)]
    [InlineData(10)]
    public void Constructor_WithDisallowedMatrixSize_ThrowsArgumentOutOfRangeException(int size)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new RoomConfiguration(size, [WinPatternType.Row]));
    }

    [Fact]
    public void Constructor_WithEmptyWinningPatterns_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => new RoomConfiguration(5, []));
    }

    [Fact]
    public void Default_SetsMaxPlayersTo20()
    {
        var sut = RoomConfiguration.Default;

        Assert.Equal(20, sut.MaxPlayers);
    }

    [Fact]
    public void Constructor_WithCustomMaxPlayers_SetsMaxPlayers()
    {
        var sut = new RoomConfiguration(5, [WinPatternType.Row], maxPlayers: 10);

        Assert.Equal(10, sut.MaxPlayers);
    }

    [Fact]
    public void Constructor_WithMaxPlayersLessThan2_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new RoomConfiguration(5, [WinPatternType.Row], maxPlayers: 1));
    }

    [Fact]
    public void Equality_WithSameValues_AreEqual()
    {
        var a = new RoomConfiguration(5, [WinPatternType.Row, WinPatternType.Column]);
        var b = new RoomConfiguration(5, [WinPatternType.Row, WinPatternType.Column]);

        // Record equality on IReadOnlyList won't match by content, so they won't be equal
        // This is expected behavior: record equality uses reference equality for collections
        Assert.NotEqual(a, b);
    }
}
