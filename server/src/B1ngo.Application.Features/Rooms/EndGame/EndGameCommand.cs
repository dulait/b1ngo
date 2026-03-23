using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.Rooms.EndGame;

public sealed record EndGameCommand(Guid RoomId) : ICommand<EndGameResponse>;
