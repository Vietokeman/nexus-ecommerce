# ==================== STOP MICROSERVICES PLATFORM ====================
# Quick stop script for Distributed E-Commerce Platform

Write-Host "🛑 Stopping Distributed E-Commerce Platform..." -ForegroundColor Cyan
Write-Host ""

# Navigate to docker-compose directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = $projectPath
$dockerComposeDir = Join-Path $projectRoot "src"

Set-Location $dockerComposeDir

Write-Host "📁 Working directory: $dockerComposeDir" -ForegroundColor Yellow
Write-Host ""

# Show menu
Write-Host "Select stop option:" -ForegroundColor Cyan
Write-Host "  1. Stop all services (keep containers)" -ForegroundColor White
Write-Host "  2. Stop and remove containers (keep data)" -ForegroundColor White
Write-Host "  3. Stop and remove everything (including data) ⚠️" -ForegroundColor Yellow
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🛑 Stopping all services..." -ForegroundColor Cyan
        docker-compose stop
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
            Write-Host "   To restart: docker-compose start" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Failed to stop services" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🗑️  Stopping and removing containers..." -ForegroundColor Cyan
        docker-compose down
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Containers removed successfully!" -ForegroundColor Green
            Write-Host "   Data volumes preserved" -ForegroundColor Yellow
            Write-Host "   To restart: docker-compose up -d" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Failed to remove containers" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "⚠️  WARNING: This will delete all data!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? Type 'yes' to confirm"
        
        if ($confirm -eq 'yes') {
            Write-Host ""
            Write-Host "🗑️  Stopping and removing everything..." -ForegroundColor Cyan
            docker-compose down -v
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Everything removed successfully!" -ForegroundColor Green
                Write-Host "   All data has been deleted" -ForegroundColor Yellow
                Write-Host "   To restart fresh: docker-compose up -d --build" -ForegroundColor Yellow
            } else {
                Write-Host "❌ Failed to remove everything" -ForegroundColor Red
            }
        } else {
            Write-Host "Cancelled." -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📊 Current Docker Status:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
docker ps -a --filter "name=viet_microservices" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
