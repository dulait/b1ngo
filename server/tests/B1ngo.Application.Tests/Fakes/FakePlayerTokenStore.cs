using B1ngo.Application.Common;

namespace B1ngo.Application.Tests.Fakes;

public sealed class FakePlayerTokenStore : IPlayerTokenStore
{
    private readonly Dictionary<Guid, PlayerIdentity> _tokens = new();

    public Guid LastCreatedToken { get; private set; }
    public int CreateCallCount { get; private set; }

    public Guid Create(Guid playerId, Guid roomId, bool isHost)
    {
        var token = Guid.NewGuid();
        _tokens[token] = new PlayerIdentity(roomId, playerId, isHost);
        LastCreatedToken = token;
        CreateCallCount++;
        return token;
    }

    public Task<PlayerIdentity?> ResolveAsync(Guid token, CancellationToken cancellationToken = default)
    {
        _tokens.TryGetValue(token, out var identity);
        return Task.FromResult(identity);
    }
}
