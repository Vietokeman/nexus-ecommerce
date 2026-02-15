# 📘 SECTION 13 — PayOS Payment Integration & Full Cart Flow: Detailed Implementation Guide

**Services:** Payment.API (Backend) + React.Client (Frontend)  
**Technologies:** PayOS SDK, .NET 8, RabbitMQ, Zustand, React, MUI  
**Backend Port:** 6007  
**Frontend Port:** 3000  
**Date:** February 15, 2026

---

## 📋 Table of Contents

1. [Payment Architecture Overview](#1-payment-architecture-overview)
2. [PayOS Configuration](#2-payos-configuration)
3. [Backend: Payment.API Microservice](#3-backend-paymentapi-microservice)
4. [Payment Events & RabbitMQ Integration](#4-payment-events--rabbitmq-integration)
5. [Frontend: React Client Setup (AURA-FE Style)](#5-frontend-react-client-setup)
6. [Frontend: Zustand Stores](#6-frontend-zustand-stores)
7. [Frontend: Cart & Checkout Flow](#7-frontend-cart--checkout-flow)
8. [Frontend: PayOS Payment Integration](#8-frontend-payos-payment-integration)
9. [Frontend: All Pages & Components](#9-frontend-all-pages--components)
10. [Ocelot Gateway Routes](#10-ocelot-gateway-routes)
11. [Docker Compose Configuration](#11-docker-compose-configuration)
12. [Testing Strategy](#12-testing-strategy)
13. [Implementation Tasks & Timeline](#13-implementation-tasks--timeline)

---

## 1. Payment Architecture Overview

### Complete Payment Flow

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              PAYMENT FLOW                                        │
│                                                                                  │
│  User                React Client           Ocelot GW          Payment.API       │
│   │                      │                     │                    │             │
│   │── Add to Cart ──────→│                     │                    │             │
│   │   (Zustand Store)    │                     │                    │             │
│   │                      │                     │                    │             │
│   │── Checkout ─────────→│                     │                    │             │
│   │                      │── POST /baskets ──→ │──→ Basket.API     │             │
│   │                      │   (sync cart)       │                    │             │
│   │                      │                     │                    │             │
│   │── Pay Now ──────────→│                     │                    │             │
│   │                      │── POST /payment/ ──→│── Proxy ─────────→│             │
│   │                      │   create            │                    │── PayOS SDK │
│   │                      │                     │                    │   Create    │
│   │                      │←── paymentUrl ─────│←── paymentUrl ────│   Link      │
│   │                      │                     │                    │             │
│   │←── Redirect to ─────│                     │                    │             │
│   │   PayOS page         │                     │                    │             │
│   │                      │                     │                    │             │
│   │── Pay on PayOS ─────→ PayOS ─── Webhook ──────────────────────→│             │
│   │                      │                     │                    │── Verify    │
│   │                      │                     │                    │── Update DB │
│   │                      │                     │                    │── Publish   │
│   │                      │                     │                    │   Event     │
│   │← Redirect ──────────│←── /payment/success │                    │             │
│   │                      │                     │          RabbitMQ  │             │
│   │                      │                     │        ┌──────────│             │
│   │                      │                     │        │          │             │
│   │                      │                     │        ▼          │             │
│   │                      │                     │   Ordering.API    │             │
│   │                      │                     │   (Update Status) │             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Payment Gateway | **PayOS** | Vietnamese payment gateway, sandbox available |
| Cart State | **Zustand + localStorage** | Offline persistence, instant UI updates |
| Server Cart | **Basket.API (Redis)** | Server-side validation, cross-device sync |
| Payment Status | **Webhook + Polling** | Webhook for real-time, polling as fallback |
| Event Bus | **RabbitMQ (MassTransit)** | Existing infra, reliable delivery |

---

## 2. PayOS Configuration

### From Trippio Project (appsettings.json)

```json
{
  "PayOS": {
    "ClientId": "change_me_with_payos_client_id",
    "ApiKey": "change_me_with_payos_api_key",
    "ChecksumKey": "change_me_with_payos_checksum_key",
    "WebReturnUrl": "http://localhost:3000/payment/success",
    "WebCancelUrl": "http://localhost:3000/payment/cancel",
    "MobileReturnUrl": "ecommerce://payment/success",
    "MobileCancelUrl": "ecommerce://payment/cancel",
    "WebhookUrl": "http://localhost:5000/api/payment/payos-callback"
  }
}
```

### PayOS SDK
```xml
<!-- NuGet -->
<PackageReference Include="Net.payOS" Version="1.0.*" />
```

---

## 3. Backend: Payment.API Microservice

### 3.1 Project Structure

```
src/Services/Payment.API/
├── Payment.API.csproj
├── Program.cs
├── Dockerfile
├── appsettings.json
├── appsettings.Development.json
│
├── Configuration/
│   └── PayOSSettings.cs
│
├── Controllers/
│   └── PaymentController.cs
│
├── DTOs/
│   ├── CreatePaymentRequest.cs
│   ├── PaymentResponse.cs
│   ├── PaymentStatusResponse.cs
│   └── PayOSWebhookPayload.cs
│
├── Entities/
│   ├── PaymentTransaction.cs
│   └── PaymentStatus.cs
│
├── Persistence/
│   ├── PaymentDbContext.cs
│   └── Migrations/
│
├── Repositories/
│   ├── Interfaces/
│   │   └── IPaymentRepository.cs
│   └── PaymentRepository.cs
│
├── Services/
│   ├── Interfaces/
│   │   └── IPaymentService.cs
│   └── PaymentService.cs
│
└── Extensions/
    └── ServiceExtensions.cs
```

### 3.2 Entities

```csharp
// Entities/PaymentTransaction.cs
namespace Payment.API.Entities;

public class PaymentTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public long OrderCode { get; set; }           // PayOS order code (unique bigint)
    public string OrderNo { get; set; } = string.Empty;  // Our order reference
    public string UserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "VND";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? PaymentUrl { get; set; }
    public string? PayOSTransactionId { get; set; }
    public string? PaymentMethod { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public string? WebhookData { get; set; }      // Raw webhook JSON for audit
}

public enum PaymentStatus
{
    Pending = 0,
    Processing = 1,
    Paid = 2,
    Cancelled = 3,
    Failed = 4,
    Refunded = 5
}
```

### 3.3 DTOs

```csharp
// DTOs/CreatePaymentRequest.cs
public record CreatePaymentRequest
{
    public string OrderNo { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Description { get; init; } = string.Empty;
    public string? BuyerName { get; init; }
    public string? BuyerEmail { get; init; }
    public string? BuyerPhone { get; init; }
    public List<PaymentItem> Items { get; init; } = new();
    public string ReturnUrl { get; init; } = string.Empty;
    public string CancelUrl { get; init; } = string.Empty;
}

public record PaymentItem
{
    public string Name { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public int Price { get; init; }  // PayOS uses int (VND)
}

// DTOs/PaymentResponse.cs
public record PaymentResponse
{
    public string OrderNo { get; init; } = string.Empty;
    public long OrderCode { get; init; }
    public string PaymentUrl { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}

// DTOs/PaymentStatusResponse.cs
public record PaymentStatusResponse
{
    public string OrderNo { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public DateTime? PaidAt { get; init; }
    public string? PaymentMethod { get; init; }
}
```

### 3.4 PayOS Service Implementation

```csharp
// Services/PaymentService.cs
using Net.payOS;
using Net.payOS.Types;
using Payment.API.Configuration;
using Payment.API.DTOs;
using Payment.API.Entities;
using Payment.API.Repositories.Interfaces;
using Microsoft.Extensions.Options;

namespace Payment.API.Services;

public class PaymentService : IPaymentService
{
    private readonly PayOS _payOS;
    private readonly PayOSSettings _settings;
    private readonly IPaymentRepository _repository;
    private readonly ILogger<PaymentService> _logger;
    private readonly IMessageProducer _messageProducer;  // from BuildingBlocks

    public PaymentService(
        IOptions<PayOSSettings> settings,
        IPaymentRepository repository,
        ILogger<PaymentService> logger,
        IMessageProducer messageProducer)
    {
        _settings = settings.Value;
        _repository = repository;
        _logger = logger;
        _messageProducer = messageProducer;
        _payOS = new PayOS(_settings.ClientId, _settings.ApiKey, _settings.ChecksumKey);
    }

    public async Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request, string userId)
    {
        // Generate unique order code for PayOS (must be unique bigint)
        var orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // Map items to PayOS format
        var items = request.Items.Select(i => new ItemData(i.Name, i.Quantity, i.Price)).ToList();

        // Create PayOS payment link
        var paymentData = new PaymentData(
            orderCode: orderCode,
            amount: (int)request.Amount,  // PayOS uses int for VND
            description: request.Description,
            items: items,
            cancelUrl: request.CancelUrl ?? _settings.WebCancelUrl,
            returnUrl: request.ReturnUrl ?? _settings.WebReturnUrl,
            buyerName: request.BuyerName,
            buyerEmail: request.BuyerEmail,
            buyerPhone: request.BuyerPhone
        );

        var createPaymentResult = await _payOS.createPaymentLink(paymentData);

        // Save transaction to DB
        var transaction = new PaymentTransaction
        {
            OrderCode = orderCode,
            OrderNo = request.OrderNo,
            UserId = userId,
            Amount = request.Amount,
            Status = PaymentStatus.Pending,
            PaymentUrl = createPaymentResult.checkoutUrl,
            Description = request.Description
        };

        await _repository.CreateAsync(transaction);

        _logger.LogInformation(
            "Payment link created for Order {OrderNo}, PayOS OrderCode: {OrderCode}, URL: {Url}",
            request.OrderNo, orderCode, createPaymentResult.checkoutUrl);

        return new PaymentResponse
        {
            OrderNo = request.OrderNo,
            OrderCode = orderCode,
            PaymentUrl = createPaymentResult.checkoutUrl,
            Status = "Pending"
        };
    }

    public async Task<PaymentStatusResponse?> GetPaymentStatusAsync(string orderNo)
    {
        var transaction = await _repository.GetByOrderNoAsync(orderNo);
        if (transaction == null) return null;

        // Also check PayOS for latest status
        try
        {
            var payosInfo = await _payOS.getPaymentLinkInformation(transaction.OrderCode);
            if (payosInfo.status == "PAID" && transaction.Status != PaymentStatus.Paid)
            {
                transaction.Status = PaymentStatus.Paid;
                transaction.PaidAt = DateTime.UtcNow;
                await _repository.UpdateAsync(transaction);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check PayOS status for {OrderNo}", orderNo);
        }

        return new PaymentStatusResponse
        {
            OrderNo = transaction.OrderNo,
            Status = transaction.Status.ToString(),
            Amount = transaction.Amount,
            PaidAt = transaction.PaidAt,
            PaymentMethod = transaction.PaymentMethod
        };
    }

    public async Task HandleWebhookAsync(WebhookType webhookData)
    {
        // Verify webhook signature
        var verifiedData = _payOS.verifyPaymentWebhookData(webhookData);

        _logger.LogInformation(
            "PayOS Webhook received: OrderCode={OrderCode}, Status={Status}",
            verifiedData.orderCode, verifiedData.code);

        var transaction = await _repository.GetByOrderCodeAsync(verifiedData.orderCode);
        if (transaction == null)
        {
            _logger.LogWarning("Transaction not found for OrderCode {OrderCode}", verifiedData.orderCode);
            return;
        }

        // Update status based on webhook
        if (verifiedData.code == "00")  // Success
        {
            transaction.Status = PaymentStatus.Paid;
            transaction.PaidAt = DateTime.UtcNow;
            transaction.PayOSTransactionId = verifiedData.transactionDateTime;
            transaction.WebhookData = System.Text.Json.JsonSerializer.Serialize(verifiedData);

            // Publish PaymentCompletedEvent to RabbitMQ
            await _messageProducer.PublishAsync(new PaymentCompletedEvent
            {
                OrderNo = transaction.OrderNo,
                Amount = transaction.Amount,
                PaidAt = transaction.PaidAt.Value,
                PaymentMethod = "PayOS",
                TransactionId = transaction.OrderCode.ToString()
            });

            _logger.LogInformation("Payment completed for Order {OrderNo}", transaction.OrderNo);
        }
        else  // Failed or cancelled
        {
            transaction.Status = PaymentStatus.Failed;
            transaction.CancellationReason = $"PayOS code: {verifiedData.code}";
        }

        await _repository.UpdateAsync(transaction);
    }

    public async Task<bool> CancelPaymentAsync(string orderNo, string userId)
    {
        var transaction = await _repository.GetByOrderNoAsync(orderNo);
        if (transaction == null || transaction.UserId != userId) return false;
        if (transaction.Status != PaymentStatus.Pending) return false;

        try
        {
            await _payOS.cancelPaymentLink(transaction.OrderCode);
            transaction.Status = PaymentStatus.Cancelled;
            transaction.CancelledAt = DateTime.UtcNow;
            await _repository.UpdateAsync(transaction);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cancel payment for {OrderNo}", orderNo);
            return false;
        }
    }
}
```

### 3.5 Payment Controller

```csharp
// Controllers/PaymentController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Payment.API.DTOs;
using Payment.API.Services.Interfaces;
using System.Security.Claims;
using Net.payOS.Types;

namespace Payment.API.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>Create a PayOS payment link for an order</summary>
    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _paymentService.CreatePaymentAsync(request, userId);
        return Ok(result);
    }

    /// <summary>Get payment status for an order</summary>
    [HttpGet("{orderNo}/status")]
    [Authorize]
    public async Task<IActionResult> GetPaymentStatus(string orderNo)
    {
        var result = await _paymentService.GetPaymentStatusAsync(orderNo);
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>PayOS webhook callback — no auth required</summary>
    [HttpPost("payos-callback")]
    public async Task<IActionResult> PayOSCallback([FromBody] WebhookType webhookData)
    {
        _logger.LogInformation("PayOS webhook received");
        await _paymentService.HandleWebhookAsync(webhookData);
        return Ok();
    }

    /// <summary>Cancel a pending payment</summary>
    [HttpPost("cancel/{orderNo}")]
    [Authorize]
    public async Task<IActionResult> CancelPayment(string orderNo)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _paymentService.CancelPaymentAsync(orderNo, userId);
        return result ? Ok() : BadRequest(new { message = "Cannot cancel this payment" });
    }
}
```

### 3.6 Program.cs

```csharp
using Serilog;
using Payment.API.Configuration;
using Payment.API.Repositories;
using Payment.API.Repositories.Interfaces;
using Payment.API.Services;
using Payment.API.Services.Interfaces;
using Payment.API.Persistence;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Common;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "Payment.API")
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new Serilog.Sinks.Elasticsearch.ElasticsearchSinkOptions(
        new Uri(builder.Configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "payment-api-logs-{0:yyyy.MM.dd}"
    })
    .CreateLogger();
builder.Host.UseSerilog();

// Database
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionString")));

// PayOS
builder.Services.Configure<PayOSSettings>(builder.Configuration.GetSection("PayOS"));

// JWT Authentication (shared extension)
builder.Services.AddJwtAuthentication(builder.Configuration);

// Services
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// MassTransit (RabbitMQ)
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["EventBusSettings:HostAddress"]);
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionString")!,
        name: "SQLServer-PaymentDb", tags: new[] { "db" })
    .AddRabbitMQ(builder.Configuration["EventBusSettings:HostAddress"]!,
        name: "RabbitMQ", tags: new[] { "messaging" });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
    options.AddPolicy("CorsPolicy", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

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

// Auto-migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
    await db.Database.MigrateAsync();
}

app.Run();
```

---

## 4. Payment Events & RabbitMQ Integration

### 4.1 New Event Types

```csharp
// EventBus.Messages/Events/PaymentCompletedEvent.cs
namespace EventBus.Messages.Events;

public record PaymentCompletedEvent : IntegrationBaseEvent
{
    public string OrderNo { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public DateTime PaidAt { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string TransactionId { get; init; } = string.Empty;
}

// EventBus.Messages/Events/PaymentFailedEvent.cs
public record PaymentFailedEvent : IntegrationBaseEvent
{
    public string OrderNo { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
}
```

### 4.2 Consumer in Ordering.API

```csharp
// Ordering.API — add MassTransit consumer
public class PaymentCompletedConsumer : IConsumer<PaymentCompletedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<PaymentCompletedConsumer> _logger;

    public PaymentCompletedConsumer(IMediator mediator, ILogger<PaymentCompletedConsumer> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentCompletedEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation("Payment completed for Order {OrderNo}, Amount: {Amount}",
            message.OrderNo, message.Amount);

        // Update order status to Paid
        await _mediator.Send(new UpdateOrderStatusCommand
        {
            OrderNo = message.OrderNo,
            NewStatus = OrderStatus.Paid,
            PaymentTransactionId = message.TransactionId
        });
    }
}
```

---

## 5. Frontend: React Client Setup (AURA-FE Style)

### 5.1 Project Initialization

```bash
# Delete old Angular client
rm -rf src/WebApps/Angular.Client

# Create new React client
cd src/WebApps
npm create vite@latest React.Client -- --template react-swc-ts
cd React.Client
```

### 5.2 package.json (Full)

```json
{
  "name": "ecommerce-react-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "commit": "git-cz",
    "release": "standard-version",
    "prepare": "husky"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.12.0",
    "@mui/material": "^5.16.0",
    "@mui/icons-material": "^5.16.0",
    "@emotion/react": "^11.13.0",
    "@emotion/styled": "^11.13.0",
    "zustand": "^5.0.6",
    "@tanstack/react-query": "^5.81.5",
    "axios": "^1.13.5",
    "react-hook-form": "^7.59.0",
    "@hookform/resolvers": "^3.9.0",
    "yup": "^1.6.1",
    "framer-motion": "^12.29.2",
    "lottie-react": "^2.4.0",
    "react-toastify": "^10.0.0",
    "react-swipeable-views": "^0.14.0",
    "react-swipeable-views-utils": "^0.14.0",
    "react-error-boundary": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@types/react-swipeable-views": "^0.13.5",
    "@vitejs/plugin-react-swc": "^4.2.0",
    "vite": "^7.0.2",
    "typescript": "^5.8.3",
    "@tailwindcss/vite": "^4.1.18",
    "tailwindcss": "^4.1.18",
    "postcss": "^8.5.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.20.0",
    "@eslint/js": "^9.20.0",
    "typescript-eslint": "^8.25.0",
    "eslint-plugin-react": "^7.37.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "eslint-config-prettier": "^10.1.0",
    "eslint-plugin-simple-import-sort": "^12.1.0",
    "eslint-plugin-unused-imports": "^4.4.0",
    "prettier": "^3.6.0",
    "husky": "^9.1.0",
    "lint-staged": "^16.0.0",
    "@commitlint/cli": "^19.6.0",
    "@commitlint/config-conventional": "^19.6.0",
    "commitizen": "^4.3.0",
    "cz-conventional-changelog": "^3.3.0",
    "standard-version": "^9.5.0",
    "jest": "^30.0.0",
    "@jest/globals": "^30.0.0",
    "ts-jest": "^29.3.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.0",
    "jest-environment-jsdom": "^30.0.0",
    "rollup-plugin-visualizer": "^5.14.0",
    "vite-plugin-compression": "^0.5.1",
    "sass": "^1.85.0"
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix --no-warn-ignored",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

### 5.3 vite.config.mjs

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({
      algorithm: 'gzip',
      threshold: 10240,
    }),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Ocelot Gateway
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
          vendor: ['axios', 'framer-motion', 'lottie-react'],
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
```

### 5.4 Folder Structure

```
src/
├── main.tsx                           # ReactDOM.createRoot entry
├── App.tsx                            # AppProvider → ErrorBoundary → Router
├── provider.tsx                       # QueryClientProvider + ThemeProvider
├── vite-env.d.ts
│
├── assets/
│   ├── animations/
│   │   ├── ecommerceOutlook.json      ← from mern-ecommerce
│   │   ├── shoppingBag.json
│   │   ├── orderSuccess.json
│   │   ├── noOrders.json
│   │   ├── emptyWishlist.json
│   │   ├── notFoundPage.json
│   │   └── loading.json
│   └── images/
│       ├── banner1.jpg ... banner4.jpg
│       ├── googlePlay.png
│       ├── appStore.png
│       ├── QRCode.png
│       └── social icons...
│
├── components/
│   ├── layouts/
│   │   ├── RootLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── ui/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Spinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── ErrorFallback.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductBanner.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductList.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CartBadge.tsx
│   ├── checkout/
│   │   ├── AddressForm.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   └── OrderSummary.tsx
│   └── reviews/
│       └── Reviews.tsx
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-cart.ts
│   ├── use-debounce.ts
│   └── use-media-query.ts
│
├── lib/
│   ├── api.ts                          # Axios instance → Ocelot Gateway
│   ├── endpoints.ts                    # All API endpoint constants
│   ├── react-query.ts                  # QueryClient config
│   ├── config.ts                       # Environment config
│   ├── helper.ts                       # Utility functions
│   └── local-storage.ts               # localStorage helpers
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── OtpVerificationPage.tsx
│   ├── products/
│   │   ├── HomePage.tsx
│   │   └── ProductDetailsPage.tsx
│   ├── cart/
│   │   ├── CartPage.tsx
│   │   └── CheckoutPage.tsx
│   ├── payment/
│   │   ├── PaymentPage.tsx
│   │   ├── PaymentSuccessPage.tsx
│   │   └── PaymentCancelPage.tsx
│   ├── orders/
│   │   ├── OrderSuccessPage.tsx
│   │   └── UserOrdersPage.tsx
│   ├── user/
│   │   ├── UserProfilePage.tsx
│   │   └── WishlistPage.tsx
│   ├── admin/
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AddProductPage.tsx
│   │   ├── ProductUpdatePage.tsx
│   │   └── AdminOrdersPage.tsx
│   └── NotFoundPage.tsx
│
├── routes/
│   └── index.tsx                       # All routes with lazy loading
│
├── store/
│   ├── auth-store.ts
│   ├── cart-store.ts
│   ├── wishlist-store.ts
│   ├── product-store.ts
│   ├── ui-store.ts
│   └── logger.ts                       # Zustand logger middleware
│
├── styles/
│   ├── index.css                       # Global styles + Tailwind
│   └── animations.css
│
├── theme/
│   └── theme.ts                        # MUI theme (mern-ecommerce clone)
│
└── types/
    ├── product.ts
    ├── customer.ts
    ├── basket.ts
    ├── order.ts
    ├── payment.ts
    ├── auth.ts
    └── api.ts
```

---

## 6. Frontend: Zustand Stores

### 6.1 Logger Middleware (from AURA-FE)

```typescript
// store/logger.ts
import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string
) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    const prev = get();
    set(...args);
    const next = get();
    if (import.meta.env.DEV) {
      console.groupCollapsed(`%c[${name ?? 'store'}]`, 'color: #7B68EE; font-weight: bold');
      console.log('prev:', prev);
      console.log('next:', next);
      console.groupEnd();
    }
  };
  return f(loggedSet, get, store);
};

export const logger = loggerImpl as Logger;
```

### 6.2 Auth Store

```typescript
// store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from './logger';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    logger(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,

        login: async (email, password) => {
          set({ isLoading: true });
          try {
            const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
            set({
              user: data.user,
              token: data.accessToken,
              refreshToken: data.refreshToken,
              isAuthenticated: true,
              isAdmin: data.user.role === 'Admin',
              isLoading: false,
            });
          } catch {
            set({ isLoading: false });
            throw new Error('Invalid credentials');
          }
        },

        register: async (data) => {
          set({ isLoading: true });
          try {
            await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
            set({ isLoading: false });
          } catch {
            set({ isLoading: false });
            throw new Error('Registration failed');
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isAdmin: false,
          });
        },

        setUser: (user) => set({ user, isAdmin: user.role === 'Admin' }),

        checkAuth: () => {
          const { token } = get();
          if (!token) {
            set({ isAuthenticated: false });
            return;
          }
          // Check token expiration
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
              get().logout();
            }
          } catch {
            get().logout();
          }
        },
      }),
      'auth-store'
    ),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
```

### 6.3 Cart Store

```typescript
// store/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from './logger';

const SHIPPING = 5.55;
const TAXES = 5; // percentage

interface CartItem {
  itemNo: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemNo: string) => void;
  updateQuantity: (itemNo: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed (as functions)
  totalItems: () => number;
  subtotal: () => number;
  shipping: () => number;
  taxAmount: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    logger(
      (set, get) => ({
        items: [],

        addItem: (item) => {
          set((state) => {
            const existing = state.items.find((i) => i.itemNo === item.itemNo);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.itemNo === item.itemNo ? { ...i, quantity: i.quantity + 1 } : i
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
          });
        },

        removeItem: (itemNo) => {
          set((state) => ({
            items: state.items.filter((i) => i.itemNo !== itemNo),
          }));
        },

        updateQuantity: (itemNo, quantity) => {
          if (quantity <= 0) {
            get().removeItem(itemNo);
            return;
          }
          set((state) => ({
            items: state.items.map((i) =>
              i.itemNo === itemNo ? { ...i, quantity } : i
            ),
          }));
        },

        clearCart: () => set({ items: [] }),

        totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        shipping: () => (get().items.length > 0 ? SHIPPING : 0),
        taxAmount: () => (get().subtotal() * TAXES) / 100,
        total: () => get().subtotal() + get().shipping() + get().taxAmount(),
      }),
      'cart-store'
    ),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
```

### 6.4 Wishlist Store

```typescript
// store/wishlist-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from './logger';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    logger(
      (set, get) => ({
        items: [],

        addItem: (item) => {
          set((state) => {
            if (state.items.find((i) => i.id === item.id)) return state;
            return { items: [...state.items, item] };
          });
        },

        removeItem: (id) => {
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
          }));
        },

        isInWishlist: (id) => get().items.some((i) => i.id === id),

        toggleItem: (item) => {
          if (get().isInWishlist(item.id)) {
            get().removeItem(item.id);
          } else {
            get().addItem(item);
          }
        },
      }),
      'wishlist-store'
    ),
    {
      name: 'wishlist-storage',
    }
  )
);
```

### 6.5 UI Store

```typescript
// store/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from './logger';

interface UIState {
  isFilterOpen: boolean;
  isMobileMenuOpen: boolean;
  toggleFilter: () => void;
  toggleMobileMenu: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    logger(
      (set) => ({
        isFilterOpen: false,
        isMobileMenuOpen: false,
        toggleFilter: () => set((s) => ({ isFilterOpen: !s.isFilterOpen })),
        toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
        closeAll: () => set({ isFilterOpen: false, isMobileMenuOpen: false }),
      }),
      'ui-store'
    ),
    { name: 'ui-storage' }
  )
);
```

---

## 7. Frontend: Cart & Checkout Flow

### 7.1 API Endpoints

```typescript
// lib/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh-token',
    ME: '/api/auth/me',
    CONFIRM_EMAIL: '/api/auth/confirm-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string) => `/api/products/${id}`,
    SEARCH: (productNo: string) => `/api/products/get-product-by-no/${productNo}`,
  },
  CUSTOMERS: {
    LIST: '/api/customers',
    DETAIL: (username: string) => `/api/customer/${username}`,
  },
  BASKETS: {
    GET: (username: string) => `/api/baskets/${username}`,
    UPDATE: '/api/baskets',
    DELETE: (username: string) => `/api/baskets/${username}`,
    CHECKOUT: '/api/baskets/checkout',
    STOCK: (itemNo: string) => `/api/baskets/stock/${itemNo}`,
  },
  ORDERS: {
    LIST: '/api/v1/orders',
    BY_USER: (username: string) => `/api/v1/orders/${username}`,
    CREATE: '/api/v1/orders',
    UPDATE: (id: string) => `/api/v1/orders/${id}`,
    DELETE: (id: string) => `/api/v1/orders/${id}`,
  },
  INVENTORY: {
    LIST: '/api/inventory',
    STOCK: (itemNo: string) => `/api/inventory/stock/${itemNo}`,
  },
  PAYMENT: {
    CREATE: '/api/payment/create',
    STATUS: (orderNo: string) => `/api/payment/${orderNo}/status`,
    CANCEL: (orderNo: string) => `/api/payment/cancel/${orderNo}`,
  },
  PERMISSIONS: {
    LIST: '/api/permissions',
    BY_ROLE: (roleId: string) => `/api/permissions/role/${roleId}`,
    ASSIGN: (roleId: string) => `/api/permissions/role/${roleId}/assign`,
  },
} as const;
```

### 7.2 Checkout Flow (Step-by-Step)

```
1. User adds items to cart (Zustand → localStorage)
2. User clicks "Checkout" on CartPage
3. Navigate to CheckoutPage
4. CheckoutPage:
   a. Display OrderSummary with cart items
   b. AddressForm (react-hook-form + Yup validation)
   c. PaymentMethodSelector: "PayOS" or "COD"
   d. User clicks "Place Order"
5. API calls:
   a. POST /api/baskets (sync cart to server)
   b. POST /api/baskets/checkout (create order)
   c. If PayOS selected: POST /api/payment/create → get paymentUrl
   d. Redirect to PayOS payment page
6. After payment:
   a. PayOS redirects to /payment/success?orderCode=xxx
   b. GET /api/payment/{orderNo}/status to confirm
   c. Display OrderSuccessPage with Lottie animation
   d. Clear cart (Zustand + localStorage)
```

---

## 8. Frontend: PayOS Payment Integration

### 8.1 Payment Service

```typescript
// lib/payment.ts
import { api } from './api';
import { API_ENDPOINTS } from './endpoints';

export interface CreatePaymentData {
  orderNo: string;
  amount: number;
  description: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  items: { name: string; quantity: number; price: number }[];
  returnUrl?: string;
  cancelUrl?: string;
}

export const paymentService = {
  createPayment: async (data: CreatePaymentData) => {
    const response = await api.post(API_ENDPOINTS.PAYMENT.CREATE, {
      ...data,
      returnUrl: data.returnUrl || `${window.location.origin}/payment/success`,
      cancelUrl: data.cancelUrl || `${window.location.origin}/payment/cancel`,
    });
    return response.data;
  },

  getStatus: async (orderNo: string) => {
    const response = await api.get(API_ENDPOINTS.PAYMENT.STATUS(orderNo));
    return response.data;
  },

  cancelPayment: async (orderNo: string) => {
    const response = await api.post(API_ENDPOINTS.PAYMENT.CANCEL(orderNo));
    return response.data;
  },
};
```

### 8.2 Payment Success Page

```typescript
// pages/payment/PaymentSuccessPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import Lottie from 'lottie-react';
import orderSuccessAnimation from '@/assets/animations/orderSuccess.json';
import { paymentService } from '@/lib/payment';
import { useCartStore } from '@/store/cart-store';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);
  const [status, setStatus] = useState<string>('loading');
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (orderCode) {
      paymentService.getStatus(orderCode).then((data) => {
        setStatus(data.status);
        if (data.status === 'Paid') {
          clearCart();
        }
      }).catch(() => setStatus('error'));
    }
  }, [orderCode, clearCart]);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" py={6}>
      <Lottie animationData={orderSuccessAnimation} style={{ width: 300, height: 300 }} loop={false} />
      <Typography variant="h4" fontWeight="bold" mt={2}>
        Payment Successful!
      </Typography>
      <Typography variant="body1" color="text.secondary" mt={1}>
        Your order has been placed successfully.
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        Order Code: {orderCode}
      </Typography>
      <Box mt={4} display="flex" gap={2}>
        <Button variant="contained" onClick={() => navigate('/orders')}>
          View Orders
        </Button>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Box>
    </Box>
  );
}
```

---

## 9. Frontend: All Pages & Components

### 9.1 MUI Theme (Clone mern-ecommerce)

```typescript
// theme/theme.ts
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      light: '#ffffff',
      dark: '#DB4444',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          backgroundColor: '#000000',
          '&:hover': { backgroundColor: '#333333' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);
export default theme;
```

### 9.2 Lottie Animations (Copy from mern-ecommerce)

Copy these files from `d:\ki9-lastdancefpt\UI\mern-ecommerce-main\frontend\src\assets\animations\`:
- `ecommerceOutlook.json`
- `shoppingBag.json`
- `orderSuccess.json`
- `noOrders.json`
- `emptyWishlist.json`
- `notFoundPage.json`
- `loading.json`

### 9.3 Routes Configuration

```typescript
// routes/index.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import AdminRoute from '@/components/ui/AdminRoute';
import RootLayout from '@/components/layouts/RootLayout';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const OtpVerificationPage = lazy(() => import('@/pages/auth/OtpVerificationPage'));
const HomePage = lazy(() => import('@/pages/products/HomePage'));
const ProductDetailsPage = lazy(() => import('@/pages/products/ProductDetailsPage'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/cart/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('@/pages/payment/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('@/pages/payment/PaymentCancelPage'));
const OrderSuccessPage = lazy(() => import('@/pages/orders/OrderSuccessPage'));
const UserOrdersPage = lazy(() => import('@/pages/orders/UserOrdersPage'));
const UserProfilePage = lazy(() => import('@/pages/user/UserProfilePage'));
const WishlistPage = lazy(() => import('@/pages/user/WishlistPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AddProductPage = lazy(() => import('@/pages/admin/AddProductPage'));
const ProductUpdatePage = lazy(() => import('@/pages/admin/ProductUpdatePage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <Suspense fallback={<Spinner />}><LoginPage /></Suspense> },
  { path: '/signup', element: <Suspense fallback={<Spinner />}><SignupPage /></Suspense> },
  { path: '/forgot-password', element: <Suspense fallback={<Spinner />}><ForgotPasswordPage /></Suspense> },
  { path: '/reset-password/:userId/:token', element: <Suspense fallback={<Spinner />}><ResetPasswordPage /></Suspense> },
  { path: '/verify-otp', element: <Suspense fallback={<Spinner />}><OtpVerificationPage /></Suspense> },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: '/', element: <Suspense fallback={<Spinner />}><HomePage /></Suspense> },
          { path: '/product-details/:id', element: <Suspense fallback={<Spinner />}><ProductDetailsPage /></Suspense> },
          { path: '/cart', element: <Suspense fallback={<Spinner />}><CartPage /></Suspense> },
          { path: '/checkout', element: <Suspense fallback={<Spinner />}><CheckoutPage /></Suspense> },
          { path: '/payment/success', element: <Suspense fallback={<Spinner />}><PaymentSuccessPage /></Suspense> },
          { path: '/payment/cancel', element: <Suspense fallback={<Spinner />}><PaymentCancelPage /></Suspense> },
          { path: '/order-success/:id', element: <Suspense fallback={<Spinner />}><OrderSuccessPage /></Suspense> },
          { path: '/orders', element: <Suspense fallback={<Spinner />}><UserOrdersPage /></Suspense> },
          { path: '/profile', element: <Suspense fallback={<Spinner />}><UserProfilePage /></Suspense> },
          { path: '/wishlist', element: <Suspense fallback={<Spinner />}><WishlistPage /></Suspense> },
        ],
      },
    ],
  },

  // Admin routes
  {
    element: <AdminRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: '/admin/dashboard', element: <Suspense fallback={<Spinner />}><AdminDashboardPage /></Suspense> },
          { path: '/admin/add-product', element: <Suspense fallback={<Spinner />}><AddProductPage /></Suspense> },
          { path: '/admin/product-update/:id', element: <Suspense fallback={<Spinner />}><ProductUpdatePage /></Suspense> },
          { path: '/admin/orders', element: <Suspense fallback={<Spinner />}><AdminOrdersPage /></Suspense> },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <Suspense fallback={<Spinner />}><NotFoundPage /></Suspense> },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
```

---

## 10. Ocelot Gateway Routes

Add to `ocelot.json`:

```json
{
  "DownstreamPathTemplate": "/api/payment/{everything}",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "payment.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/payment/{everything}",
  "UpstreamHttpMethod": ["GET", "POST"],
  "RateLimitOptions": {
    "EnableRateLimiting": true,
    "Period": "1s",
    "PeriodTimespan": 1,
    "Limit": 5
  },
  "QoSOptions": {
    "ExceptionsAllowedBeforeBreaking": 2,
    "DurationOfBreak": 5000,
    "TimeoutValue": 30000
  }
}
```

Note: The `/api/payment/payos-callback` webhook route should NOT require authentication. Configure Ocelot:

```json
{
  "DownstreamPathTemplate": "/api/payment/payos-callback",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [{ "Host": "payment.api", "Port": 80 }],
  "UpstreamPathTemplate": "/api/payment/payos-callback",
  "UpstreamHttpMethod": ["POST"],
  "RateLimitOptions": {
    "EnableRateLimiting": true,
    "Period": "1s",
    "Limit": 20
  }
}
```

---

## 11. Docker Compose Configuration

### docker-compose.yml

```yaml
payment.api:
  image: ${DOCKER_REGISTRY-}payment-api:${PLATFORM:-linux}-${TAG:-latest}
  build:
    context: .
    dockerfile: Services/Payment.API/Dockerfile

react.client:
  image: ${DOCKER_REGISTRY-}react-client:${PLATFORM:-linux}-${TAG:-latest}
  build:
    context: .
    dockerfile: WebApps/React.Client/Dockerfile
```

### docker-compose.override.yml

```yaml
payment.api:
  container_name: payment.api
  environment:
    - ASPNETCORE_ENVIRONMENT=Development
    - ASPNETCORE_URLS=http://+:80
    - "ConnectionStrings:DefaultConnectionString=Server=orderdb;Database=PaymentDb;User Id=sa;Password=Passw0rd!;Encrypt=False;TrustServerCertificate=True"
    - "ElasticConfiguration:Uri=http://elasticsearch:9200"
    - "EventBusSettings:HostAddress=amqp://guest:guest@rabbitmq:5672"
    - "PayOS:ClientId=change_me_with_payos_client_id"
    - "PayOS:ApiKey=change_me_with_payos_api_key"
    - "PayOS:ChecksumKey=change_me_with_payos_checksum_key"
    - "PayOS:WebReturnUrl=http://localhost:3000/payment/success"
    - "PayOS:WebCancelUrl=http://localhost:3000/payment/cancel"
    - "JwtTokenSettings:Key=bXlfc2VjdXJlX2p3dF9rZXlfMTI4IQ=="
    - "JwtTokenSettings:Issuer=distributed-ecommerce-platform"
  depends_on:
    - orderdb
    - rabbitmq
    - elasticsearch
  ports:
    - "6007:80"
  restart: always

react.client:
  container_name: react.client
  environment:
    - VITE_API_BASE_URL=http://ocelot.apigw:80
  depends_on:
    - ocelot.apigw
  ports:
    - "3000:80"
  restart: always
```

### React Client Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY WebApps/React.Client/package*.json ./
RUN npm ci
COPY WebApps/React.Client/ .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY WebApps/React.Client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf (for SPA routing)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://ocelot.apigw:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 12. Testing Strategy

### 12.1 Backend Tests

| Test | Type | Description |
|------|------|-------------|
| PaymentService.CreatePayment | Unit | Mock PayOS SDK, verify transaction saved |
| PaymentService.HandleWebhook | Unit | Mock webhook data, verify status update |
| PaymentController (integration) | Integration | Full payment flow via HTTP |
| PayOS webhook verification | Integration | Verify checksum validation |
| RabbitMQ event publishing | Integration | Verify PaymentCompletedEvent published |

### 12.2 Frontend Tests

| Test | Type | Description |
|------|------|-------------|
| cart-store | Unit (Jest) | Add/remove/update items, computed values |
| auth-store | Unit (Jest) | Login/logout, token management |
| wishlist-store | Unit (Jest) | Toggle, persistence |
| CartPage | Component | Render items, quantity controls |
| CheckoutPage | Component | Form validation, submission |
| PaymentSuccessPage | Component | Status check, cart clear |
| API service layer | Unit | Mock axios, verify endpoints |

### 12.3 E2E Flow

```
1. Login → JWT token received
2. Browse products → Product list loads
3. Add to cart → Cart badge updates
4. Go to cart → Items displayed correctly
5. Checkout → Address form, payment method
6. Pay with PayOS → Redirect to PayOS sandbox
7. Complete payment → Webhook received
8. Redirect to success → Cart cleared, order confirmed
9. View orders → New order visible
```

---

## 13. Implementation Tasks & Timeline

| # | Task | Effort | Priority | Phase |
|---|------|--------|----------|-------|
| **Backend** | | | | |
| 1 | Create Payment.API project structure | 1h | CRITICAL | Setup |
| 2 | Install NuGet packages (PayOS, EF, MassTransit) | 30m | CRITICAL | Setup |
| 3 | Create entities (PaymentTransaction, PaymentStatus) | 1h | CRITICAL | Domain |
| 4 | Create DTOs | 30m | HIGH | Domain |
| 5 | Create PaymentDbContext + migration | 1h | CRITICAL | Data |
| 6 | Implement PaymentRepository | 1h | HIGH | Data |
| 7 | Implement PaymentService (PayOS SDK) | 3h | CRITICAL | Service |
| 8 | Create PaymentController | 1h | CRITICAL | API |
| 9 | Add PaymentCompletedEvent to EventBus | 30m | HIGH | Events |
| 10 | Add PaymentCompletedConsumer to Ordering.API | 1h | HIGH | Events |
| 11 | Configure Program.cs (Serilog, MassTransit, JWT) | 1h | HIGH | Config |
| 12 | Create Dockerfile | 30m | HIGH | Docker |
| 13 | Add to docker-compose | 30m | HIGH | Docker |
| 14 | Add routes to Ocelot | 30m | HIGH | Gateway |
| **Frontend** | | | | |
| 15 | Initialize React + Vite + TypeScript project | 1h | CRITICAL | Setup |
| 16 | Configure tooling (ESLint, Prettier, Husky, commitlint) | 2h | HIGH | Setup |
| 17 | Setup MUI theme (clone mern-ecommerce) | 1h | HIGH | UI |
| 18 | Copy Lottie animations from mern-ecommerce | 30m | MEDIUM | Assets |
| 19 | Copy banner images from mern-ecommerce | 30m | MEDIUM | Assets |
| 20 | Create Zustand stores (auth, cart, wishlist, ui) | 3h | CRITICAL | State |
| 21 | Create API layer (axios, endpoints) | 1h | CRITICAL | API |
| 22 | Create routes with lazy loading | 1h | HIGH | Routes |
| 23 | Build Navbar component | 2h | HIGH | UI |
| 24 | Build Footer component | 1h | MEDIUM | UI |
| 25 | Build ProductCard + ProductList + ProductBanner | 4h | CRITICAL | UI |
| 26 | Build ProductDetailsPage | 3h | HIGH | UI |
| 27 | Build CartPage + CartItem | 2h | CRITICAL | UI |
| 28 | Build CheckoutPage (address form, payment select) | 3h | CRITICAL | UI |
| 29 | Build LoginPage + SignupPage | 2h | HIGH | UI |
| 30 | Build PaymentSuccess/Cancel pages | 1h | HIGH | UI |
| 31 | Build OrdersPage, ProfilePage, WishlistPage | 3h | MEDIUM | UI |
| 32 | Build Admin pages (Dashboard, AddProduct, Orders) | 4h | MEDIUM | UI |
| 33 | Build NotFoundPage | 30m | LOW | UI |
| 34 | Cart ↔ Basket.API sync | 2h | HIGH | Integration |
| 35 | PayOS payment flow integration | 2h | CRITICAL | Integration |
| **Testing** | | | | |
| 36 | Unit tests for Zustand stores | 2h | HIGH | Test |
| 37 | Unit tests for PaymentService | 2h | HIGH | Test |
| 38 | Integration tests for payment flow | 3h | CRITICAL | Test |
| 39 | Docker build & smoke test | 2h | CRITICAL | Build |
| 40 | Create React.Client Dockerfile + nginx.conf | 1h | HIGH | Docker |

**Total estimated effort: ~62 hours (8-9 days)**

### Critical Path

```
Week 1: Tasks 1-14 (Backend) + Tasks 15-22 (FE Setup)
Week 2: Tasks 23-35 (FE UI + Integration)
Week 3: Tasks 36-40 (Testing + Docker)
```
