using B1ngo.Application.Common.Ports;

namespace B1ngo.Application.Tests.Fakes;

internal sealed class FakeUserActivityRepository : IUserActivityRepository
{
    private string _displayName = "Player";
    private readonly List<UserActiveRoomRecord> _activeRooms = [];
    private readonly List<UserCompletedRoomRecord> _completedRooms = [];
    private QuickStatsRecord _quickStats = new(0, 0);
    private UserStatsRecord _stats = new(0, 0, 0, 0, 0, 0, new Dictionary<int, int>());

    public void SeedDisplayName(string displayName) => _displayName = displayName;

    public void SeedActiveRooms(params UserActiveRoomRecord[] rooms) => _activeRooms.AddRange(rooms);

    public void SeedCompletedRooms(params UserCompletedRoomRecord[] rooms) => _completedRooms.AddRange(rooms);

    public void SeedQuickStats(QuickStatsRecord quickStats) => _quickStats = quickStats;

    public void SeedStats(UserStatsRecord stats) => _stats = stats;

    public Task<string> GetDisplayNameAsync(Guid userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(_displayName);

    public Task<List<UserActiveRoomRecord>> GetActiveRoomsAsync(
        Guid userId,
        int? limit = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = limit.HasValue ? _activeRooms.Take(limit.Value).ToList() : _activeRooms.ToList();
        return Task.FromResult(result);
    }

    public Task<int> GetActiveRoomCountAsync(Guid userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(_activeRooms.Count);

    public Task<QuickStatsRecord> GetQuickStatsAsync(Guid userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(_quickStats);

    public Task<UserStatsRecord> GetStatsAsync(Guid userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(_stats);

    public Task<List<UserCompletedRoomRecord>> GetCompletedRoomsPageAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        var result = _completedRooms.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Task.FromResult(result);
    }

    public Task<int> GetCompletedRoomCountAsync(Guid userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(_completedRooms.Count);
}
