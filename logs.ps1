# ==================== QUICK LOGS VIEWER ====================
# View logs for Distributed E-Commerce Platform services

Write-Host "📋 Distributed E-Commerce Platform - Logs Viewer" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to docker-compose directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = $scriptPath
$dockerComposeDir = Join-Path $projectRoot "src"

Set-Location $dockerComposeDir

Write-Host "Select service to view logs:" -ForegroundColor Cyan
Write-Host "  1.  All services" -ForegroundColor White
Write-Host "  2.  API Gateway (ocelot.apigw) ⭐" -ForegroundColor Yellow
Write-Host "  3.  Product API" -ForegroundColor White
Write-Host "  4.  Customer API" -ForegroundColor White
Write-Host "  5.  Basket API" -ForegroundColor White
Write-Host "  6.  Ordering API" -ForegroundColor White
Write-Host "  7.  Payment API" -ForegroundColor White
Write-Host "  8.  Identity API" -ForegroundColor White
Write-Host "  9.  React Frontend" -ForegroundColor Cyan
Write-Host "  10. RabbitMQ" -ForegroundColor Magenta
Write-Host "  11. PostgreSQL (nexusdb)" -ForegroundColor Magenta
Write-Host ""

$choice = Read-Host "Enter your choice (1-11)"

$service = switch ($choice) {
    "1" { "" }
    "2" { "ocelot.apigw" }
    "3" { "product.api" }
    "4" { "customer.api" }
    "5" { "basket.api" }
    "6" { "ordering.api" }
    "7" { "payment.api" }
    "8" { "identity.api" }
    "9" { "react.client" }
    "10" { "rabbitmq" }
    "11" { "nexusdb" }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Viewing logs... (Press Ctrl+C to exit)" -ForegroundColor Yellow
Write-Host ""

if ($service -eq "") {
    docker-compose logs -f --tail=100
} else {
    docker-compose logs -f --tail=100 $service
}
