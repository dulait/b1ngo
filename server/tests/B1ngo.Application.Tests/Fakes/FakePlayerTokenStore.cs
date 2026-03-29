using B1ngo.Application.Common.Ports;

namespace B1ngo.Application.Tests.Fakes;

public sealed class FakePlayerTokenStore : IPlayerTokenStore
{
    private readonly Dictionary<Guid, (PlayerIdentity Identity, Guid? UserId)> _tokens = new();

    public Guid LastCreatedToken { get; private set; }
    public Guid? LastCreatedUserId { get; private set; }
    public int CreateCallCount { get; private set; }

    public Guid Create(Guid playerId, Guid roomId, bool isHost, Guid? userId = null)
    {
        var token = Guid.NewGuid();
        _tokens[token] = (new PlayerIdentity(roomId, playerId, isHost), userId);
        LastCreatedToken = token;
        LastCreatedUserId = userId;
        CreateCallCount++;
        return token;
    }

    public Task<PlayerIdentity?> ResolveAsync(Guid token, CancellationToken cancellationToken = default)
    {
        if (_tokens.TryGetValue(token, out var entry))
        {
            return Task.FromResult<PlayerIdentity?>(entry.Identity);
        }

        return Task.FromResult<PlayerIdentity?>(null);
    }

    public Task LinkTokenToUserAsync(Guid token, Guid userId, CancellationToken cancellationToken = default)
    {
        if (_tokens.TryGetValue(token, out var entry) && entry.UserId is null)
        {
            _tokens[token] = (entry.Identity, userId);
        }

        return Task.CompletedTask;
    }

    public Task<List<PlayerTokenSummary>> GetActiveTokensForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    )
    {
        var rooms = _tokens
            .Values.Where(t => t.UserId == userId)
            .Select(t => new PlayerTokenSummary(t.Identity.RoomId, "Lobby"))
            .ToList();
        return Task.FromResult(rooms);
    }

    public Task<PlayerIdentity?> ResolveByUserAndRoomAsync(
        Guid userId,
        Guid roomId,
        CancellationToken cancellationToken = default
    )
    {
        var match = _tokens
            .Values.Where(t => t.UserId == userId && t.Identity.RoomId == roomId)
            .Select(t => (PlayerIdentity?)t.Identity)
            .FirstOrDefault();
        return Task.FromResult(match);
    }
}
