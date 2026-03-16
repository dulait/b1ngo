using B1ngo.Application.Common;

namespace B1ngo.Application.Features.Rooms.EndGame;

public sealed record EndGameCommand(Guid RoomId) : ICommand<EndGameResponse>;
