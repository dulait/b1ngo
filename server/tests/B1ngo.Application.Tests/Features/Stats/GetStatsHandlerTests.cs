using B1ngo.Application.Common.Ports;
using B1ngo.Application.Features.Stats;
using B1ngo.Application.Tests.Fakes;

namespace B1ngo.Application.Tests.Features.Stats;

public class GetStatsHandlerTests
{
    private readonly FakeUserActivityRepository _repository = new();
    private readonly GetStatsHandler _sut;

    public GetStatsHandlerTests()
    {
        _sut = new GetStatsHandler(_repository);
    }

    private static GetStatsQuery ValidQuery => new(Guid.NewGuid());

    [Fact]
    public async Task HandleAsync_WithStats_ReturnsOverviewWithCorrectWinRate()
    {
        _repository.SeedStats(
            new UserStatsRecord(
                GamesPlayed: 10,
                Wins: 3,
                RowWins: 1,
                ColumnWins: 1,
                DiagonalWins: 1,
                BlackoutWins: 0,
                RankCounts: new Dictionary<int, int> { { 1, 3 }, { 2, 2 } }
            )
        );

        var result = await _sut.HandleAsync(ValidQuery);

        Assert.True(result.IsSuccess);
        Assert.Equal(10, result.Value.Overview.GamesPlayed);
        Assert.Equal(3, result.Value.Overview.Wins);
        Assert.Equal(0.3m, result.Value.Overview.WinRate);
    }

    [Fact]
    public async Task HandleAsync_WithStats_ReturnsWinsGroupedByPattern()
    {
        _repository.SeedStats(
            new UserStatsRecord(
                GamesPlayed: 20,
                Wins: 8,
                RowWins: 3,
                ColumnWins: 2,
                DiagonalWins: 2,
                BlackoutWins: 1,
                RankCounts: new Dictionary<int, int>()
            )
        );

        var result = await _sut.HandleAsync(ValidQuery);

        Assert.True(result.IsSuccess);
        Assert.Equal(3, result.Value.WinsByPattern.Row);
        Assert.Equal(2, result.Value.WinsByPattern.Column);
        Assert.Equal(2, result.Value.WinsByPattern.Diagonal);
        Assert.Equal(1, result.Value.WinsByPattern.Blackout);
    }

    [Fact]
    public async Task HandleAsync_WithRankCounts_ReturnsBestFinishesOrderedAscendingExcludingZeros()
    {
        _repository.SeedStats(
            new UserStatsRecord(
                GamesPlayed: 15,
                Wins: 5,
                RowWins: 5,
                ColumnWins: 0,
                DiagonalWins: 0,
                BlackoutWins: 0,
                RankCounts: new Dictionary<int, int>
                {
                    { 1, 5 },
                    { 2, 0 },
                    { 3, 3 },
                    { 5, 2 },
                    { 4, 0 },
                }
            )
        );

        var result = await _sut.HandleAsync(ValidQuery);

        Assert.True(result.IsSuccess);
        Assert.Equal(3, result.Value.BestFinishes.Count);
        Assert.Equal(1, result.Value.BestFinishes[0].Rank);
        Assert.Equal(5, result.Value.BestFinishes[0].Count);
        Assert.Equal(3, result.Value.BestFinishes[1].Rank);
        Assert.Equal(3, result.Value.BestFinishes[1].Count);
        Assert.Equal(5, result.Value.BestFinishes[2].Rank);
        Assert.Equal(2, result.Value.BestFinishes[2].Count);
    }

    [Fact]
    public async Task HandleAsync_WithNoCompletedGames_ReturnsZerosAcrossTheBoard()
    {
        _repository.SeedStats(
            new UserStatsRecord(
                GamesPlayed: 0,
                Wins: 0,
                RowWins: 0,
                ColumnWins: 0,
                DiagonalWins: 0,
                BlackoutWins: 0,
                RankCounts: new Dictionary<int, int>()
            )
        );

        var result = await _sut.HandleAsync(ValidQuery);

        Assert.True(result.IsSuccess);
        Assert.Equal(0, result.Value.Overview.GamesPlayed);
        Assert.Equal(0, result.Value.Overview.Wins);
        Assert.Equal(0m, result.Value.Overview.WinRate);
        Assert.Equal(0, result.Value.WinsByPattern.Row);
        Assert.Equal(0, result.Value.WinsByPattern.Column);
        Assert.Equal(0, result.Value.WinsByPattern.Diagonal);
        Assert.Equal(0, result.Value.WinsByPattern.Blackout);
        Assert.Empty(result.Value.BestFinishes);
    }
}
