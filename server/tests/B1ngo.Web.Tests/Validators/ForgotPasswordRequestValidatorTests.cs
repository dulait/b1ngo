using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Validators;
using FluentValidation.TestHelper;

namespace B1ngo.Web.Tests.Validators;

public class ForgotPasswordRequestValidatorTests
{
    private readonly ForgotPasswordRequestValidator _sut = new();

    [Fact]
    public async Task Validate_WithValidEmail_HasNoErrors()
    {
        var request = new ForgotPasswordRequest("test@example.com");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Validate_WithEmptyEmail_HasError(string? email)
    {
        var request = new ForgotPasswordRequest(email!);

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public async Task Validate_WithInvalidEmail_HasError()
    {
        var request = new ForgotPasswordRequest("notanemail");

        var result = await _sut.TestValidateAsync(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }
}
