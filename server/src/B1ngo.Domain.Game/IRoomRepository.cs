using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game;

public interface IRoomRepository : IRepository<Room, RoomId>
{
    Task<Room?> GetByJoinCodeAsync(string joinCode, CancellationToken cancellationToken = default);
}
