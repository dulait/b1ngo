using B1ngo.Application.Features.Rooms.CreateRoom;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.Validators;

public class CreateRoomCommandValidatorTests
{
    private readonly CreateRoomCommandValidator _sut = new();

    private static CreateRoomCommand ValidCommand => new("Host", 2026, "Bahrain Grand Prix", SessionType.Race);

    [Fact]
    public void Validate_WithValidCommand_IsValid()
    {
        var result = _sut.Validate(ValidCommand);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_HostDisplayNameExceeds50Chars_IsInvalid()
    {
        var command = ValidCommand with { HostDisplayName = new string('A', 51) };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "HostDisplayName");
    }

    [Fact]
    public void Validate_HostDisplayNameAt50Chars_IsValid()
    {
        var command = ValidCommand with { HostDisplayName = new string('A', 50) };

        var result = _sut.Validate(command);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("<script>")]
    [InlineData("name>test")]
    [InlineData("<b>bold</b>")]
    public void Validate_HostDisplayNameWithHtmlChars_IsInvalid(string name)
    {
        var command = ValidCommand with { HostDisplayName = name };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "HostDisplayName");
    }

    [Fact]
    public void Validate_GrandPrixNameExceeds100Chars_IsInvalid()
    {
        var command = ValidCommand with { GrandPrixName = new string('A', 101) };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "GrandPrixName");
    }

    [Theory]
    [InlineData("<script>")]
    [InlineData("GP>Name")]
    public void Validate_GrandPrixNameWithHtmlChars_IsInvalid(string name)
    {
        var command = ValidCommand with { GrandPrixName = name };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "GrandPrixName");
    }
}
