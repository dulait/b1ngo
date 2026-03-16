using System.Net;
using System.Text.Json;
using B1ngo.Domain.Core;

namespace B1ngo.Web.Middleware;

internal sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (DomainConflictException ex)
        {
            logger.LogWarning(
                ex,
                "Domain conflict for {Method} {Path}: {Code}",
                context.Request.Method,
                context.Request.Path,
                ex.Code
            );

            await WriteResponse(context, HttpStatusCode.Conflict, ex.Code, ex.Message);
        }
        catch (DomainNotFoundException ex)
        {
            logger.LogWarning(
                ex,
                "Domain not found for {Method} {Path}: {Code}",
                context.Request.Method,
                context.Request.Path,
                ex.Code
            );

            await WriteResponse(context, HttpStatusCode.NotFound, ex.Code, ex.Message);
        }
        catch (DomainException ex)
        {
            logger.LogWarning(
                ex,
                "Domain error for {Method} {Path}: {Code}",
                context.Request.Method,
                context.Request.Path,
                ex.Code
            );

            await WriteResponse(context, HttpStatusCode.UnprocessableEntity, ex.Code, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Unhandled exception for {Method} {Path}",
                context.Request.Method,
                context.Request.Path
            );

            await WriteResponse(
                context,
                HttpStatusCode.InternalServerError,
                "unexpected",
                "An unexpected error occurred."
            );
        }
    }

    private static async Task WriteResponse(HttpContext context, HttpStatusCode statusCode, string code, string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var body = new { code, message };
        await context.Response.WriteAsync(JsonSerializer.Serialize(body, JsonOptions));
    }
}
