using B1ngo.Application.Features.Rooms.EditSquare;
using FluentValidation.TestHelper;

namespace B1ngo.Application.Tests.Features.Rooms.EditSquare;

public class EditSquareCommandValidatorTests
{
    private readonly EditSquareCommandValidator _sut = new();

    private static EditSquareCommand ValidCommand() => new(Guid.NewGuid(), Guid.NewGuid(), 0, 0, "Some text");

    [Fact]
    public async Task Validate_WithValidCommand_HasNoErrors()
    {
        var command = ValidCommand();

        var result = await _sut.TestValidateAsync(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithInvalidDisplayText_HasError(string? displayText)
    {
        var command = ValidCommand() with { DisplayText = displayText! };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.DisplayText);
    }

    [Fact]
    public async Task Validate_WithNegativeRow_HasError()
    {
        var command = ValidCommand() with { Row = -1 };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.Row);
    }

    [Fact]
    public async Task Validate_WithNegativeColumn_HasError()
    {
        var command = ValidCommand() with { Column = -1 };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.Column);
    }
}
