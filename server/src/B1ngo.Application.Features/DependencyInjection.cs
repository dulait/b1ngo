using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Features.ReferenceData;
using B1ngo.Application.Features.Rooms.CreateRoom;
using B1ngo.Application.Features.Rooms.EditSquare;
using B1ngo.Application.Features.Rooms.EndGame;
using B1ngo.Application.Features.Rooms.GetRoomState;
using B1ngo.Application.Features.Rooms.JoinRoom;
using B1ngo.Application.Features.Rooms.MarkSquare;
using B1ngo.Application.Features.Rooms.Reconnect;
using B1ngo.Application.Features.Rooms.StartGame;
using B1ngo.Application.Features.Rooms.UnmarkSquare;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace B1ngo.Application.Features;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            services.AddValidatorsFromAssemblyContaining<CreateRoomCommandValidator>();

            services.AddScoped<ICommandHandler<CreateRoomCommand, CreateRoomResponse>, CreateRoomHandler>();
            services.AddScoped<ICommandHandler<JoinRoomCommand, JoinRoomResponse>, JoinRoomHandler>();
            services.AddScoped<ICommandHandler<StartGameCommand, StartGameResponse>, StartGameHandler>();
            services.AddScoped<ICommandHandler<EditSquareCommand, EditSquareResponse>, EditSquareHandler>();
            services.AddScoped<ICommandHandler<MarkSquareCommand, MarkSquareResponse>, MarkSquareHandler>();
            services.AddScoped<ICommandHandler<UnmarkSquareCommand, UnmarkSquareResponse>, UnmarkSquareHandler>();
            services.AddScoped<ICommandHandler<EndGameCommand, EndGameResponse>, EndGameHandler>();

            services.AddScoped<IQueryHandler<ReconnectQuery, ReconnectResponse>, ReconnectHandler>();
            services.AddScoped<IQueryHandler<GetRoomStateQuery, GetRoomStateResponse>, GetRoomStateHandler>();
            services.AddScoped<
                IQueryHandler<GetReferenceDataQuery, GetReferenceDataResponse>,
                GetReferenceDataHandler
            >();

            return services;
        }
    }
}
