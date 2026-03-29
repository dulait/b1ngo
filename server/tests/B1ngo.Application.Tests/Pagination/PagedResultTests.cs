using B1ngo.Application.Common.Pagination;

namespace B1ngo.Application.Tests.Pagination;

public class PagedResultTests
{
    [Fact]
    public void TotalPages_ComputedWithCeilingDivision()
    {
        var result = new PagedResult<string>
        {
            Items = ["a", "b", "c"],
            Page = 1,
            PageSize = 2,
            TotalCount = 5,
        };

        Assert.Equal(3, result.TotalPages);
    }

    [Fact]
    public void HasNextPage_WhenPageLessThanTotalPages_ReturnsTrue()
    {
        var result = new PagedResult<string>
        {
            Items = ["a"],
            Page = 1,
            PageSize = 1,
            TotalCount = 3,
        };

        Assert.True(result.HasNextPage);
    }

    [Fact]
    public void HasNextPage_WhenOnLastPage_ReturnsFalse()
    {
        var result = new PagedResult<string>
        {
            Items = ["c"],
            Page = 3,
            PageSize = 1,
            TotalCount = 3,
        };

        Assert.False(result.HasNextPage);
    }

    [Fact]
    public void HasPreviousPage_WhenOnPage1_ReturnsFalse()
    {
        var result = new PagedResult<string>
        {
            Items = ["a"],
            Page = 1,
            PageSize = 1,
            TotalCount = 3,
        };

        Assert.False(result.HasPreviousPage);
    }

    [Fact]
    public void HasPreviousPage_WhenOnPageGreaterThan1_ReturnsTrue()
    {
        var result = new PagedResult<string>
        {
            Items = ["b"],
            Page = 2,
            PageSize = 1,
            TotalCount = 3,
        };

        Assert.True(result.HasPreviousPage);
    }

    [Fact]
    public void EmptyItems_WithTotalCountZero_ReturnsTotalPagesZero()
    {
        var result = new PagedResult<string>
        {
            Items = [],
            Page = 1,
            PageSize = 10,
            TotalCount = 0,
        };

        Assert.Equal(0, result.TotalPages);
        Assert.False(result.HasNextPage);
        Assert.False(result.HasPreviousPage);
    }
}
