# ==================== START MICROSERVICES PLATFORM ====================
# Quick start script for Distributed E-Commerce Platform
# All services run through API Gateway on port 5000

Write-Host "🚀 Starting Distributed E-Commerce Platform..." -ForegroundColor Cyan
Write-Host ""

# Navigate to docker-compose directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$dockerComposeDir = Join-Path $projectRoot "src"

Set-Location $dockerComposeDir

Write-Host "📁 Working directory: $dockerComposeDir" -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
Write-Host "🐳 Checking Docker..." -ForegroundColor Cyan
$dockerRunning = $null
try {
    $dockerRunning = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        Write-Host "   Then run this script again." -ForegroundColor Yellow
        pause
        exit 1
    }
    Write- "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running." -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""

# Check if any containers are already running
Write-Host "🔍 Checking existing containers..." -ForegroundColor Cyan
$existingContainers = docker-compose ps -q

if ($existingContainers) {
    Write-Host "⚠️  Some containers are already running." -ForegroundColor Yellow
    $restart = Read-Host "Do you want to restart all services? (y/N)"
    
    if ($restart -eq 'y' -or $restart -eq 'Y') {
        Write-Host ""
        Write-Host "🔄 Stopping existing containers..." -ForegroundColor Cyan
        docker-compose down
        Write-Host "✅ Containers stopped" -ForegroundColor Green
        Write-Host ""
    }
}

# Start all services
Write-Host "🚀 Starting all microservices..." -ForegroundColor Cyan
Write-Host "   This may take a few minutes on first run (downloading images + building)..." -ForegroundColor Yellow
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Wait for services to be healthy
    Write-Host "⏳ Waiting for services to be ready (30 seconds)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
    
    # Display service status
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host ""
    Write-Host "🌐 Access Points:" -ForegroundColor Green
    Write-Host "==================" -ForegroundColor Green
    Write-Host "  ⭐ API Gateway (MAIN):  http://localhost:5000" -ForegroundColor Yellow
    Write-Host "                          http://localhost:5000/swagger" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  🎨 Frontend App:        http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  🏥 Health Dashboard:    http://localhost:6010" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  📊 Management Tools:" -ForegroundColor Magenta
    Write-Host "     RabbitMQ:            http://localhost:15672 (guest/guest)" -ForegroundColor White
    Write-Host "     Kibana:              http://localhost:5601" -ForegroundColor White
    Write-Host "     pgAdmin:             http://localhost:5050" -ForegroundColor White
    Write-Host "     Portainer:           http://localhost:9000" -ForegroundColor White
    Write-Host ""
    
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "   - All API requests go through: http://localhost:5000/api/v1/..." -ForegroundColor White
    Write-Host "   - To view logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "   - To stop all: docker-compose stop" -ForegroundColor White
    Write-Host "   - To restart: docker-compose restart" -ForegroundColor White
    Write-Host ""
    
    # Ask to open browser
    $openBrowser = Read-Host "Do you want to open the application in browser? (Y/n)"
    if ($openBrowser -ne 'n' -and $openBrowser -ne 'N') {
        Start-Process "http://localhost:3000"
        Start-Process "http://localhost:5000/swagger"
    }
    
} else {
    Write-Host ""
    Write-Host "❌ Failed to start services. Check the logs:" -ForegroundColor Red
    Write-Host "   docker-compose logs" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
