using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.Rooms.JoinRoom;

public sealed record JoinRoomCommand(string JoinCode, string DisplayName) : ICommand<JoinRoomResponse>;
