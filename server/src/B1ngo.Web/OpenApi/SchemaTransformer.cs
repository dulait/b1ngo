using System.Text.Json.Nodes;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace B1ngo.Web.OpenApi;

internal sealed class SchemaTransformer : IOpenApiSchemaTransformer
{
    private static readonly Dictionary<
        string,
        Dictionary<string, (string Description, JsonNode? Example)>
    > SchemaDescriptions = new()
    {
        ["CreateRoomCommand"] = new()
        {
            ["hostDisplayName"] = (
                "Display name of the player creating the room. Must be unique within the room.",
                JsonValue.Create("Max")
            ),
            ["season"] = ("F1 season year.", JsonValue.Create(2026)),
            ["grandPrixName"] = ("Name of the Grand Prix event.", JsonValue.Create("Bahrain Grand Prix")),
            ["sessionType"] = ("F1 session type.", JsonValue.Create("Race")),
            ["matrixSize"] = (
                "Bingo card grid size. Defaults to 5 if omitted. Must be odd, between 3 and 9.",
                JsonValue.Create(5)
            ),
            ["winningPatterns"] = (
                "Active win patterns. Defaults to [\"Row\", \"Column\", \"Diagonal\"] if omitted.",
                null
            ),
        },
        ["CreateRoomResponse"] = new()
        {
            ["roomId"] = (
                "Unique identifier for the created room.",
                JsonValue.Create("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            ),
            ["joinCode"] = (
                "6-character alphanumeric code for other players to join (no ambiguous characters: 0, O, I, 1 excluded).",
                JsonValue.Create("BHR26R")
            ),
            ["playerId"] = (
                "Unique identifier for the host player.",
                JsonValue.Create("f47ac10b-58cc-4372-a567-0e02b2c3d479")
            ),
            ["playerToken"] = (
                "Opaque token for authenticating subsequent requests.",
                JsonValue.Create("550e8400-e29b-41d4-a716-446655440000")
            ),
        },
        ["JoinRoomCommand"] = new()
        {
            ["joinCode"] = ("The 6-character code shared by the room host.", JsonValue.Create("BHR26R")),
            ["displayName"] = (
                "Display name for the joining player. Must be unique within the room (case-insensitive).",
                JsonValue.Create("Lewis")
            ),
        },
        ["JoinRoomResponse"] = new()
        {
            ["roomId"] = (
                "Unique identifier for the joined room.",
                JsonValue.Create("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            ),
            ["playerId"] = (
                "Unique identifier for the new player.",
                JsonValue.Create("c9d0e1f2-a3b4-5678-cdef-901234567890")
            ),
            ["playerToken"] = (
                "Opaque token for authenticating subsequent requests.",
                JsonValue.Create("661f9511-f3ac-52e5-b827-557766551111")
            ),
            ["displayName"] = ("The player's confirmed display name.", JsonValue.Create("Lewis")),
        },
        ["ReconnectResponse"] = new()
        {
            ["roomId"] = (
                "Unique identifier for the player's room.",
                JsonValue.Create("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            ),
            ["playerId"] = (
                "Unique identifier for the reconnecting player.",
                JsonValue.Create("f47ac10b-58cc-4372-a567-0e02b2c3d479")
            ),
            ["roomStatus"] = ("Current room status: Lobby, Active, or Completed.", JsonValue.Create("Active")),
        },
        ["StartGameResponse"] = new()
        {
            ["roomId"] = (
                "Unique identifier of the started room.",
                JsonValue.Create("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            ),
            ["status"] = ("New room status, always Active.", JsonValue.Create("Active")),
        },
        ["EndGameResponse"] = new()
        {
            ["roomId"] = (
                "Unique identifier of the ended room.",
                JsonValue.Create("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            ),
            ["status"] = ("New room status, always Completed.", JsonValue.Create("Completed")),
        },
        ["EditSquareRequest"] = new()
        {
            ["displayText"] = ("New display text for the square.", JsonValue.Create("Verstappen leads lap 1")),
        },
        ["EditSquareResponse"] = new()
        {
            ["row"] = ("Zero-based row index of the edited square.", JsonValue.Create(1)),
            ["column"] = ("Zero-based column index of the edited square.", JsonValue.Create(3)),
            ["displayText"] = ("Updated display text.", JsonValue.Create("Verstappen leads lap 1")),
            ["eventKey"] = ("Event key for the square. Always null after editing (cleared on edit).", null),
        },
        ["MarkSquareResponse"] = new()
        {
            ["row"] = ("Zero-based row index of the marked square.", JsonValue.Create(0)),
            ["column"] = ("Zero-based column index of the marked square.", JsonValue.Create(4)),
            ["isMarked"] = ("Always true after a successful mark.", JsonValue.Create(true)),
            ["markedBy"] = ("Who marked the square: Player or Host.", JsonValue.Create("Player")),
            ["markedAt"] = (
                "ISO 8601 timestamp of when the square was marked.",
                JsonValue.Create("2026-03-17T14:30:00+00:00")
            ),
            ["bingo"] = ("Non-null if marking completed a winning pattern.", null),
        },
        ["BingoInfo"] = new()
        {
            ["pattern"] = ("The winning pattern: Row, Column, Diagonal, or Blackout.", JsonValue.Create("Row")),
            ["rank"] = ("Player's rank on the leaderboard (1 = first to win).", JsonValue.Create(1)),
        },
        ["UnmarkSquareResponse"] = new()
        {
            ["row"] = ("Zero-based row index of the unmarked square.", JsonValue.Create(0)),
            ["column"] = ("Zero-based column index of the unmarked square.", JsonValue.Create(4)),
            ["isMarked"] = ("Always false after a successful unmark.", JsonValue.Create(false)),
            ["markedBy"] = ("Always null after unmarking.", null),
            ["markedAt"] = ("Always null after unmarking.", null),
            ["winRevoked"] = (
                "True if the player previously had a win and it was revoked by this unmark.",
                JsonValue.Create(false)
            ),
        },
        ["GetRoomStateResponse"] = new()
        {
            ["roomId"] = ("Unique room identifier.", JsonValue.Create("a1b2c3d4-e5f6-7890-abcd-ef1234567890")),
            ["joinCode"] = ("6-character join code.", JsonValue.Create("BHR26R")),
            ["status"] = ("Current room status.", JsonValue.Create("Active")),
            ["session"] = ("F1 session details.", null),
            ["configuration"] = ("Game configuration.", null),
            ["hostPlayerId"] = ("Player ID of the host.", JsonValue.Create("f47ac10b-58cc-4372-a567-0e02b2c3d479")),
            ["players"] = ("All players in the room.", null),
            ["leaderboard"] = ("Ranked list of winners.", null),
        },
        ["SessionDto"] = new()
        {
            ["season"] = ("F1 season year.", JsonValue.Create(2026)),
            ["grandPrixName"] = ("Grand Prix name.", JsonValue.Create("Bahrain Grand Prix")),
            ["sessionType"] = ("Session type.", JsonValue.Create("Race")),
        },
        ["ConfigurationDto"] = new()
        {
            ["matrixSize"] = ("Bingo card grid size.", JsonValue.Create(5)),
            ["winningPatterns"] = ("Active winning pattern types.", null),
        },
        ["PlayerDto"] = new()
        {
            ["playerId"] = ("Unique player identifier.", JsonValue.Create("f47ac10b-58cc-4372-a567-0e02b2c3d479")),
            ["displayName"] = ("Player's display name.", JsonValue.Create("Max")),
            ["hasWon"] = ("Whether the player has achieved bingo.", JsonValue.Create(false)),
            ["card"] = ("Player's bingo card (null if not yet assigned).", null),
        },
        ["CardDto"] = new()
        {
            ["matrixSize"] = ("Grid dimension (e.g., 5 = 5x5).", JsonValue.Create(5)),
            ["squares"] = ("All squares on the card (matrixSize\u00b2 items).", null),
        },
        ["SquareDto"] = new()
        {
            ["row"] = ("Zero-based row index.", JsonValue.Create(0)),
            ["column"] = ("Zero-based column index.", JsonValue.Create(0)),
            ["displayText"] = ("Text displayed on the square.", JsonValue.Create("Safety Car deployed")),
            ["eventKey"] = (
                "Predefined event identifier. Null for free spaces and custom (player-edited) squares.",
                JsonValue.Create("SAFETY_CAR")
            ),
            ["isFreeSpace"] = ("Whether this is the center free space.", JsonValue.Create(false)),
            ["isMarked"] = ("Whether the square is currently marked.", JsonValue.Create(true)),
            ["markedBy"] = ("Who marked the square. Null if unmarked.", JsonValue.Create("Player")),
            ["markedAt"] = (
                "When the square was marked. Null if unmarked.",
                JsonValue.Create("2026-03-17T14:30:00+00:00")
            ),
        },
        ["LeaderboardEntryDto"] = new()
        {
            ["playerId"] = ("Unique player identifier.", JsonValue.Create("c9d0e1f2-a3b4-5678-cdef-901234567890")),
            ["rank"] = ("Sequential rank (1 = first to win).", JsonValue.Create(1)),
            ["winningPattern"] = ("Pattern that completed the win.", JsonValue.Create("Row")),
            ["completedAt"] = ("ISO 8601 UTC timestamp of win.", JsonValue.Create("2026-03-17T14:35:00+00:00")),
        },
        ["GetReferenceDataResponse"] = new()
        {
            ["seasons"] = ("Available F1 seasons, sorted descending. Only seasons with data are included.", null),
            ["grandPrix"] = ("Grand Prix entries across all seasons with per-GP session types.", null),
        },
        ["GrandPrixDto"] = new()
        {
            ["name"] = ("Grand Prix name.", JsonValue.Create("Bahrain Grand Prix")),
            ["season"] = ("F1 season year.", JsonValue.Create(2024)),
            ["round"] = ("Calendar round number within the season.", JsonValue.Create(1)),
            ["isSprint"] = ("Whether this is a sprint weekend.", JsonValue.Create(false)),
            ["sessionTypes"] = ("Valid session types for this GP.", null),
        },
        ["ErrorResponse"] = new()
        {
            ["code"] = ("Machine-readable snake_case error code.", JsonValue.Create("validation_error")),
            ["message"] = (
                "Human-readable error message.",
                JsonValue.Create("One or more validation errors occurred.")
            ),
            ["details"] = ("Validation error details. Only present for validation_error responses.", null),
        },
    };

    public Task TransformAsync(
        OpenApiSchema schema,
        OpenApiSchemaTransformerContext context,
        CancellationToken cancellationToken
    )
    {
        var typeName = context.JsonTypeInfo.Type.Name;

        if (SchemaDescriptions.TryGetValue(typeName, out var propertyDescriptions))
        {
            foreach (var (propName, (description, example)) in propertyDescriptions)
            {
                if (
                    schema.Properties?.TryGetValue(propName, out var propSchema) == true
                    && propSchema is OpenApiSchema concreteProp
                )
                {
                    concreteProp.Description = description;
                    if (example is not null)
                    {
                        concreteProp.Example = example;
                    }
                }
            }
        }

        // Handle enums: render as string with enum values
        if (context.JsonTypeInfo.Type.IsEnum)
        {
            schema.Type = JsonSchemaType.String;
            schema.Enum = Enum.GetNames(context.JsonTypeInfo.Type).Select(n => (JsonNode)JsonValue.Create(n)!).ToList();

            schema.Description = context.JsonTypeInfo.Type.Name switch
            {
                "SessionType" => "F1 session type. Values: FP1 (Free Practice 1), FP2 (Free Practice 2), "
                    + "FP3 (Free Practice 3), Qualifying (Qualifying session), "
                    + "SprintQualifying (Sprint qualifying session), Sprint (Sprint race), "
                    + "Race (Main race).",
                "WinPatternType" => "Winning pattern type. Values: Row (all squares in any single row are marked), "
                    + "Column (all squares in any single column are marked), "
                    + "Diagonal (all squares on either diagonal are marked), "
                    + "Blackout (all squares on the entire card are marked).",
                "RoomStatus" => "Room lifecycle state. Values: Lobby (accepting players, cards can be edited), "
                    + "Active (game in progress, squares can be marked/unmarked), "
                    + "Completed (game over, read-only).",
                "SquareMarkedBy" => "Who marked a square. Values: Api (auto-marked by event feed), "
                    + "Player (marked by the card owner), "
                    + "Host (marked by the room host on another player's card).",
                _ => schema.Description,
            };
        }

        return Task.CompletedTask;
    }
}
