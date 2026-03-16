using B1ngo.Application.Features.Rooms.JoinRoom;
using FluentValidation.TestHelper;

namespace B1ngo.Application.Tests.Features.Rooms.JoinRoom;

public class JoinRoomCommandValidatorTests
{
    private readonly JoinRoomCommandValidator _sut = new();

    [Fact]
    public async Task Validate_WithValidCommand_HasNoErrors()
    {
        var command = new JoinRoomCommand("ABC123", "Alice");

        var result = await _sut.TestValidateAsync(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithInvalidJoinCode_HasError(string? joinCode)
    {
        var command = new JoinRoomCommand(joinCode!, "Alice");

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.JoinCode);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithInvalidDisplayName_HasError(string? displayName)
    {
        var command = new JoinRoomCommand("ABC123", displayName!);

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.DisplayName);
    }
}
