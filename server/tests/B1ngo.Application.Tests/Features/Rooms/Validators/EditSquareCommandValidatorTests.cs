using B1ngo.Application.Features.Rooms.EditSquare;

namespace B1ngo.Application.Tests.Features.Rooms.Validators;

public class EditSquareCommandValidatorTests
{
    private readonly EditSquareCommandValidator _sut = new();

    private static EditSquareCommand ValidCommand => new(Guid.NewGuid(), Guid.NewGuid(), 0, 0, "Some event text");

    [Fact]
    public void Validate_WithValidCommand_IsValid()
    {
        var result = _sut.Validate(ValidCommand);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_DisplayTextExceeds200Chars_IsInvalid()
    {
        var command = ValidCommand with { DisplayText = new string('A', 201) };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "DisplayText");
    }

    [Theory]
    [InlineData("<script>alert('xss')</script>")]
    [InlineData("text>stuff")]
    public void Validate_DisplayTextWithHtmlChars_IsInvalid(string text)
    {
        var command = ValidCommand with { DisplayText = text };

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "DisplayText");
    }
}
