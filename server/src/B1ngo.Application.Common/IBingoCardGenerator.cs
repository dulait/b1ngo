using B1ngo.Domain.Game;

namespace B1ngo.Application.Common;

public interface IBingoCardGenerator
{
    BingoCard Generate(SessionType sessionType, int matrixSize);
}
