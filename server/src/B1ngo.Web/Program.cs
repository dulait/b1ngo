using B1ngo.Web.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddWebServices(builder.Configuration);

var app = builder.Build();

await app.ConfigurePipeline();

app.Run();

public partial class Program;
