using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Fakes;

public sealed class FakeRoomRepository : IRoomRepository
{
    private readonly List<Room> _rooms = [];

    public IReadOnlyList<Room> AddedRooms => _rooms.AsReadOnly();

    public void Seed(Room room) => _rooms.Add(room);

    public Task<Room?> GetByIdAsync(RoomId id, CancellationToken cancellationToken = default)
        => Task.FromResult(_rooms.FirstOrDefault(r => r.Id == id));

    public Task<IReadOnlyList<Room>> GetAllAsync(CancellationToken cancellationToken = default)
        => Task.FromResult<IReadOnlyList<Room>>(_rooms.AsReadOnly());

    public Task<Room?> GetByJoinCodeAsync(string joinCode, CancellationToken cancellationToken = default)
        => Task.FromResult(_rooms.FirstOrDefault(r =>
            string.Equals(r.JoinCode, joinCode, StringComparison.OrdinalIgnoreCase)));

    public Task AddAsync(Room aggregate, CancellationToken cancellationToken = default)
    {
        _rooms.Add(aggregate);
        return Task.CompletedTask;
    }

    public void Update(Room aggregate) { }

    public void Remove(Room aggregate) => _rooms.Remove(aggregate);
}
