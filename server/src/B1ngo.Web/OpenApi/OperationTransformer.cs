using System.Text.Json.Nodes;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace B1ngo.Web.OpenApi;

internal sealed class OperationTransformer : IOpenApiOperationTransformer
{
    public Task TransformAsync(
        OpenApiOperation operation,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken
    )
    {
        var endpointName = operation.OperationId;

        if (endpointName is null)
        {
            return Task.CompletedTask;
        }

        switch (endpointName)
        {
            case "CreateRoom":
                TransformCreateRoom(operation);
                break;
            case "JoinRoom":
                TransformJoinRoom(operation);
                break;
            case "Reconnect":
                TransformReconnect(operation);
                break;
            case "StartGame":
                TransformStartGame(operation);
                break;
            case "EndGame":
                TransformEndGame(operation);
                break;
            case "GetRoomState":
                TransformGetRoomState(operation);
                break;
            case "EditSquare":
                TransformEditSquare(operation);
                break;
            case "MarkSquare":
                TransformMarkSquare(operation);
                break;
            case "UnmarkSquare":
                TransformUnmarkSquare(operation);
                break;
        }

        return Task.CompletedTask;
    }

    private static void TransformCreateRoom(OpenApiOperation op)
    {
        op.Description =
            "Creates a new bingo room with the caller as host. The room is tied to a specific F1 session "
            + "(season, Grand Prix, session type). The host receives a join code to share with other players "
            + "and a player token for session identity. A bingo card is automatically generated and assigned to "
            + "the host from the predefined event pool for the selected session type. The server also sets a "
            + "PlayerToken HttpOnly cookie for SignalR connectivity.";

        op.Security = [];

        AddRequestExample(
            op,
            new JsonObject
            {
                ["hostDisplayName"] = "Max",
                ["season"] = 2026,
                ["grandPrixName"] = "Bahrain Grand Prix",
                ["sessionType"] = "Race",
                ["matrixSize"] = 5,
                ["winningPatterns"] = new JsonArray("Row", "Column", "Diagonal"),
            }
        );

        SetResponse(
            op,
            "200",
            "Room created successfully.",
            new JsonObject
            {
                ["roomId"] = "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                ["joinCode"] = "BHR26R",
                ["playerId"] = "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                ["playerToken"] = "550e8400-e29b-41d4-a716-446655440000",
            }
        );

        SetErrorResponse(
            op,
            "400",
            "Request body validation failed.",
            new JsonObject
            {
                ["code"] = "validation_error",
                ["message"] = "One or more validation errors occurred.",
                ["details"] = new JsonArray(
                    "HostDisplayName: Host display name is required.",
                    "GrandPrixName: Grand Prix name is required."
                ),
            }
        );
    }

    private static void TransformJoinRoom(OpenApiOperation op)
    {
        op.Description =
            "Joins a room using a join code. The room must be in Lobby status. The player's display name "
            + "must be unique within the room. Returns player identity and a player token for session "
            + "authentication. A bingo card is automatically generated and assigned from the predefined event "
            + "pool for the room's session type. The server also sets a PlayerToken HttpOnly cookie for "
            + "SignalR connectivity.";

        op.Security = [];

        AddRequestExample(op, new JsonObject { ["joinCode"] = "BHR26R", ["displayName"] = "Lewis" });

        SetResponse(
            op,
            "200",
            "Joined room successfully.",
            new JsonObject
            {
                ["roomId"] = "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                ["playerId"] = "c9d0e1f2-a3b4-5678-cdef-901234567890",
                ["playerToken"] = "661f9511-f3ac-52e5-b827-557766551111",
                ["displayName"] = "Lewis",
            }
        );

        SetErrorResponse(
            op,
            "400",
            "Request body validation failed.",
            ValidationErrorExample("JoinCode: Join code is required.")
        );

        SetErrorResponse(
            op,
            "404",
            "No room matches the provided join code.",
            new JsonObject { ["code"] = "room_not_found", ["message"] = "room with ID 'BHR26R' was not found." }
        );

        SetErrorResponse(
            op,
            "409",
            "Room is not accepting new players, or display name is already taken.",
            new JsonObject
            {
                ["code"] = "display_name_taken",
                ["message"] = "A player with display name 'Max' already exists in this room.",
            }
        );
    }

    private static void TransformReconnect(OpenApiOperation op)
    {
        op.Description =
            "Re-establishes a player's session with a room using the X-Player-Token header. Use this when a "
            + "player returns to the app after closing it. Returns the room ID, player ID, and current room "
            + "status so the client can fetch full state and re-establish the WebSocket connection.";

        SetResponse(
            op,
            "200",
            "Reconnected successfully.",
            new JsonObject
            {
                ["roomId"] = "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                ["playerId"] = "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                ["roomStatus"] = "Active",
            }
        );

        SetErrorResponse(op, "401", "Missing or invalid player token.", UnauthorizedExample());
        SetErrorResponse(op, "404", "The room associated with the token no longer exists.", RoomNotFoundExample());
    }

    private static void TransformStartGame(OpenApiOperation op)
    {
        op.Description =
            "Transitions the room from Lobby to Active status. Only the host can start the game. All players "
            + "must have bingo cards assigned before starting. Once started, players can mark and unmark "
            + "squares, and win detection becomes active.";

        AddPathParameterDescriptions(op);

        SetResponse(
            op,
            "200",
            "Game started successfully.",
            new JsonObject { ["roomId"] = "a1b2c3d4-e5f6-7890-abcd-ef1234567890", ["status"] = "Active" }
        );

        SetErrorResponse(op, "401", "Missing or invalid player token.", UnauthorizedExample());
        SetErrorResponse(op, "403", "Caller is not the host.", ForbiddenExample());
        SetErrorResponse(op, "404", "Room does not exist.", RoomNotFoundExample());
        SetErrorResponse(
            op,
            "409",
            "Room is not in Lobby status, or players are missing cards.",
            new JsonObject
            {
                ["code"] = "room_not_in_lobby",
                ["message"] = "Cannot start the game \u2014 room is in 'Active' state, expected 'Lobby'.",
            }
        );
    }

    private static void TransformEndGame(OpenApiOperation op)
    {
        op.Description =
            "Transitions the room from Active to Completed status. Only the host can end the game. Once ended, "
            + "the room becomes read-only \u2014 no further square marking or unmarking is allowed. The leaderboard "
            + "is finalized.";

        AddPathParameterDescriptions(op);

        SetResponse(
            op,
            "200",
            "Game ended successfully.",
            new JsonObject { ["roomId"] = "a1b2c3d4-e5f6-7890-abcd-ef1234567890", ["status"] = "Completed" }
        );

        SetErrorResponse(op, "401", "Missing or invalid player token.", UnauthorizedExample());
        SetErrorResponse(op, "403", "Caller is not the host.", ForbiddenExample());
        SetErrorResponse(op, "404", "Room does not exist.", RoomNotFoundExample());
        SetErrorResponse(
            op,
            "409",
            "Room is not in Active status.",
            new JsonObject
            {
                ["code"] = "room_not_active",
                ["message"] = "Cannot end the game \u2014 room is in 'Lobby' state, expected 'Active'.",
            }
        );
    }

    private static void TransformGetRoomState(OpenApiOperation op)
    {
        op.Description =
            "Returns the complete room state including session info, configuration, all players with their "
            + "bingo cards, and the leaderboard. Use this for initial page load after joining or reconnecting. "
            + "The caller must be a member of the room (enforced by token-to-room matching).";

        AddPathParameterDescriptions(op);

        SetResponse(op, "200", "Full room state returned.", GetRoomStateExample());

        SetErrorResponse(op, "401", "Missing or invalid player token.", UnauthorizedExample());
        SetErrorResponse(op, "403", "Token's roomId does not match the path roomId.", ForbiddenExample());
        SetErrorResponse(op, "404", "Room does not exist.", RoomNotFoundExample());
    }

    private static void TransformEditSquare(OpenApiOperation op)
    {
        op.Description =
            "Updates the display text of a square on the caller's bingo card. Only available during the Lobby "
            + "phase. Cannot edit free spaces. Editing a predefined square clears its eventKey, making it a "
            + "custom square that can no longer be auto-marked by the event feed. The player identity is "
            + "resolved from the X-Player-Token header.";

        AddPathParameterDescriptions(op);

        AddRequestExample(op, new JsonObject { ["displayText"] = "Verstappen leads lap 1" });

        SetResponse(
            op,
            "200",
            "Square updated successfully.",
            new JsonObject
            {
                ["row"] = 1,
                ["column"] = 3,
                ["displayText"] = "Verstappen leads lap 1",
                ["eventKey"] = (string?)null,
            }
        );

        SetErrorResponse(
            op,
            "400",
            "Request body validation failed.",
            ValidationErrorExample("DisplayText: Display text is required.")
        );
        SetErrorResponse(op, "401", "Missing or invalid player token.", UnauthorizedExample());
        SetErrorResponse(op, "403", "Token's roomId does not match the path roomId.", ForbiddenExample());
        SetErrorResponse(
            op,
            "404",
            "Room, player, or square not found.",
            new JsonObject
            {
                ["code"] = "room_not_found",
                ["message"] = "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found.",
            }
        );
        SetErrorResponse(
            op,
            "409",
            "Room is not in Lobby status, square is a free space, or card is not assigned.",
            new JsonObject
            {
                ["code"] = "room_not_in_lobby",
                ["message"] = "Cannot edit squares \u2014 room is in 'Active' state, expected 'Lobby'.",
            }
        );
    }

    private static void TransformMarkSquare(OpenApiOperation op)
    {
        op.Description =
            "Marks a square on a player's bingo card and automatically evaluates win conditions. A player can "
            + "mark squares on their own card; the host can mark squares on any player's card. The markedBy "
            + "field in the response indicates who performed the mark (Player or Host). If marking completes a "
            + "winning pattern, the response includes bingo info with the winning pattern and rank on the "
            + "leaderboard.";

        AddPathParameterDescriptions(op);

        SetResponse(
            op,
            "200",
            "Square marked successfully. Includes bingo info if a winning pattern was completed.",
            new JsonObject
            {
                ["row"] = 0,
                ["column"] = 4,
                ["isMarked"] = true,
                ["markedBy"] = "Player",
                ["markedAt"] = "2026-03-17T14:30:00+00:00",
                ["bingo"] = (string?)null,
            }
        );

        SetErrorResponse(op, "401", "Missing or invalid player token.", UnauthorizedExample());
        SetErrorResponse(
            op,
            "403",
            "Caller is neither the target player nor the host, or roomId mismatch.",
            ForbiddenExample()
        );
        SetErrorResponse(
            op,
            "404",
            "Room, player, or square not found.",
            new JsonObject
            {
                ["code"] = "player_not_found",
                ["message"] = "Player with ID 'f47ac10b-58cc-4372-a567-0e02b2c3d479' not found in this room.",
            }
        );
        SetErrorResponse(
            op,
            "409",
            "Room is not Active, square is already marked, square is a free space, player already won, or card is not assigned.",
            new JsonObject
            {
                ["code"] = "room_not_active",
                ["message"] = "Cannot mark squares \u2014 room is in 'Lobby' state, expected 'Active'.",
            }
        );
    }

    private static void TransformUnmarkSquare(OpenApiOperation op)
    {
        op.Description =
            "Unmarks a previously marked square on a player's bingo card and re-evaluates win status. A player "
            + "can unmark squares on their own card; the host can unmark squares on any player's card. If the "
            + "player had previously won and unmarking breaks the winning pattern, the win is revoked, the "
            + "player is removed from the leaderboard, and remaining ranks are recalculated.";

        AddPathParameterDescriptions(op);

        SetResponse(
            op,
            "200",
            "Square unmarked successfully. Indicates whether a previously achieved win was revoked.",
            new JsonObject
            {
                ["row"] = 0,
                ["column"] = 4,
                ["isMarked"] = false,
                ["markedBy"] = (string?)null,
                ["markedAt"] = (string?)null,
                ["winRevoked"] = false,
            }
        );

        SetErrorResponse(op, "401", "Missing or invalid player token.", UnauthorizedExample());
        SetErrorResponse(
            op,
            "403",
            "Caller is neither the target player nor the host, or roomId mismatch.",
            ForbiddenExample()
        );
        SetErrorResponse(
            op,
            "404",
            "Room, player, or square not found.",
            new JsonObject { ["code"] = "square_not_found", ["message"] = "No square at position (0, 4)." }
        );
        SetErrorResponse(
            op,
            "409",
            "Room is not Active, square is not marked, square is a free space, or card is not assigned.",
            new JsonObject { ["code"] = "square_not_marked", ["message"] = "Square is not marked." }
        );
    }

    // --- Helper methods ---

    private static void AddRequestExample(OpenApiOperation op, JsonNode example)
    {
        if (op.RequestBody?.Content?.TryGetValue("application/json", out var mediaType) == true)
        {
            mediaType.Example = example;
        }
    }

    private static void SetResponse(OpenApiOperation op, string statusCode, string description, JsonNode example)
    {
        if (op.Responses?.TryGetValue(statusCode, out var response) == true && response is not null)
        {
            response.Description = description;
            if (response.Content?.TryGetValue("application/json", out var mediaType) == true)
            {
                mediaType.Example = example;
            }
        }
    }

    private static void SetErrorResponse(OpenApiOperation op, string statusCode, string description, JsonNode example)
    {
        var responses = op.Responses;
        if (responses is null)
        {
            return;
        }

        if (responses.TryGetValue(statusCode, out var response) && response is not null)
        {
            response.Description = description;
            if (response.Content?.TryGetValue("application/json", out var mediaType) == true)
            {
                mediaType.Example = example;
            }
        }
        else
        {
            responses[statusCode] = new OpenApiResponse
            {
                Description = description,
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["application/json"] = new() { Example = example },
                },
            };
        }
    }

    private static void AddPathParameterDescriptions(OpenApiOperation op)
    {
        foreach (var param in (op.Parameters ?? []).OfType<OpenApiParameter>())
        {
            switch (param.Name)
            {
                case "roomId":
                    param.Description = "Unique identifier of the room";
                    param.Example = JsonValue.Create("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
                    break;
                case "playerId":
                    param.Description = "Unique identifier of the player";
                    param.Example = JsonValue.Create("f47ac10b-58cc-4372-a567-0e02b2c3d479");
                    break;
                case "row":
                    param.Description = "Zero-based row index of the square";
                    param.Example = JsonValue.Create(0);
                    break;
                case "column":
                    param.Description = "Zero-based column index of the square";
                    param.Example = JsonValue.Create(4);
                    break;
            }
        }
    }

    private static JsonObject UnauthorizedExample() =>
        new() { ["code"] = "unauthorized", ["message"] = "Missing or invalid player token." };

    private static JsonObject ForbiddenExample() =>
        new() { ["code"] = "forbidden", ["message"] = "You do not have permission to perform this action." };

    private static JsonObject RoomNotFoundExample() =>
        new()
        {
            ["code"] = "room_not_found",
            ["message"] = "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found.",
        };

    private static JsonObject ValidationErrorExample(params string[] details)
    {
        var arr = new JsonArray();
        foreach (var d in details)
        {
            arr.Add(d);
        }

        return new JsonObject
        {
            ["code"] = "validation_error",
            ["message"] = "One or more validation errors occurred.",
            ["details"] = arr,
        };
    }

    private static JsonObject GetRoomStateExample() =>
        new()
        {
            ["roomId"] = "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            ["joinCode"] = "BHR26R",
            ["status"] = "Active",
            ["session"] = new JsonObject
            {
                ["season"] = 2026,
                ["grandPrixName"] = "Bahrain Grand Prix",
                ["sessionType"] = "Race",
            },
            ["configuration"] = new JsonObject
            {
                ["matrixSize"] = 5,
                ["winningPatterns"] = new JsonArray("Row", "Column", "Diagonal"),
            },
            ["hostPlayerId"] = "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            ["players"] = new JsonArray(
                new JsonObject
                {
                    ["playerId"] = "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                    ["displayName"] = "Max",
                    ["hasWon"] = false,
                    ["card"] = new JsonObject
                    {
                        ["matrixSize"] = 5,
                        ["squares"] = new JsonArray(
                            new JsonObject
                            {
                                ["row"] = 0,
                                ["column"] = 0,
                                ["displayText"] = "Safety Car deployed",
                                ["eventKey"] = "SAFETY_CAR",
                                ["isFreeSpace"] = false,
                                ["isMarked"] = true,
                                ["markedBy"] = "Player",
                                ["markedAt"] = "2026-03-17T14:30:00+00:00",
                            },
                            new JsonObject
                            {
                                ["row"] = 0,
                                ["column"] = 1,
                                ["displayText"] = "Red flag",
                                ["eventKey"] = "RED_FLAG",
                                ["isFreeSpace"] = false,
                                ["isMarked"] = false,
                                ["markedBy"] = (string?)null,
                                ["markedAt"] = (string?)null,
                            },
                            new JsonObject
                            {
                                ["row"] = 2,
                                ["column"] = 2,
                                ["displayText"] = "FREE",
                                ["eventKey"] = (string?)null,
                                ["isFreeSpace"] = true,
                                ["isMarked"] = true,
                                ["markedBy"] = (string?)null,
                                ["markedAt"] = (string?)null,
                            }
                        ),
                    },
                },
                new JsonObject
                {
                    ["playerId"] = "c9d0e1f2-a3b4-5678-cdef-901234567890",
                    ["displayName"] = "Lewis",
                    ["hasWon"] = true,
                    ["card"] = new JsonObject { ["matrixSize"] = 5, ["squares"] = new JsonArray() },
                }
            ),
            ["leaderboard"] = new JsonArray(
                new JsonObject
                {
                    ["playerId"] = "c9d0e1f2-a3b4-5678-cdef-901234567890",
                    ["rank"] = 1,
                    ["winningPattern"] = "Row",
                    ["completedAt"] = "2026-03-17T14:35:00+00:00",
                }
            ),
        };
}
