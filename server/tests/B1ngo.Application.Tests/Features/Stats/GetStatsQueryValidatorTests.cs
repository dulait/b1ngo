using B1ngo.Application.Features.Stats;
using FluentValidation.TestHelper;

namespace B1ngo.Application.Tests.Features.Stats;

public class GetStatsQueryValidatorTests
{
    private readonly GetStatsQueryValidator _sut = new();

    [Fact]
    public async Task Validate_WithValidQuery_HasNoErrors()
    {
        var query = new GetStatsQuery(Guid.NewGuid());

        var result = await _sut.TestValidateAsync(query);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task Validate_WithEmptyUserId_HasError()
    {
        var query = new GetStatsQuery(Guid.Empty);

        var result = await _sut.TestValidateAsync(query);

        result.ShouldHaveValidationErrorFor(x => x.UserId);
    }
}
