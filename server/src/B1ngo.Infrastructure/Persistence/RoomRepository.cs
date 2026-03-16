using B1ngo.Domain.Game;
using B1ngo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.Persistence;

internal sealed class RoomRepository(B1ngoDbContext dbContext)
    : Repository<B1ngoDbContext, Room, RoomId>(dbContext), IRoomRepository
{
    public override async Task<Room?> GetByIdAsync(RoomId id, CancellationToken cancellationToken = default)
        => await DbContext.Rooms
            .Include(r => r.Players)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public async Task<Room?> GetByJoinCodeAsync(string joinCode, CancellationToken cancellationToken = default)
        => await DbContext.Rooms
            .Include(r => r.Players)
            .FirstOrDefaultAsync(r => r.JoinCode == joinCode, cancellationToken);
}
