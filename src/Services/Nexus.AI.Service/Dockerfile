FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Services/Nexus.AI.Service/Nexus.AI.Service.csproj", "Services/Nexus.AI.Service/"]
COPY ["BuildingBlocks/Common.Logging/Common.Logging.csproj", "BuildingBlocks/Common.Logging/"]
COPY ["BuildingBlocks/Contracts/Contracts.csproj", "BuildingBlocks/Contracts/"]
COPY ["BuildingBlocks/Infrastructure/Infrastructure.csproj", "BuildingBlocks/Infrastructure/"]
COPY ["BuildingBlocks/Shared/Shared.csproj", "BuildingBlocks/Shared/"]
RUN dotnet restore "Services/Nexus.AI.Service/Nexus.AI.Service.csproj"
COPY . .
WORKDIR "/src/Services/Nexus.AI.Service"
RUN dotnet build "Nexus.AI.Service.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Nexus.AI.Service.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Nexus.AI.Service.dll"]
