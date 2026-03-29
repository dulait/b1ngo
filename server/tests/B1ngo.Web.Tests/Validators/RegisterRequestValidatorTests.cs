using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Validators;
using FluentValidation.TestHelper;

namespace B1ngo.Web.Tests.Validators;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _sut = new();

    [Fact]
    public async Task Validate_WithValidRequest_HasNoErrors()
    {
        var request = new RegisterRequest("test@example.com", "Password1", "TestUser");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithEmptyEmail_HasError(string? email)
    {
        var request = new RegisterRequest(email!, "Password1", "TestUser");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public async Task Validate_WithInvalidEmail_HasError()
    {
        var request = new RegisterRequest("notanemail", "Password1", "TestUser");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public async Task Validate_WithEmptyPassword_HasError(string? password)
    {
        var request = new RegisterRequest("test@example.com", password!, "TestUser");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public async Task Validate_WithShortPassword_HasError()
    {
        var request = new RegisterRequest("test@example.com", "Short1", "TestUser");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithEmptyDisplayName_HasError(string? displayName)
    {
        var request = new RegisterRequest("test@example.com", "Password1", displayName!);

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.DisplayName);
    }

    [Fact]
    public async Task Validate_WithTooLongDisplayName_HasError()
    {
        var request = new RegisterRequest("test@example.com", "Password1", new string('A', 51));

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.DisplayName);
    }
}
