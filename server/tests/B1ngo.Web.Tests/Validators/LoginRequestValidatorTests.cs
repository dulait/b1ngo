using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Validators;
using FluentValidation.TestHelper;

namespace B1ngo.Web.Tests.Validators;

public class LoginRequestValidatorTests
{
    private readonly LoginRequestValidator _sut = new();

    [Fact]
    public async Task Validate_WithValidRequest_HasNoErrors()
    {
        var request = new LoginRequest("test@example.com", "Password1");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithEmptyEmail_HasError(string? email)
    {
        var request = new LoginRequest(email!, "Password1");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public async Task Validate_WithEmptyPassword_HasError(string? password)
    {
        var request = new LoginRequest("test@example.com", password!);

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}
