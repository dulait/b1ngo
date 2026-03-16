using B1ngo.Application.Features.Rooms.CreateRoom;
using B1ngo.Domain.Game;
using FluentValidation.TestHelper;

namespace B1ngo.Application.Tests.Features.Rooms.CreateRoom;

public class CreateRoomCommandValidatorTests
{
    private readonly CreateRoomCommandValidator _sut = new();

    private static CreateRoomCommand ValidCommand =>
        new(HostDisplayName: "Host", Season: 2026, GrandPrixName: "Bahrain Grand Prix", SessionType: SessionType.Race);

    [Fact]
    public async Task Validate_WithValidCommand_HasNoErrors()
    {
        var result = await _sut.TestValidateAsync(ValidCommand);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithInvalidHostDisplayName_HasError(string? name)
    {
        var command = ValidCommand with { HostDisplayName = name! };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.HostDisplayName);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithInvalidGrandPrixName_HasError(string? name)
    {
        var command = ValidCommand with { GrandPrixName = name! };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.GrandPrixName);
    }

    [Theory]
    [InlineData(2)]
    [InlineData(10)]
    public async Task Validate_WithMatrixSizeOutOfRange_HasError(int size)
    {
        var command = ValidCommand with { MatrixSize = size };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.MatrixSize!.Value);
    }

    [Theory]
    [InlineData(4)]
    [InlineData(6)]
    public async Task Validate_WithEvenMatrixSize_HasError(int size)
    {
        var command = ValidCommand with { MatrixSize = size };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.MatrixSize!.Value);
    }

    [Theory]
    [InlineData(3)]
    [InlineData(5)]
    [InlineData(7)]
    [InlineData(9)]
    public async Task Validate_WithValidMatrixSize_HasNoError(int size)
    {
        var command = ValidCommand with { MatrixSize = size };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldNotHaveValidationErrorFor(x => x.MatrixSize!.Value);
    }

    [Fact]
    public async Task Validate_WithNullMatrixSize_HasNoError()
    {
        var command = ValidCommand with { MatrixSize = null };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task Validate_WithEmptyWinningPatterns_HasError()
    {
        var command = ValidCommand with { WinningPatterns = [] };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldHaveValidationErrorFor(x => x.WinningPatterns);
    }

    [Fact]
    public async Task Validate_WithValidWinningPatterns_HasNoError()
    {
        var command = ValidCommand with
        {
            WinningPatterns =
            [
                WinPatternType.Row,
                WinPatternType.Column,
                WinPatternType.Diagonal,
                WinPatternType.Blackout,
            ],
        };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task Validate_WithNullWinningPatterns_HasNoError()
    {
        var command = ValidCommand with { WinningPatterns = null };

        var result = await _sut.TestValidateAsync(command);

        result.ShouldNotHaveAnyValidationErrors();
    }
}
