using B1ngo.Domain.Game;

namespace B1ngo.Application.Common;

public interface IBingoCardGenerator
{
    Task<BingoCard> GenerateAsync(
        SessionType sessionType,
        int matrixSize,
        CancellationToken cancellationToken = default
    );
}
