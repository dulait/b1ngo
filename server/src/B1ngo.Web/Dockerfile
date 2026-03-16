FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and all project files first for restore layer caching.
# This layer only invalidates when project references or packages change.
COPY B1ngo.slnx .
COPY src/B1ngo.Domain.Core/B1ngo.Domain.Core.csproj src/B1ngo.Domain.Core/
COPY src/B1ngo.Domain.Game/B1ngo.Domain.Game.csproj src/B1ngo.Domain.Game/
COPY src/B1ngo.Application.Common/B1ngo.Application.Common.csproj src/B1ngo.Application.Common/
COPY src/B1ngo.Application.Features/B1ngo.Application.Features.csproj src/B1ngo.Application.Features/
COPY src/B1ngo.Infrastructure/B1ngo.Infrastructure.csproj src/B1ngo.Infrastructure/
COPY src/B1ngo.Web/B1ngo.Web.csproj src/B1ngo.Web/
RUN dotnet restore src/B1ngo.Web/B1ngo.Web.csproj

# Copy everything and publish
COPY src/ src/
RUN dotnet publish src/B1ngo.Web/B1ngo.Web.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "B1ngo.Web.dll"]
