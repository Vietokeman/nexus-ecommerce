using System.Text;
using Identity.API.Configuration;
using Identity.API.Data;
using Identity.API.Entities;
using Identity.API.Services;
using Identity.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.OpenApi.Models;
using AspNet.Security.OAuth.GitHub;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "Identity.API")
    .WriteTo.Debug()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}")
    .WriteTo.Elasticsearch(new Serilog.Sinks.Elasticsearch.ElasticsearchSinkOptions(
        new Uri(builder.Configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "identity-api-logs-{0:yyyy.MM.dd}",
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

Log.Information("Starting Identity API up");

try
{
    // Database
    builder.Services.AddDbContext<IdentityDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("DefaultConnectionString"),
            npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
                npgsqlOptions.MigrationsAssembly(typeof(IdentityDbContext).Assembly.FullName);
            }));

    // ASP.NET Core Identity
    builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedEmail = false; // set to true in production
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddEntityFrameworkStores<IdentityDbContext>()
    .AddDefaultTokenProviders();

    // JWT Configuration
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    builder.Services.Configure<JwtSettings>(jwtSettings);
    builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));

    var secret = jwtSettings["Secret"] ?? "YourSuperSecretKeyHere_MustBeAtLeast32Characters!";

    // OAuth settings
    var oauthSettings = builder.Configuration.GetSection("OAuthSettings");
    builder.Services.Configure<OAuthSettings>(oauthSettings);

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultSignInScheme = "ExternalCookies";
    })
    .AddCookie("ExternalCookies", options =>
    {
        options.Cookie.HttpOnly = true;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "distributed-ecommerce-platform",
            ValidAudience = jwtSettings["Audience"] ?? "distributed-ecommerce-client",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ClockSkew = TimeSpan.Zero
        };
    })
    .AddGoogle("Google", options =>
    {
        options.ClientId = oauthSettings["Google:ClientId"] ?? "";
        options.ClientSecret = oauthSettings["Google:ClientSecret"] ?? "";
        options.SignInScheme = "ExternalCookies";
    })
    .AddGitHub("GitHub", options =>
    {
        options.ClientId = oauthSettings["GitHub:ClientId"] ?? "";
        options.ClientSecret = oauthSettings["GitHub:ClientSecret"] ?? "";
        options.SignInScheme = "ExternalCookies";
        options.Scope.Add("user:email");
    });

    // Services
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<IIdentityEmailService, IdentityEmailService>();

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("CorsPolicy", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    // ForwardedHeaders (reverse proxy support for OAuth redirect_uri)
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor
                                 | ForwardedHeaders.XForwardedProto
                                 | ForwardedHeaders.XForwardedHost;
        options.KnownProxies.Clear();
        options.KnownNetworks.Clear();
    });

    // Health Checks
    builder.Services.AddHealthChecks()
        .AddNpgSql(
            builder.Configuration.GetConnectionString("DefaultConnectionString")!,
            name: "postgresql",
            tags: new[] { "db", "postgresql" });

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Identity API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    var app = builder.Build();

    // Auto-migrate & seed
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        // Use EnsureCreatedAsync since no EF migrations exist yet
        await context.Database.EnsureCreatedAsync();

        // Seed roles
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        string[] roles = { "Admin", "User" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
                Log.Information("Created role: {Role}", role);
            }
        }

        // Seed admin user
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var adminEmail = "admin@ecommerce.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var admin = new AppUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                IsAdmin = true
            };
            var result = await userManager.CreateAsync(admin, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
                Log.Information("Admin user seeded: {Email}", adminEmail);
            }
        }

        // Seed demo users (from MERN project)
        var demoUsers = new[]
        {
            new { Email = "demo@gmail.com", FirstName = "Demo", LastName = "User", Password = "Demo@123", Role = "User" },
            new { Email = "demo2@gmail.com", FirstName = "Rishi", LastName = "Bakshi", Password = "Demo@123", Role = "User" },
            new { Email = "john.doe@example.com", FirstName = "John", LastName = "Doe", Password = "User@123", Role = "User" },
            new { Email = "jane.smith@example.com", FirstName = "Jane", LastName = "Smith", Password = "User@123", Role = "User" },
            new { Email = "vietbmt19@gmail.com", FirstName = "Nguyen", LastName = "Viet", Password = "Admin@123", Role = "Admin" },
            new { Email = "alice.w@example.com", FirstName = "Alice", LastName = "Williams", Password = "User@123", Role = "User" },
            new { Email = "bob.martin@example.com", FirstName = "Bob", LastName = "Martin", Password = "User@123", Role = "User" },
            new { Email = "charlie.b@example.com", FirstName = "Charlie", LastName = "Brown", Password = "User@123", Role = "User" },
            new { Email = "emma.davis@example.com", FirstName = "Emma", LastName = "Davis", Password = "User@123", Role = "User" },
        };

        foreach (var demoUser in demoUsers)
        {
            if (await userManager.FindByEmailAsync(demoUser.Email) == null)
            {
                var user = new AppUser
                {
                    UserName = demoUser.Email,
                    Email = demoUser.Email,
                    FirstName = demoUser.FirstName,
                    LastName = demoUser.LastName,
                    EmailConfirmed = true,
                    IsAdmin = demoUser.Role == "Admin"
                };
                var result = await userManager.CreateAsync(user, demoUser.Password);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, demoUser.Role);
                    Log.Information("Demo user seeded: {Email}", demoUser.Email);
                }
            }
        }
    }

    // Configure pipeline
    app.UseForwardedHeaders();

    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseCors("CorsPolicy");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("Identity API started successfully");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Identity API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
