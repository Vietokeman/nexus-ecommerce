# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Services/Inventory.Product.API/Inventory.Product.API.csproj", "Services/Inventory.Product.API/"]
COPY ["BuildingBlocks/Common.Logging/Common.Logging.csproj", "BuildingBlocks/Common.Logging/"]
COPY ["BuildingBlocks/Shared/Shared.csproj", "BuildingBlocks/Shared/"]

RUN dotnet restore "Services/Inventory.Product.API/Inventory.Product.API.csproj"

# Copy everything and build
COPY . .
WORKDIR "/src/Services/Inventory.Product.API"
RUN dotnet build "Inventory.Product.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Inventory.Product.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .

# Expose ports: 80 for HTTP, 5005 for gRPC
EXPOSE 80
EXPOSE 5005

ENTRYPOINT ["dotnet", "Inventory.Product.API.dll"]
