using B1ngo.Application.Features.History;
using FluentValidation.TestHelper;

namespace B1ngo.Application.Tests.Features.History;

public class GetHistoryQueryValidatorTests
{
    private readonly GetHistoryQueryValidator _sut = new();

    private static GetHistoryQuery ValidQuery => new(Guid.NewGuid(), Page: 1, PageSize: 10);

    [Fact]
    public async Task Validate_WithValidQuery_HasNoErrors()
    {
        var result = await _sut.TestValidateAsync(ValidQuery);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task Validate_WithEmptyUserId_HasError()
    {
        var query = ValidQuery with { UserId = Guid.Empty };

        var result = await _sut.TestValidateAsync(query);

        result.ShouldHaveValidationErrorFor(x => x.UserId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task Validate_WithPageLessThan1_HasError(int page)
    {
        var query = ValidQuery with { Page = page };

        var result = await _sut.TestValidateAsync(query);

        result.ShouldHaveValidationErrorFor(x => x.Page);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(51)]
    [InlineData(100)]
    public async Task Validate_WithPageSizeOutOfRange_HasError(int pageSize)
    {
        var query = ValidQuery with { PageSize = pageSize };

        var result = await _sut.TestValidateAsync(query);

        result.ShouldHaveValidationErrorFor(x => x.PageSize);
    }
}
