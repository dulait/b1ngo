using B1ngo.Web.Extensions;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (port is not null)
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddWebServices(builder.Configuration, builder.Environment);

var app = builder.Build();

await app.ConfigurePipeline();

app.Run();

public partial class Program;
