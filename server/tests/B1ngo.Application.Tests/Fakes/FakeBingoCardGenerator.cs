using B1ngo.Application.Common;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Fakes;

public sealed class FakeBingoCardGenerator : IBingoCardGenerator
{
    public BingoCard Generate(SessionType sessionType, int matrixSize)
    {
        var squares = new List<BingoSquare>();
        var centerRow = matrixSize / 2;
        var centerCol = matrixSize / 2;
        var hasFreeSpace = matrixSize % 2 == 1;

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
                    squares.Add(BingoSquare.CreatePredefined(row, col, $"Event_{row}_{col}", $"EVENT_{row}_{col}"));
                }
            }
        }

        return new BingoCard(matrixSize, squares);
    }

    public Task<BingoCard> GenerateAsync(
        SessionType sessionType,
        int matrixSize,
        CancellationToken cancellationToken = default
    )
    {
        return Task.FromResult(Generate(sessionType, matrixSize));
    }
}
