using B1ngo.Domain.Game;

namespace B1ngo.Domain.Game.Tests;

public class SessionTypeExtensionsTests
{
    [Fact]
    public void EventPoolType_FP2_ReturnsFP1()
    {
        Assert.Equal(SessionType.FP1, SessionType.FP2.EventPoolType());
    }

    [Fact]
    public void EventPoolType_FP3_ReturnsFP1()
    {
        Assert.Equal(SessionType.FP1, SessionType.FP3.EventPoolType());
    }

    [Theory]
    [InlineData(SessionType.FP1)]
    [InlineData(SessionType.Qualifying)]
    [InlineData(SessionType.SprintQualifying)]
    [InlineData(SessionType.Sprint)]
    [InlineData(SessionType.Race)]
    public void EventPoolType_NonPractice_ReturnsSelf(SessionType sessionType)
    {
        Assert.Equal(sessionType, sessionType.EventPoolType());
    }
}
