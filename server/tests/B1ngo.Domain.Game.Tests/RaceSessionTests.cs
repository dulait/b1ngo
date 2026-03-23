namespace B1ngo.Domain.Game.Tests;

public class RaceSessionTests
{
    [Fact]
    public void Constructor_WithValidInputs_SetsProperties()
    {
        var sut = new RaceSession(2026, "Bahrain Grand Prix", SessionType.Race);

        Assert.Equal(2026, sut.Season);
        Assert.Equal("Bahrain Grand Prix", sut.GrandPrixName);
        Assert.Equal(SessionType.Race, sut.SessionType);
    }

    [Fact]
    public void Constructor_WithSeasonBefore1950_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new RaceSession(1949, "Test", SessionType.Race));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_WithInvalidGrandPrixName_ThrowsArgumentException(string? name)
    {
        Assert.ThrowsAny<ArgumentException>(() => new RaceSession(2026, name!, SessionType.Race));
    }

    [Fact]
    public void Equality_WithSameValues_AreEqual()
    {
        var a = new RaceSession(2026, "Monaco Grand Prix", SessionType.Qualifying);
        var b = new RaceSession(2026, "Monaco Grand Prix", SessionType.Qualifying);

        Assert.Equal(a, b);
    }

    [Fact]
    public void Equality_WithDifferentValues_AreNotEqual()
    {
        var a = new RaceSession(2026, "Monaco Grand Prix", SessionType.Qualifying);
        var b = new RaceSession(2026, "Monaco Grand Prix", SessionType.Race);

        Assert.NotEqual(a, b);
    }
}
