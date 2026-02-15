# 📘 SECTION 12 — Authentication & Authorization with Duende Identity Server: Detailed Implementation Guide

**Services:** Identity.API (Duende Identity Server)  
**Technologies:** Duende Identity Server, ASP.NET Core Identity, JWT Bearer, Dapper, Stored Procedures  
**Database:** SQL Server  
**Port:** 6009  
**Date:** February 15, 2026

---

## 📋 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Duende Identity Server Setup](#2-duende-identity-server-setup)
3. [ASP.NET Core Identity Integration](#3-aspnet-core-identity-integration)
4. [Serilog Configuration](#4-serilog-configuration)
5. [Scopes, API Resources & Clients](#5-scopes-api-resources--clients)
6. [Database Migrations](#6-database-migrations)
7. [SMTP Email Service](#7-smtp-email-service)
8. [Repository Pattern & Lazy Loading](#8-repository-pattern--lazy-loading)
9. [Permission System (Dapper + Stored Procedures)](#9-permission-system)
10. [Authentication & Authorization Policies](#10-authentication--authorization-policies)
11. [Apply Auth to All Microservices](#11-apply-auth-to-all-microservices)
12. [Ocelot Gateway Authentication](#12-ocelot-gateway-authentication)
13. [Containerization](#13-containerization)
14. [Implementation Tasks & Timeline](#14-implementation-tasks--timeline)

---

## 1. Architecture Overview

### Authentication Flow (Complete)

```
React Client                    Ocelot Gateway              Identity.API           Microservices
    │                               │                            │                      │
    │── POST /api/auth/login ──────→│── Proxy ──────────────────→│                      │
    │                               │                            │── Validate creds     │
    │                               │                            │── Generate JWT        │
    │←── { accessToken, refresh }──│←── JWT Response ───────────│                      │
    │                               │                            │                      │
    │── GET /api/products ─────────→│                            │                      │
    │   Authorization: Bearer xxx   │── Validate JWT ───────────→│                      │
    │                               │   (via shared key)         │                      │
    │                               │── Proxy (if valid) ───────→│──────────────────────→│
    │                               │                            │                      │── Process
    │←── Product data ─────────────│←── Response ───────────────│←─────────────────────│
```

### Token Architecture

```
┌───────────────────────────────────────────────┐
│              JWT Access Token                  │
│                                                │
│  Header:  { alg: HS256, typ: JWT }            │
│  Payload: {                                    │
│    sub: "user-id-guid",                       │
│    email: "user@example.com",                 │
│    role: "Admin",                              │
│    permissions: ["product.read", "product.write"], │
│    iss: "distributed-ecommerce-platform",      │
│    exp: 1740000000,                            │
│    iat: 1739913600                             │
│  }                                             │
│  Signature: HMACSHA256(header.payload, secret) │
└───────────────────────────────────────────────┘
```

---

## 2. Duende Identity Server Setup

### 2.1 Project Structure

```
src/Services/Identity.API/
├── Identity.API.csproj
├── Program.cs
├── Dockerfile
├── appsettings.json
├── appsettings.Development.json
│
├── Configuration/
│   ├── IdentityServerConfig.cs       ← Scopes, Resources, Clients
│   ├── JwtSettings.cs                ← JWT token configuration
│   └── SmtpSettings.cs               ← Email configuration
│
├── Controllers/
│   ├── AuthController.cs             ← Login, Register, RefreshToken
│   ├── UserController.cs             ← User management
│   └── PermissionController.cs       ← Permission CRUD
│
├── Data/
│   ├── IdentityDbContext.cs           ← EF Core DbContext
│   └── Migrations/                    ← EF Core migrations
│
├── Entities/
│   ├── AppUser.cs                     ← IdentityUser extension
│   ├── Permission.cs                  ← Permission entity
│   ├── RolePermission.cs             ← Role-Permission mapping
│   └── RefreshToken.cs               ← Refresh token entity
│
├── Repositories/
│   ├── Interfaces/
│   │   ├── IUserRepository.cs
│   │   ├── IPermissionRepository.cs
│   │   └── IRepositoryManager.cs     ← Lazy loading manager
│   ├── UserRepository.cs
│   ├── PermissionRepository.cs       ← Uses Dapper
│   └── RepositoryManager.cs
│
├── Services/
│   ├── Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── ITokenService.cs
│   │   ├── IEmailService.cs
│   │   └── IPermissionService.cs
│   ├── AuthService.cs
│   ├── TokenService.cs
│   ├── EmailService.cs
│   └── PermissionService.cs
│
├── DTOs/
│   ├── Auth/
│   │   ├── LoginRequest.cs
│   │   ├── RegisterRequest.cs
│   │   ├── TokenResponse.cs
│   │   ├── RefreshTokenRequest.cs
│   │   ├── ForgotPasswordRequest.cs
│   │   ├── ResetPasswordRequest.cs
│   │   └── ConfirmEmailRequest.cs
│   ├── User/
│   │   ├── UserDto.cs
│   │   └── UpdateUserRequest.cs
│   └── Permission/
│       ├── PermissionDto.cs
│       ├── CreatePermissionRequest.cs
│       └── RolePermissionRequest.cs
│
├── Middleware/
│   ├── PermissionAuthorizationHandler.cs
│   └── PermissionRequirement.cs
│
└── StoredProcedures/
    ├── sp_GetPermissionsByRole.sql
    ├── sp_GetPermissionsByUser.sql
    ├── sp_AssignPermissionToRole.sql
    └── sp_RemovePermissionFromRole.sql
```

### 2.2 NuGet Packages

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <!-- Identity -->
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.*" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.*" />
    <PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.0.*" />

    <!-- Duende Identity Server -->
    <PackageReference Include="Duende.IdentityServer" Version="7.0.*" />
    <PackageReference Include="Duende.IdentityServer.AspNetIdentity" Version="7.0.*" />
    <PackageReference Include="Duende.IdentityServer.EntityFramework" Version="7.0.*" />

    <!-- Database -->
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.*" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.*" />
    <PackageReference Include="Dapper" Version="2.1.*" />

    <!-- Logging -->
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.*" />
    <PackageReference Include="Serilog.Sinks.Elasticsearch" Version="10.0.*" />

    <!-- Email -->
    <PackageReference Include="MailKit" Version="4.3.*" />

    <!-- Mapping -->
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.*" />

    <!-- Validation -->
    <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.*" />

    <!-- Health Checks -->
    <PackageReference Include="AspNetCore.HealthChecks.SqlServer" Version="8.0.*" />
    <PackageReference Include="AspNetCore.HealthChecks.UI.Client" Version="8.0.*" />
  </ItemGroup>
</Project>
```

### 2.3 Program.cs

```csharp
using Serilog;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Identity.API.Configuration;
using Identity.API.Data;
using Identity.API.Entities;
using Identity.API.Repositories;
using Identity.API.Repositories.Interfaces;
using Identity.API.Services;
using Identity.API.Services.Interfaces;
using Identity.API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ──────────── Serilog ────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "Identity.API")
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new Serilog.Sinks.Elasticsearch.ElasticsearchSinkOptions(
        new Uri(builder.Configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "identity-api-logs-{0:yyyy.MM.dd}"
    })
    .CreateLogger();
builder.Host.UseSerilog();

// ──────────── Database ────────────
builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionString")));

// ──────────── ASP.NET Core Identity ────────────
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<IdentityDbContext>()
.AddDefaultTokenProviders();

// ──────────── JWT Authentication ────────────
var jwtSettings = builder.Configuration.GetSection("JwtTokenSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// ──────────── Authorization Policies ────────────
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequirePermission", policy =>
        policy.Requirements.Add(new PermissionRequirement()));
});
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

// ──────────── Services & Repositories ────────────
builder.Services.Configure<JwtSettings>(jwtSettings);
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));

builder.Services.AddScoped<IRepositoryManager, RepositoryManager>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();

builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ──────────── Health Checks ────────────
builder.Services.AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionString")!,
        name: "SQLServer-IdentityDb", tags: new[] { "db", "sqlserver" });

// ──────────── CORS ────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseSerilogRequestLogging();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Seed default admin user
using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await SeedData.Initialize(userManager, roleManager);
}

app.Run();
```

---

## 3. ASP.NET Core Identity Integration

### 3.1 AppUser Entity

```csharp
// Entities/AppUser.cs
using Microsoft.AspNetCore.Identity;

namespace Identity.API.Entities;

public class AppUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
```

### 3.2 RefreshToken Entity

```csharp
// Entities/RefreshToken.cs
namespace Identity.API.Entities;

public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual AppUser User { get; set; } = null!;
}
```

### 3.3 IdentityDbContext

```csharp
// Data/IdentityDbContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Identity.API.Entities;

namespace Identity.API.Data;

public class IdentityDbContext : IdentityDbContext<AppUser>
{
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        builder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => new { e.RoleId, e.PermissionId });
            entity.HasOne(e => e.Permission).WithMany().HasForeignKey(e => e.PermissionId);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User).WithMany(u => u.RefreshTokens).HasForeignKey(e => e.UserId);
        });
    }
}
```

---

## 4. Serilog Configuration

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.AspNetCore.Authentication": "Debug",
        "Duende": "Debug"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "Elasticsearch",
        "Args": {
          "nodeUris": "http://elasticsearch:9200",
          "autoRegisterTemplate": true,
          "indexFormat": "identity-api-logs-{0:yyyy.MM.dd}",
          "numberOfShards": 2,
          "numberOfReplicas": 1
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  }
}
```

---

## 5. Scopes, API Resources & Clients

### 5.1 Identity Server Configuration

```csharp
// Configuration/IdentityServerConfig.cs
using Duende.IdentityServer.Models;

namespace Identity.API.Configuration;

public static class IdentityServerConfig
{
    public static IEnumerable<IdentityResource> IdentityResources =>
        new IdentityResource[]
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
            new IdentityResources.Email(),
        };

    public static IEnumerable<ApiScope> ApiScopes =>
        new ApiScope[]
        {
            new("product.read",    "Read Products"),
            new("product.write",   "Write Products"),
            new("customer.read",   "Read Customers"),
            new("customer.write",  "Write Customers"),
            new("basket.read",     "Read Basket"),
            new("basket.write",    "Write Basket"),
            new("order.read",      "Read Orders"),
            new("order.write",     "Write Orders"),
            new("inventory.read",  "Read Inventory"),
            new("inventory.write", "Write Inventory"),
            new("payment.read",    "Read Payment"),
            new("payment.write",   "Write Payment"),
        };

    public static IEnumerable<ApiResource> ApiResources =>
        new ApiResource[]
        {
            new("product-api",   "Product Microservice")   { Scopes = { "product.read", "product.write" } },
            new("customer-api",  "Customer Microservice")  { Scopes = { "customer.read", "customer.write" } },
            new("basket-api",    "Basket Microservice")    { Scopes = { "basket.read", "basket.write" } },
            new("ordering-api",  "Ordering Microservice")  { Scopes = { "order.read", "order.write" } },
            new("inventory-api", "Inventory Microservice") { Scopes = { "inventory.read", "inventory.write" } },
            new("payment-api",   "Payment Microservice")   { Scopes = { "payment.read", "payment.write" } },
        };

    public static IEnumerable<Client> Clients =>
        new Client[]
        {
            // React Client (SPA)
            new Client
            {
                ClientId = "react-client",
                ClientName = "React E-Commerce Client",
                AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,
                ClientSecrets = { new Secret("react-secret".Sha256()) },
                AllowedScopes = {
                    "openid", "profile", "email",
                    "product.read", "basket.read", "basket.write",
                    "order.read", "order.write", "payment.read", "payment.write"
                },
                AllowOfflineAccess = true,
                AccessTokenLifetime = 86400,  // 24 hours
                RefreshTokenLifetime = 604800  // 7 days
            },

            // Admin Client
            new Client
            {
                ClientId = "admin-client",
                ClientName = "Admin Dashboard",
                AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,
                ClientSecrets = { new Secret("admin-secret".Sha256()) },
                AllowedScopes = {
                    "openid", "profile", "email",
                    "product.read", "product.write",
                    "customer.read", "customer.write",
                    "order.read", "order.write",
                    "inventory.read", "inventory.write",
                    "payment.read", "payment.write"
                },
                AllowOfflineAccess = true
            },

            // Service-to-Service (Machine-to-Machine)
            new Client
            {
                ClientId = "basket-service",
                AllowedGrantTypes = GrantTypes.ClientCredentials,
                ClientSecrets = { new Secret("basket-secret".Sha256()) },
                AllowedScopes = { "inventory.read", "order.write" }
            },
            new Client
            {
                ClientId = "ordering-service",
                AllowedGrantTypes = GrantTypes.ClientCredentials,
                ClientSecrets = { new Secret("ordering-secret".Sha256()) },
                AllowedScopes = { "payment.write", "inventory.read" }
            }
        };
}
```

---

## 6. Database Migrations

### 6.1 Three Database Contexts

| Context                     | Purpose         | Tables                                                                |
| --------------------------- | --------------- | --------------------------------------------------------------------- |
| **IdentityDbContext**       | User management | AspNetUsers, AspNetRoles, Permissions, RolePermissions, RefreshTokens |
| **ConfigurationDbContext**  | IS config       | Clients, ApiScopes, ApiResources, IdentityResources                   |
| **PersistedGrantDbContext** | IS runtime      | PersistedGrants, DeviceFlowCodes                                      |

### 6.2 Migration Commands

```bash
# Identity context
dotnet ef migrations add InitialIdentity -c IdentityDbContext -o Data/Migrations/Identity

# Duende Configuration context
dotnet ef migrations add InitialConfig -c ConfigurationDbContext -o Data/Migrations/Configuration

# Duende PersistedGrant context
dotnet ef migrations add InitialPersistedGrant -c PersistedGrantDbContext -o Data/Migrations/PersistedGrant
```

### 6.3 Seed Data

```csharp
// Data/SeedData.cs
public static class SeedData
{
    public static async Task Initialize(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        // Seed Roles
        string[] roles = { "Admin", "Customer", "Manager" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Seed Admin User
        var adminUser = await userManager.FindByEmailAsync("admin@microservices.com");
        if (adminUser == null)
        {
            adminUser = new AppUser
            {
                UserName = "admin@microservices.com",
                Email = "admin@microservices.com",
                FirstName = "System",
                LastName = "Admin",
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(adminUser, "Admin@123");
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }

        // Seed Test Customer
        var customerUser = await userManager.FindByEmailAsync("customer@microservices.com");
        if (customerUser == null)
        {
            customerUser = new AppUser
            {
                UserName = "customer@microservices.com",
                Email = "customer@microservices.com",
                FirstName = "Test",
                LastName = "Customer",
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(customerUser, "Customer@123");
            await userManager.AddToRoleAsync(customerUser, "Customer");
        }
    }
}
```

---

## 7. SMTP Email Service

```csharp
// Services/EmailService.cs
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;
using Identity.API.Configuration;
using Identity.API.Services.Interfaces;

namespace Identity.API.Services;

public class EmailService : IEmailService
{
    private readonly SmtpSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<SmtpSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = body };

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_settings.Host, _settings.Port,
                _settings.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);
            await client.AuthenticateAsync(_settings.User, _settings.Pass);
            await client.SendAsync(message);
            _logger.LogInformation("Email sent to {Email} — Subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", to);
            throw;
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }

    public async Task SendConfirmationEmailAsync(string email, string token)
    {
        var confirmUrl = $"http://localhost:3000/confirm-email?email={email}&token={Uri.EscapeDataString(token)}";
        var body = $@"
            <h2>Confirm Your Email</h2>
            <p>Click the link below to confirm your email address:</p>
            <a href='{confirmUrl}'>Confirm Email</a>
            <p>This link expires in 24 hours.</p>";

        await SendEmailAsync(email, "Confirm Your Email — E-Commerce Platform", body);
    }

    public async Task SendPasswordResetEmailAsync(string email, string token)
    {
        var resetUrl = $"http://localhost:3000/reset-password?email={email}&token={Uri.EscapeDataString(token)}";
        var body = $@"
            <h2>Reset Your Password</h2>
            <p>Click the link below to reset your password:</p>
            <a href='{resetUrl}'>Reset Password</a>
            <p>This link expires in 1 hour.</p>";

        await SendEmailAsync(email, "Reset Password — E-Commerce Platform", body);
    }
}
```

### SMTP Configuration (appsettings.json)

```json
{
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "vietbmt19@gmail.com",
    "Pass": "raka azkp yhzv ltgd",
    "UseSsl": false,
    "UseStartTls": true,
    "FromName": "E-Commerce Platform",
    "FromEmail": "vietbmt19@gmail.com"
  }
}
```

---

## 8. Repository Pattern & Lazy Loading

### 8.1 Repository Manager (Lazy Loading)

```csharp
// Repositories/RepositoryManager.cs
using Identity.API.Repositories.Interfaces;
using Identity.API.Data;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Identity.API.Repositories;

public class RepositoryManager : IRepositoryManager
{
    private readonly IdentityDbContext _context;
    private readonly IConfiguration _configuration;

    private readonly Lazy<IUserRepository> _userRepository;
    private readonly Lazy<IPermissionRepository> _permissionRepository;

    public RepositoryManager(IdentityDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;

        _userRepository = new Lazy<IUserRepository>(() =>
            new UserRepository(context));
        _permissionRepository = new Lazy<IPermissionRepository>(() =>
            new PermissionRepository(CreateDapperConnection()));
    }

    public IUserRepository UserRepository => _userRepository.Value;
    public IPermissionRepository PermissionRepository => _permissionRepository.Value;

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    private IDbConnection CreateDapperConnection()
    {
        return new SqlConnection(_configuration.GetConnectionString("DefaultConnectionString"));
    }
}
```

### 8.2 Interface

```csharp
// Repositories/Interfaces/IRepositoryManager.cs
namespace Identity.API.Repositories.Interfaces;

public interface IRepositoryManager
{
    IUserRepository UserRepository { get; }
    IPermissionRepository PermissionRepository { get; }
    Task<int> SaveChangesAsync();
}
```

---

## 9. Permission System

### 9.1 Permission Entity

```csharp
// Entities/Permission.cs
namespace Identity.API.Entities;

public class Permission
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;          // e.g., "product.read"
    public string? Description { get; set; }
    public string Module { get; set; } = string.Empty;        // e.g., "Product"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class RolePermission
{
    public string RoleId { get; set; } = string.Empty;
    public int PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}
```

### 9.2 Stored Procedures

```sql
-- StoredProcedures/sp_GetPermissionsByRole.sql
CREATE PROCEDURE sp_GetPermissionsByRole
    @RoleId NVARCHAR(450)
AS
BEGIN
    SELECT p.Id, p.Name, p.Description, p.Module
    FROM Permissions p
    INNER JOIN RolePermissions rp ON p.Id = rp.PermissionId
    WHERE rp.RoleId = @RoleId
    ORDER BY p.Module, p.Name
END
GO

-- StoredProcedures/sp_GetPermissionsByUser.sql
CREATE PROCEDURE sp_GetPermissionsByUser
    @UserId NVARCHAR(450)
AS
BEGIN
    SELECT DISTINCT p.Id, p.Name, p.Description, p.Module
    FROM Permissions p
    INNER JOIN RolePermissions rp ON p.Id = rp.PermissionId
    INNER JOIN AspNetUserRoles ur ON rp.RoleId = ur.RoleId
    WHERE ur.UserId = @UserId
    ORDER BY p.Module, p.Name
END
GO

-- StoredProcedures/sp_AssignPermissionToRole.sql
CREATE PROCEDURE sp_AssignPermissionToRole
    @RoleId NVARCHAR(450),
    @PermissionId INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RolePermissions WHERE RoleId = @RoleId AND PermissionId = @PermissionId)
    BEGIN
        INSERT INTO RolePermissions (RoleId, PermissionId)
        VALUES (@RoleId, @PermissionId)
    END
END
GO

-- StoredProcedures/sp_RemovePermissionFromRole.sql
CREATE PROCEDURE sp_RemovePermissionFromRole
    @RoleId NVARCHAR(450),
    @PermissionId INT
AS
BEGIN
    DELETE FROM RolePermissions
    WHERE RoleId = @RoleId AND PermissionId = @PermissionId
END
GO
```

### 9.3 Permission Repository (Dapper)

```csharp
// Repositories/PermissionRepository.cs
using Dapper;
using Identity.API.Entities;
using Identity.API.Repositories.Interfaces;
using System.Data;

namespace Identity.API.Repositories;

public class PermissionRepository : IPermissionRepository
{
    private readonly IDbConnection _connection;

    public PermissionRepository(IDbConnection connection) => _connection = connection;

    public async Task<IEnumerable<Permission>> GetPermissionsByRoleAsync(string roleId)
    {
        return await _connection.QueryAsync<Permission>(
            "sp_GetPermissionsByRole",
            new { RoleId = roleId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<Permission>> GetPermissionsByUserAsync(string userId)
    {
        return await _connection.QueryAsync<Permission>(
            "sp_GetPermissionsByUser",
            new { UserId = userId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task AssignPermissionToRoleAsync(string roleId, int permissionId)
    {
        await _connection.ExecuteAsync(
            "sp_AssignPermissionToRole",
            new { RoleId = roleId, PermissionId = permissionId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task RemovePermissionFromRoleAsync(string roleId, int permissionId)
    {
        await _connection.ExecuteAsync(
            "sp_RemovePermissionFromRole",
            new { RoleId = roleId, PermissionId = permissionId },
            commandType: CommandType.StoredProcedure);
    }
}
```

### 9.4 Permission Authorization Handler

```csharp
// Middleware/PermissionAuthorizationHandler.cs
using Microsoft.AspNetCore.Authorization;
using Identity.API.Repositories.Interfaces;
using System.Security.Claims;

namespace Identity.API.Middleware;

public class PermissionRequirement : IAuthorizationRequirement { }

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IServiceProvider _serviceProvider;

    public PermissionAuthorizationHandler(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            context.Fail();
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var permissionRepo = scope.ServiceProvider
            .GetRequiredService<IRepositoryManager>().PermissionRepository;

        var permissions = await permissionRepo.GetPermissionsByUserAsync(userId);
        var permissionNames = permissions.Select(p => p.Name).ToHashSet();

        // Check if endpoint requires a specific permission
        var endpoint = context.Resource as HttpContext;
        var requiredPermission = endpoint?.GetEndpoint()
            ?.Metadata.GetMetadata<PermissionAttribute>()?.Permission;

        if (requiredPermission == null || permissionNames.Contains(requiredPermission))
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail();
        }
    }
}

// Custom attribute
[AttributeUsage(AttributeTargets.Method)]
public class PermissionAttribute : Attribute
{
    public string Permission { get; }
    public PermissionAttribute(string permission) => Permission = permission;
}
```

### 9.5 Using Permission Attribute on Controllers

```csharp
// Example: Product.API/Controllers/ProductsController.cs
[HttpPost]
[Authorize]
[Permission("product.write")]
public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
{
    // ...
}

[HttpDelete("{id}")]
[Authorize]
[Permission("product.delete")]
public async Task<IActionResult> DeleteProduct(long id)
{
    // ...
}
```

---

## 10. Authentication & Authorization Policies

### 10.1 Auth Controller APIs

```csharp
// Controllers/AuthController.cs
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // Send confirmation email
        return Ok(new { message = "Registration successful. Please confirm your email." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (response == null)
            return Unauthorized(new { message = "Invalid credentials" });

        return Ok(response);  // { accessToken, refreshToken, expiresIn }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var response = await _authService.RefreshTokenAsync(request.RefreshToken);
        if (response == null)
            return Unauthorized(new { message = "Invalid or expired refresh token" });

        return Ok(response);
    }

    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
    {
        var result = await _authService.ConfirmEmailAsync(request.Email, request.Token);
        return result ? Ok() : BadRequest(new { message = "Invalid confirmation token" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _authService.ForgotPasswordAsync(request.Email);
        return Ok(new { message = "If the email exists, a reset link was sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _authService.ResetPasswordAsync(request);
        return result ? Ok() : BadRequest(new { message = "Reset failed" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _authService.GetUserByIdAsync(userId!);
        return Ok(user);
    }
}
```

### 10.2 Permission Controller APIs

```csharp
// Controllers/PermissionController.cs
[ApiController]
[Route("api/permissions")]
[Authorize(Roles = "Admin")]
public class PermissionController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    [HttpGet]
    public async Task<IActionResult> GetAllPermissions()
    {
        var permissions = await _permissionService.GetAllPermissionsAsync();
        return Ok(permissions);
    }

    [HttpGet("role/{roleId}")]
    public async Task<IActionResult> GetPermissionsByRole(string roleId)
    {
        var permissions = await _permissionService.GetPermissionsByRoleAsync(roleId);
        return Ok(permissions);
    }

    [HttpPost("role/{roleId}/assign")]
    public async Task<IActionResult> AssignPermission(string roleId, [FromBody] int permissionId)
    {
        await _permissionService.AssignPermissionToRoleAsync(roleId, permissionId);
        return Ok();
    }

    [HttpDelete("role/{roleId}/remove/{permissionId}")]
    public async Task<IActionResult> RemovePermission(string roleId, int permissionId)
    {
        await _permissionService.RemovePermissionFromRoleAsync(roleId, permissionId);
        return Ok();
    }
}
```

---

## 11. Apply Auth to All Microservices

### 11.1 Shared Authentication Extension

```csharp
// BuildingBlocks/Infrastructure/Common/AuthenticationExtensions.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Infrastructure.Common;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtTokenSettings");
        var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(secretKey),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        return services;
    }
}
```

### 11.2 Apply to Each Service

```csharp
// Product.API/Program.cs (add 2 lines)
builder.Services.AddJwtAuthentication(builder.Configuration);
// ...
app.UseAuthentication();
app.UseAuthorization();
```

Repeat for: Customer.API, Basket.API, Ordering.API, Inventory.API, Payment.API

### 11.3 JWT Settings (add to all appsettings.json)

```json
{
  "JwtTokenSettings": {
    "Key": "bXlfc2VjdXJlX2p3dF9rZXlfMTI4IQ==",
    "Issuer": "distributed-ecommerce-platform"
  }
}
```

### 11.4 Auth per Service Summary

| Service       | Public Endpoints                              | Protected Endpoints               |
| ------------- | --------------------------------------------- | --------------------------------- |
| Product.API   | `GET /api/products`, `GET /api/products/{id}` | `POST`, `PUT`, `DELETE`           |
| Customer.API  | None                                          | All endpoints                     |
| Basket.API    | None                                          | All endpoints (user's own basket) |
| Ordering.API  | None                                          | All endpoints                     |
| Inventory.API | `GET /api/inventory/stock/*`                  | `POST` (purchase orders)          |
| Payment.API   | `POST /api/payment/payos-callback` (webhook)  | Create, Status                    |
| Identity.API  | Login, Register, ConfirmEmail, ForgotPassword | Me, Permissions                   |

---

## 12. Ocelot Gateway Authentication

See [SECTION_8_DETAIL.md](./SECTION_8_DETAIL.md) Section 3 for full Ocelot JWT configuration.

Key points:

- Ocelot validates JWT token on protected routes
- `AuthenticationOptions.AuthenticationProviderKey = "Bearer"`
- Token is forwarded to downstream services via HTTP headers
- Each service also validates the token (defense in depth)

---

## 13. Containerization

### 13.1 Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Services/Identity.API/Identity.API.csproj", "Services/Identity.API/"]
COPY ["BuildingBlocks/Infrastructure/Infrastructure.csproj", "BuildingBlocks/Infrastructure/"]
COPY ["BuildingBlocks/Contracts/Contracts.csproj", "BuildingBlocks/Contracts/"]
COPY ["BuildingBlocks/Shared/Shared.csproj", "BuildingBlocks/Shared/"]
RUN dotnet restore "Services/Identity.API/Identity.API.csproj"
COPY . .
WORKDIR "/src/Services/Identity.API"
RUN dotnet build "Identity.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Identity.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Identity.API.dll"]
```

### 13.2 Docker Compose

```yaml
# docker-compose.yml
identity.api:
  image: ${DOCKER_REGISTRY-}identity-api:${PLATFORM:-linux}-${TAG:-latest}
  build:
    context: .
    dockerfile: Services/Identity.API/Dockerfile

# docker-compose.override.yml
identity.api:
  container_name: identity.api
  environment:
    - ASPNETCORE_ENVIRONMENT=Development
    - ASPNETCORE_URLS=http://+:80
    - "ConnectionStrings:DefaultConnectionString=Server=orderdb;Database=IdentityDb;User Id=sa;Password=Passw0rd!;Encrypt=False;TrustServerCertificate=True"
    - "ElasticConfiguration:Uri=http://elasticsearch:9200"
    - "JwtTokenSettings:Key=bXlfc2VjdXJlX2p3dF9rZXlfMTI4IQ=="
    - "JwtTokenSettings:Issuer=distributed-ecommerce-platform"
    - "Smtp:Host=smtp.gmail.com"
    - "Smtp:Port=587"
    - "Smtp:User=vietbmt19@gmail.com"
    - "Smtp:Pass=raka azkp yhzv ltgd"
  depends_on:
    - orderdb
    - elasticsearch
  ports:
    - "6009:80"
  restart: always
```

---

## 14. Implementation Tasks & Timeline

### Task Breakdown

| #   | Task                                              | Effort | Priority | Phase      |
| --- | ------------------------------------------------- | ------ | -------- | ---------- |
| 1   | Create Identity.API project & folder structure    | 1h     | CRITICAL | Setup      |
| 2   | Install NuGet packages                            | 30m    | CRITICAL | Setup      |
| 3   | Create AppUser, Permission, RefreshToken entities | 1h     | CRITICAL | Domain     |
| 4   | Create IdentityDbContext                          | 1h     | CRITICAL | Data       |
| 5   | Create & apply EF Core migrations                 | 1h     | CRITICAL | Data       |
| 6   | Configure Serilog + Elasticsearch                 | 30m    | HIGH     | Infra      |
| 7   | Implement TokenService (JWT generation)           | 2h     | CRITICAL | Auth       |
| 8   | Implement AuthService (register, login, refresh)  | 3h     | CRITICAL | Auth       |
| 9   | Implement EmailService (MailKit)                  | 1h     | HIGH     | Auth       |
| 10  | Create AuthController APIs                        | 2h     | CRITICAL | API        |
| 11  | Create seed data (admin user, roles)              | 1h     | HIGH     | Data       |
| 12  | Create stored procedures                          | 1h     | HIGH     | Permission |
| 13  | Implement PermissionRepository (Dapper)           | 2h     | HIGH     | Permission |
| 14  | Implement RepositoryManager (lazy loading)        | 1h     | HIGH     | Pattern    |
| 15  | Implement PermissionService                       | 1h     | HIGH     | Permission |
| 16  | Create PermissionController APIs                  | 1h     | HIGH     | API        |
| 17  | Create PermissionAuthorizationHandler             | 2h     | HIGH     | Auth       |
| 18  | Create shared AuthenticationExtensions            | 1h     | HIGH     | Shared     |
| 19  | Apply JWT to Product.API                          | 1h     | HIGH     | Apply      |
| 20  | Apply JWT to Customer.API                         | 30m    | HIGH     | Apply      |
| 21  | Apply JWT to Basket.API                           | 30m    | HIGH     | Apply      |
| 22  | Apply JWT to Ordering.API                         | 30m    | HIGH     | Apply      |
| 23  | Apply JWT to Inventory.API                        | 30m    | HIGH     | Apply      |
| 24  | Apply JWT to Payment.API                          | 30m    | HIGH     | Apply      |
| 25  | Configure Ocelot Gateway Auth                     | 1h     | CRITICAL | Gateway    |
| 26  | Create Dockerfile                                 | 30m    | HIGH     | Docker     |
| 27  | Add to docker-compose                             | 30m    | HIGH     | Docker     |
| 28  | Seed permissions data                             | 1h     | MEDIUM   | Data       |
| 29  | End-to-end auth flow testing                      | 3h     | CRITICAL | Testing    |
| 30  | Document API endpoints                            | 1h     | MEDIUM   | Docs       |

**Total estimated effort: ~34 hours (4-5 days)**

### Default Permissions to Seed

| Module     | Permission          | Description            |
| ---------- | ------------------- | ---------------------- |
| Product    | `product.read`      | View products          |
| Product    | `product.write`     | Create/update products |
| Product    | `product.delete`    | Delete products        |
| Customer   | `customer.read`     | View customers         |
| Customer   | `customer.write`    | Manage customers       |
| Basket     | `basket.read`       | View basket            |
| Basket     | `basket.write`      | Modify basket          |
| Order      | `order.read`        | View orders            |
| Order      | `order.write`       | Create/update orders   |
| Order      | `order.delete`      | Delete orders          |
| Inventory  | `inventory.read`    | View inventory         |
| Inventory  | `inventory.write`   | Manage inventory       |
| Payment    | `payment.read`      | View payments          |
| Payment    | `payment.write`     | Create payments        |
| User       | `user.read`         | View users             |
| User       | `user.write`        | Manage users           |
| Permission | `permission.manage` | Manage permissions     |

### Test Accounts

| Email                      | Password     | Role     | Permissions                                                |
| -------------------------- | ------------ | -------- | ---------------------------------------------------------- |
| admin@microservices.com    | Admin@123    | Admin    | All                                                        |
| customer@microservices.com | Customer@123 | Customer | product.read, basket._, order.read, order.write, payment._ |
