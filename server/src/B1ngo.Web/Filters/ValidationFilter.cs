using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace B1ngo.Web.Filters;

internal sealed class ValidationFilter(IServiceProvider serviceProvider) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null)
            {
                continue;
            }

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            var validators = serviceProvider.GetServices(validatorType);

            var validationContext = new ValidationContext<object>(argument);
            var failures = new List<FluentValidation.Results.ValidationFailure>();

            foreach (var validator in validators.Cast<IValidator>())
            {
                var result = await validator.ValidateAsync(validationContext, context.HttpContext.RequestAborted);
                failures.AddRange(result.Errors);
            }

            if (failures.Count > 0)
            {
                var details = failures.Select(f => $"{f.PropertyName}: {f.ErrorMessage}").ToList();

                context.Result = new BadRequestObjectResult(
                    new
                    {
                        code = "validation_error",
                        message = failures[0].ErrorMessage,
                        details,
                    }
                );
                return;
            }
        }

        await next();
    }
}
