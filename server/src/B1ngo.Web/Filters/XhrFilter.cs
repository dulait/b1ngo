using B1ngo.Web.Contracts.V1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace B1ngo.Web.Filters;

internal sealed class XhrFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var requiresXhr = context.ActionDescriptor.EndpointMetadata.Any(m => m is RequireXhrAttribute);

        if (!requiresXhr)
        {
            return;
        }

        if (
            !context.HttpContext.Request.Headers.TryGetValue("X-Requested-With", out var value)
            || value != "XMLHttpRequest"
        )
        {
            context.Result = new BadRequestObjectResult(
                new ErrorResponse("InvalidRequest", "Missing required header.")
            );
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
