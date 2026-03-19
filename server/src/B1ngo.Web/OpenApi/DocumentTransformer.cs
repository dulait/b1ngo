using System.Text.Json.Nodes;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace B1ngo.Web.OpenApi;

internal sealed class DocumentTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken
    )
    {
        document.Info = new OpenApiInfo
        {
            Title = "B1ngo API",
            Version = "1.0.0",
            Description =
                "B1ngo is a multiplayer F1 bingo game API. Players create or join rooms tied to specific "
                + "Formula 1 sessions, receive randomized bingo cards populated with real F1 events, and mark "
                + "squares as events occur during the session. The API manages room lifecycle, card generation, "
                + "square marking with automatic win detection, and a ranked leaderboard.",
            Contact = new OpenApiContact { Name = "B1ngo Team", Email = "support@b1ngo.dev" },
            License = new OpenApiLicense { Name = "MIT", Identifier = "MIT" },
        };

        document.Servers =
        [
            new OpenApiServer { Url = "http://localhost:5000", Description = "Local development server" },
            new OpenApiServer { Url = "https://api.b1ngo.dev", Description = "Production server" },
        ];

        document.AddComponent(
            "playerToken",
            new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.ApiKey,
                In = ParameterLocation.Header,
                Name = "X-Player-Token",
                Description =
                    "Opaque GUID token returned by the Create Room and Join Room endpoints. "
                    + "The client stores this token and sends it as the X-Player-Token header "
                    + "on all subsequent requests. The server resolves the token to a player "
                    + "identity (player ID, room ID, host flag). Tokens live as long as the "
                    + "room exists. If the token is lost, the player must re-join as a new player.",
            }
        );

        // Add enum schemas that are not auto-generated because the DTOs use string types.
        AddEnumSchemas(document);

        // Fix security requirements — the operation transformer sets them but can't pass the
        // host document to OpenApiSecuritySchemeReference, so we rewrite them here with the
        // document reference so they serialize correctly as { "playerToken": [] }.
        HashSet<string> unauthenticatedOps = ["CreateRoom", "JoinRoom"];

        if (document.Paths is not null)
        {
            foreach (var pathItem in document.Paths.Values)
            {
                if (pathItem.Operations is null)
                {
                    continue;
                }

                foreach (var op in pathItem.Operations.Values)
                {
                    if (op.OperationId is null || unauthenticatedOps.Contains(op.OperationId))
                    {
                        continue;
                    }

                    op.Security =
                    [
                        new OpenApiSecurityRequirement
                        {
                            { new OpenApiSecuritySchemeReference("playerToken", document), [] },
                        },
                    ];
                }
            }
        }

        return Task.CompletedTask;
    }

    private static void AddEnumSchemas(OpenApiDocument document)
    {
        document.AddComponent(
            "RoomStatus",
            new OpenApiSchema
            {
                Type = JsonSchemaType.String,
                Enum =
                [
                    (JsonNode)JsonValue.Create("Lobby")!,
                    (JsonNode)JsonValue.Create("Active")!,
                    (JsonNode)JsonValue.Create("Completed")!,
                ],
                Description =
                    "Room lifecycle state. Values: Lobby (accepting players, cards can be edited), "
                    + "Active (game in progress, squares can be marked/unmarked), "
                    + "Completed (game over, read-only).",
            }
        );

        document.AddComponent(
            "SquareMarkedBy",
            new OpenApiSchema
            {
                Type = JsonSchemaType.String,
                Enum =
                [
                    (JsonNode)JsonValue.Create("Api")!,
                    (JsonNode)JsonValue.Create("Player")!,
                    (JsonNode)JsonValue.Create("Host")!,
                ],
                Description =
                    "Who marked a square. Values: Api (auto-marked by event feed), "
                    + "Player (marked by the card owner), "
                    + "Host (marked by the room host on another player's card).",
            }
        );
    }
}
