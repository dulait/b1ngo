namespace B1ngo.Domain.Game;

public static class SessionTypeExtensions
{
    public static SessionType EventPoolType(this SessionType sessionType) =>
        sessionType switch
        {
            SessionType.FP2 or SessionType.FP3 => SessionType.FP1,
            _ => sessionType,
        };
}
