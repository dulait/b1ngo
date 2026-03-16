using Microsoft.AspNetCore.Mvc.Filters;

namespace B1ngo.Web.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class PlayerOrHostAttribute : Attribute, IFilterMetadata;
