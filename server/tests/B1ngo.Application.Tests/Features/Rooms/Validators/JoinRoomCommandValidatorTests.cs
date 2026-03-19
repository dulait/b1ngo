using B1ngo.Application.Features.Rooms.JoinRoom;

namespace B1ngo.Application.Tests.Features.Rooms.Validators;

public class JoinRoomCommandValidatorTests
{
    private readonly JoinRoomCommandValidator _sut = new();

    private static JoinRoomCommand ValidCommand => new("ABC123", "Alice");

    [Fact]
    public void Validate_WithValidCommand_IsValid()
    {
        var result = _sut.Validate(ValidCommand);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("ABC12")]
    [InlineData("ABC1234")]
    public void Validate_JoinCodeNotExactly6Chars_IsInvalid(string joinCode)
    {
        var command = ValidCommand with { JoinCode = joinCode };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "JoinCode");
    }

    [Fact]
    public void Validate_DisplayNameExceeds50Chars_IsInvalid()
    {
        var command = ValidCommand with { DisplayName = new string('A', 51) };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "DisplayName");
    }

    [Theory]
    [InlineData("<script>")]
    [InlineData("name>test")]
    public void Validate_DisplayNameWithHtmlChars_IsInvalid(string name)
    {
        var command = ValidCommand with { DisplayName = name };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "DisplayName");
    }
}
