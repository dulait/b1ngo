using B1ngo.Domain.Game;

namespace B1ngo.Application.Common.Ports;

public interface IBingoCardGenerator
{
    Task<BingoCard> GenerateAsync(
        SessionType sessionType,
        int matrixSize,
        CancellationToken cancellationToken = default
    );
}
