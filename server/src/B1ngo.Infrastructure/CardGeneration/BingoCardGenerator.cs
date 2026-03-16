using B1ngo.Application.Common;
using B1ngo.Domain.Game;

namespace B1ngo.Infrastructure.CardGeneration;

internal sealed class BingoCardGenerator : IBingoCardGenerator
{
    public BingoCard Generate(SessionType sessionType, int matrixSize)
    {
        var pool = EventPool.GetEvents(sessionType);
        var totalSquares = matrixSize * matrixSize;
        var hasFreeSpace = matrixSize % 2 == 1;
        var eventSlotsNeeded = hasFreeSpace ? totalSquares - 1 : totalSquares;

        if (pool.Count < eventSlotsNeeded)
        {
            throw new InvalidOperationException(
                $"Event pool for {sessionType} has {pool.Count} events, " +
                $"but {eventSlotsNeeded} are needed for a {matrixSize}x{matrixSize} card.");
        }

        var shuffled = pool
            .OrderBy(_ => Random.Shared.Next())
            .Take(eventSlotsNeeded)
            .ToList();

        var centerRow = matrixSize / 2;
        var centerCol = matrixSize / 2;

        var squares = new List<BingoSquare>(totalSquares);
        var eventIndex = 0;

        for (var row = 0; row < matrixSize; row++)
        {
            for (var col = 0; col < matrixSize; col++)
            {
                if (hasFreeSpace && row == centerRow && col == centerCol)
                {
                    squares.Add(BingoSquare.CreateFreeSpace(row, col));
                }
                else
                {
                    var entry = shuffled[eventIndex++];
                    squares.Add(BingoSquare.CreatePredefined(row, col, entry.DisplayText, entry.EventKey));
                }
            }
        }

        return new BingoCard(matrixSize, squares);
    }
}
