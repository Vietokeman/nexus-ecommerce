# Multi-stage Docker build for Admin.API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/Services/Admin.API/Admin.API.csproj", "src/Services/Admin.API/"]
COPY ["src/BuildingBlocks/Common.Logging/Common.Logging.csproj", "src/BuildingBlocks/Common.Logging/"]
COPY ["src/BuildingBlocks/Contracts/Contracts.csproj", "src/BuildingBlocks/Contracts/"]
COPY ["src/BuildingBlocks/Infrastructure/Infrastructure.csproj", "src/BuildingBlocks/Infrastructure/"]
COPY ["src/BuildingBlocks/Shared/Shared.csproj", "src/BuildingBlocks/Shared/"]
RUN dotnet restore "src/Services/Admin.API/Admin.API.csproj"
COPY . .
WORKDIR "/src/src/Services/Admin.API"
RUN dotnet publish "Admin.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "Admin.API.dll"]
