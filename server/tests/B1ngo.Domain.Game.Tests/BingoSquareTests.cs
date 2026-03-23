using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game.Tests;

public class BingoSquareTests
{
    [Fact]
    public void CreatePredefined_SetsAllProperties()
    {
        var sut = BingoSquare.CreatePredefined(1, 2, "Safety Car", "SAFETY_CAR");

        Assert.Equal(1, sut.Row);
        Assert.Equal(2, sut.Column);
        Assert.Equal("Safety Car", sut.DisplayText);
        Assert.Equal("SAFETY_CAR", sut.EventKey);
        Assert.False(sut.IsFreeSpace);
        Assert.False(sut.IsMarked);
        Assert.Null(sut.MarkedBy);
        Assert.Null(sut.MarkedAt);
    }

    [Fact]
    public void CreateFreeSpace_IsAlwaysMarked()
    {
        var sut = BingoSquare.CreateFreeSpace(2, 2);

        Assert.True(sut.IsFreeSpace);
        Assert.True(sut.IsMarked);
        Assert.Equal("FREE", sut.DisplayText);
        Assert.Null(sut.EventKey);
    }

    [Fact]
    public void Mark_WithValidInput_SetsMarkState()
    {
        var sut = BingoSquare.CreatePredefined(0, 0, "Red Flag", "RED_FLAG");
        var now = DateTimeOffset.UtcNow;

        sut.Mark(SquareMarkedBy.Player, now);

        Assert.True(sut.IsMarked);
        Assert.Equal(SquareMarkedBy.Player, sut.MarkedBy);
        Assert.Equal(now, sut.MarkedAt);
    }

    [Fact]
    public void Mark_OnFreeSpace_ThrowsDomainConflictException()
    {
        var sut = BingoSquare.CreateFreeSpace(2, 2);

        var ex = Assert.Throws<DomainConflictException>(() => sut.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow));
        Assert.Equal("square_is_free_space", ex.Code);
    }

    [Fact]
    public void Mark_WhenAlreadyMarked_ThrowsDomainConflictException()
    {
        var sut = BingoSquare.CreatePredefined(0, 0, "Red Flag", "RED_FLAG");
        sut.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);

        var ex = Assert.Throws<DomainConflictException>(() => sut.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow));
        Assert.Equal("square_already_marked", ex.Code);
    }

    [Fact]
    public void Mark_ByApiOnCustomSquare_ThrowsDomainConflictException()
    {
        var sut = BingoSquare.CreatePredefined(0, 0, "Red Flag", "RED_FLAG");
        sut.Edit("My custom event");

        var ex = Assert.Throws<DomainConflictException>(() => sut.Mark(SquareMarkedBy.Api, DateTimeOffset.UtcNow));
        Assert.Equal("square_is_custom", ex.Code);
    }

    [Fact]
    public void Mark_ByPlayerOnCustomSquare_Succeeds()
    {
        var sut = BingoSquare.CreatePredefined(0, 0, "Red Flag", "RED_FLAG");
        sut.Edit("My custom event");

        sut.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);

        Assert.True(sut.IsMarked);
    }

    [Fact]
    public void Unmark_WhenMarked_ClearsMarkState()
    {
        var sut = BingoSquare.CreatePredefined(0, 0, "Red Flag", "RED_FLAG");
        sut.Mark(SquareMarkedBy.Player, DateTimeOffset.UtcNow);

        sut.Unmark();

        Assert.False(sut.IsMarked);
        Assert.Null(sut.MarkedBy);
        Assert.Null(sut.MarkedAt);
    }

    [Fact]
    public void Unmark_OnFreeSpace_ThrowsDomainConflictException()
    {
        var sut = BingoSquare.CreateFreeSpace(2, 2);

        var ex = Assert.Throws<DomainConflictException>(() => sut.Unmark());
        Assert.Equal("square_is_free_space", ex.Code);
    }

    [Fact]
    public void Unmark_WhenNotMarked_ThrowsDomainConflictException()
    {
        var sut = BingoSquare.CreatePredefined(0, 0, "Red Flag", "RED_FLAG");

        var ex = Assert.Throws<DomainConflictException>(() => sut.Unmark());
        Assert.Equal("square_not_marked", ex.Code);
    }

    [Fact]
    public void Edit_UpdatesDisplayTextAndClearsEventKey()
    {
        var sut = BingoSquare.CreatePredefined(0, 0, "Red Flag", "RED_FLAG");

        sut.Edit("Custom text");

        Assert.Equal("Custom text", sut.DisplayText);
        Assert.Null(sut.EventKey);
    }

    [Fact]
    public void Edit_OnFreeSpace_ThrowsDomainConflictException()
    {
        var sut = BingoSquare.CreateFreeSpace(2, 2);

        var ex = Assert.Throws<DomainConflictException>(() => sut.Edit("Something"));
        Assert.Equal("square_is_free_space", ex.Code);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Edit_WithInvalidText_ThrowsArgumentException(string? text)
    {
        var sut = BingoSquare.CreatePredefined(0, 0, "Red Flag", "RED_FLAG");

        Assert.ThrowsAny<ArgumentException>(() => sut.Edit(text!));
    }
}
