using B1ngo.Application.Features.Dashboard;
using FluentValidation.TestHelper;

namespace B1ngo.Application.Tests.Features.Dashboard;

public class GetDashboardQueryValidatorTests
{
    private readonly GetDashboardQueryValidator _sut = new();

    [Fact]
    public async Task Validate_WithValidQuery_HasNoErrors()
    {
        var query = new GetDashboardQuery(Guid.NewGuid());

        var result = await _sut.TestValidateAsync(query);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task Validate_WithEmptyUserId_HasError()
    {
        var query = new GetDashboardQuery(Guid.Empty);

        var result = await _sut.TestValidateAsync(query);

        result.ShouldHaveValidationErrorFor(x => x.UserId);
    }
}
