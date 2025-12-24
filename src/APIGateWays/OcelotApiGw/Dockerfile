# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["APIGateWays/OcelotApiGw/OcelotApiGw.csproj", "APIGateWays/OcelotApiGw/"]
RUN dotnet restore "APIGateWays/OcelotApiGw/OcelotApiGw.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/APIGateWays/OcelotApiGw"
RUN dotnet build "OcelotApiGw.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "OcelotApiGw.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Copy published files
COPY --from=publish /app/publish .

# Set environment variable
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "OcelotApiGw.dll"]
