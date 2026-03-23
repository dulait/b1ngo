using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Tests.Helpers;

namespace B1ngo.Domain.Game.Tests;

public class PlayerTests
{
    [Fact]
    public void Create_WithValidDisplayName_SetsProperties()
    {
        var sut = Player.Create("Alice");

        Assert.Equal("Alice", sut.DisplayName);
        Assert.NotEqual(Guid.Empty, sut.Id.Value);
        Assert.Null(sut.Card);
        Assert.False(sut.HasWon);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidDisplayName_ThrowsArgumentException(string? displayName)
    {
        Assert.ThrowsAny<ArgumentException>(() => Player.Create(displayName!));
    }

    [Fact]
    public void AssignCard_SetsCard()
    {
        var sut = Player.Create("Alice");
        var card = new BingoCardBuilder().Build();

        sut.AssignCard(card);

        Assert.NotNull(sut.Card);
        Assert.Same(card, sut.Card);
    }

    [Fact]
    public void AssignCard_WhenAlreadyAssigned_ThrowsDomainConflictException()
    {
        var sut = Player.Create("Alice");
        sut.AssignCard(new BingoCardBuilder().Build());

        var ex = Assert.Throws<DomainConflictException>(() => sut.AssignCard(new BingoCardBuilder().Build()));
        Assert.Equal("card_already_assigned", ex.Code);
    }

    [Fact]
    public void AssignCard_WithNull_ThrowsArgumentNullException()
    {
        var sut = Player.Create("Alice");

        Assert.Throws<ArgumentNullException>(() => sut.AssignCard(null!));
    }
}
