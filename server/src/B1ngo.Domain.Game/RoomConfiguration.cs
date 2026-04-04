namespace B1ngo.Domain.Game;

public sealed record RoomConfiguration
{
    public const int DefaultMatrixSize = 5;
    public const int DefaultMaxPlayers = 20;

    public static readonly IReadOnlyList<WinPatternType> DefaultWinningPatterns =
    [
        WinPatternType.Row,
        WinPatternType.Column,
        WinPatternType.Diagonal,
    ];

    public int MatrixSize { get; init; }
    public int MaxPlayers { get; init; }
    public IReadOnlyList<WinPatternType> WinningPatterns { get; init; } = [];

    private RoomConfiguration() { }

    public RoomConfiguration(
        int matrixSize,
        IReadOnlyList<WinPatternType> winningPatterns,
        int maxPlayers = DefaultMaxPlayers
    )
    {
        if (matrixSize is not (3 or 5))
        {
            throw new ArgumentOutOfRangeException(nameof(matrixSize), matrixSize, "Matrix size must be 3 or 5.");
        }

        ArgumentOutOfRangeException.ThrowIfLessThan(maxPlayers, 2);

        if (winningPatterns.Count == 0)
        {
            throw new ArgumentException("At least one winning pattern is required.", nameof(winningPatterns));
        }

        MatrixSize = matrixSize;
        MaxPlayers = maxPlayers;
        WinningPatterns = winningPatterns;
    }

    public static RoomConfiguration Default => new(DefaultMatrixSize, DefaultWinningPatterns);
}
