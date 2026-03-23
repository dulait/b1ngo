using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.Rooms.StartGame;

public sealed record StartGameCommand(Guid RoomId) : ICommand<StartGameResponse>;
