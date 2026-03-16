namespace B1ngo.Infrastructure.Auth;

public sealed class PlayerToken
{
    public Guid Token { get; private set; }
    public Guid PlayerId { get; private set; }
    public Guid RoomId { get; private set; }
    public bool IsHost { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private PlayerToken() { }

    public static PlayerToken Create(Guid playerId, Guid roomId, bool isHost)
    {
        return new PlayerToken
        {
            Token = Guid.NewGuid(),
            PlayerId = playerId,
            RoomId = roomId,
            IsHost = isHost,
            CreatedAt = DateTimeOffset.UtcNow,
        };
    }
}
