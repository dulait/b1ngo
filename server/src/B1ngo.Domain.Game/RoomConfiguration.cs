namespace B1ngo.Domain.Game;

public sealed record RoomConfiguration
{
    public const int DefaultMatrixSize = 5;

    public static readonly IReadOnlyList<WinPatternType> DefaultWinningPatterns =
    [
        WinPatternType.Row,
        WinPatternType.Column,
        WinPatternType.Diagonal,
    ];

    public int MatrixSize { get; init; }
    public IReadOnlyList<WinPatternType> WinningPatterns { get; init; } = [];

    private RoomConfiguration() { }

    public RoomConfiguration(int matrixSize, IReadOnlyList<WinPatternType> winningPatterns)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(matrixSize, 3);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(matrixSize, 9);

        if (matrixSize % 2 == 0)
        {
            throw new ArgumentException("Matrix size must be odd to have a center free space.", nameof(matrixSize));
        }

        if (winningPatterns.Count == 0)
        {
            throw new ArgumentException("At least one winning pattern is required.", nameof(winningPatterns));
        }

        MatrixSize = matrixSize;
        WinningPatterns = winningPatterns;
    }

    public static RoomConfiguration Default => new(DefaultMatrixSize, DefaultWinningPatterns);
}
