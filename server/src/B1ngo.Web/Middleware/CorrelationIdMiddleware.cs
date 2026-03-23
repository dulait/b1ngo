using B1ngo.Application.Common;

namespace B1ngo.Web.Middleware;

internal sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context, CorrelationContext correlationContext)
    {
        if (
            context.Request.Headers.TryGetValue(HeaderName, out var headerValue)
            && Guid.TryParse(headerValue, out var correlationId)
        )
        {
            correlationContext.CorrelationId = correlationId;
        }

        await next(context);
    }
}
