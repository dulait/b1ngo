using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Validators;
using FluentValidation.TestHelper;

namespace B1ngo.Web.Tests.Validators;

public class ResetPasswordRequestValidatorTests
{
    private readonly ResetPasswordRequestValidator _sut = new();

    [Fact]
    public async Task Validate_WithValidRequest_HasNoErrors()
    {
        var request = new ResetPasswordRequest("test@example.com", "valid-token", "Password1");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithEmptyEmail_HasError(string? email)
    {
        var request = new ResetPasswordRequest(email!, "valid-token", "Password1");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public async Task Validate_WithInvalidEmail_HasError()
    {
        var request = new ResetPasswordRequest("notanemail", "valid-token", "Password1");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithEmptyToken_HasError(string? token)
    {
        var request = new ResetPasswordRequest("test@example.com", token!, "Password1");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Token);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public async Task Validate_WithEmptyPassword_HasError(string? password)
    {
        var request = new ResetPasswordRequest("test@example.com", "valid-token", password!);

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public async Task Validate_WithShortPassword_HasError()
    {
        var request = new ResetPasswordRequest("test@example.com", "valid-token", "Short1");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public async Task Validate_WithPasswordMissingDigit_HasError()
    {
        var request = new ResetPasswordRequest("test@example.com", "valid-token", "nodigitshere");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }
}
