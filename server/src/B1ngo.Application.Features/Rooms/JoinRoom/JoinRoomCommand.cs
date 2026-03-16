using B1ngo.Application.Common;

namespace B1ngo.Application.Features.Rooms.JoinRoom;

public sealed record JoinRoomCommand(string JoinCode, string DisplayName) : ICommand<JoinRoomResponse>;
