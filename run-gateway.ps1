# ==============================================================================
# Script: Run Distributed Ecommerce Platform
# Description: Full Stack Development với Docker (Hot Reload) hoặc Visual Studio
# ==============================================================================
# CÁCH DÙNG:
#   .\run-gateway.ps1                  → Interactive menu
#   .\run-gateway.ps1 -Mode docker     → Full Stack Docker (Hot Reload)
#   .\run-gateway.ps1 -Mode vs         → Visual Studio (Gateway only)
#   .\run-gateway.ps1 -Mode stop       → Dừng tất cả containers
#   .\run-gateway.ps1 -Mode logs       → Xem logs
# ==============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("docker", "vs", "stop", "logs", "status")]
    [string]$Mode = ""
)

$ErrorActionPreference = "Stop"
$srcPath = "d:\Git-Repo\Microservice\distributed-ecommerce-platform\src"
$gatewayPath = "$srcPath\APIGateWays\OcelotApiGw"

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Menu {
    Write-ColorOutput Cyan "============================================================"
    Write-ColorOutput Cyan "  DISTRIBUTED ECOMMERCE PLATFORM - DEVELOPMENT LAUNCHER"
    Write-ColorOutput Cyan "============================================================"
    Write-Host ""
    Write-ColorOutput Yellow "  [1] Docker Full Stack (Hot Reload)"
    Write-Host "      Gateway + All Microservices + React Frontend"
    Write-Host "      Sửa code → Container tự rebuild (dotnet watch + vite HMR)"
    Write-Host ""
    Write-ColorOutput Yellow "  [2] Visual Studio (Gateway Only)"
    Write-Host "      Chạy Infrastructure bằng Docker, Gateway bằng VS/CLI"
    Write-Host ""
    Write-ColorOutput Yellow "  [3] Xem Logs"
    Write-Host "      Theo dõi logs realtime của tất cả containers"
    Write-Host ""
    Write-ColorOutput Yellow "  [4] Xem Status"
    Write-Host "      Kiểm tra trạng thái các containers"
    Write-Host ""
    Write-ColorOutput Yellow "  [5] Dừng Tất Cả"
    Write-Host "      docker compose down"
    Write-Host ""
    Write-ColorOutput Yellow "  [6] Thoát"
    Write-Host ""
}

function Start-DockerFullStack {
    Write-ColorOutput Green "=========================================="
    Write-ColorOutput Green "  DOCKER FULL STACK - HOT RELOAD MODE"
    Write-ColorOutput Green "=========================================="
    Write-Host ""

    Set-Location $srcPath

    Write-ColorOutput Yellow "[1/4] Checking Docker daemon..."
    try {
        docker info | Out-Null
    } catch {
        Write-ColorOutput Red "Docker daemon is not running. Please start Docker Desktop."
        return
    }

    Write-ColorOutput Yellow "[2/4] Pulling infrastructure images (in batches to avoid timeout)..."
    Write-ColorOutput Cyan "  This may take a few minutes on first run..."
    Write-Host ""
    
    $infraImages = @(
        "postgis/postgis:16-3.4",
        "redis:alpine",
        "rabbitmq:3-management-alpine",
        "docker.elastic.co/elasticsearch/elasticsearch:7.17.2",
        "docker.elastic.co/kibana/kibana:7.17.2",
        "dpage/pgadmin4",
        "portainer/portainer-ce"
    )

    $dotnetImage = "mcr.microsoft.com/dotnet/sdk:8.0"
    $nodeImage = "node:20-alpine"

    foreach ($image in $infraImages) {
        Write-ColorOutput Cyan "  Pulling: $image"
        $retryCount = 0
        $maxRetries = 3
        $pulled = $false
        
        while (-not $pulled -and $retryCount -lt $maxRetries) {
            try {
                docker pull $image 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput Green "    ✓ Success"
                    $pulled = $true
                } else {
                    throw "Pull failed"
                }
            } catch {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-ColorOutput Yellow "    ⚠ Failed, retrying ($retryCount/$maxRetries)..."
                    Start-Sleep -Seconds 2
                } else {
                    Write-ColorOutput Yellow "    ⚠ Skipped (will try when starting containers)"
                }
            }
        }
    }

    Write-Host ""
    Write-ColorOutput Yellow "  Pulling .NET SDK image..."
    docker pull $dotnetImage 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "    ✓ $dotnetImage"
    } else {
        Write-ColorOutput Yellow "    ⚠ Will retry when starting containers"
    }

    Write-ColorOutput Yellow "  Pulling Node.js image..."
    docker pull $nodeImage 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "    ✓ $nodeImage"
    } else {
        Write-ColorOutput Yellow "    ⚠ Will retry when starting containers"
    }

    Write-Host ""
    Write-ColorOutput Yellow "[3/4] Starting all services with hot-reload..."
    Write-ColorOutput Cyan "  SDK Image: mcr.microsoft.com/dotnet/sdk:8.0 (dotnet watch run)"
    Write-ColorOutput Cyan "  Node Image: node:20-alpine (npm run dev + Vite HMR)"
    Write-Host ""

    # Start in background to avoid blocking
    docker compose up -d --remove-orphans 2>&1 | ForEach-Object {
        if ($_ -match "Pulling|Creating|Starting|Created|Started") {
            Write-Host "  $_"
        }
    }

    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Failed to start some services. Checking status..."
        Write-Host ""
        docker compose ps -a
        Write-Host ""
        Write-ColorOutput Yellow "Common issues:"
        Write-ColorOutput White "  1. Network timeout → Run again: docker compose up -d"
        Write-ColorOutput White "  2. Port in use → Check: netstat -ano | findstr '5000 3000 5433'"
        Write-ColorOutput White "  3. Pull failed → Manual pull: docker pull <image-name>"
        Write-Host ""
        Write-ColorOutput Yellow "Troubleshooting commands:"
        Write-ColorOutput Cyan "  docker compose logs                 # View all logs"
        Write-ColorOutput Cyan "  docker compose ps -a                # Check container status"
        Write-ColorOutput Cyan "  docker compose up -d --pull always  # Force re-pull images"
        return
    }

    Write-Host ""
    Write-ColorOutput Yellow "[4/4] Waiting for services to initialize..."
    Write-ColorOutput Cyan "  Checking container health..."
    Start-Sleep -Seconds 10

    $runningContainers = docker ps --filter "name=product.api|customer.api|ocelot.apigw|react.client" --format "{{.Names}}" 2>$null
    if ($runningContainers) {
        Write-ColorOutput Green "  ✓ Core services are starting up..."
    }

    Write-Host ""
    Write-ColorOutput Green "============================================================"
    Write-ColorOutput Green "  ALL SERVICES STARTED SUCCESSFULLY!"
    Write-ColorOutput Green "============================================================"
    Write-Host ""
    Write-ColorOutput Cyan "  Frontend (React):      http://localhost:3000"
    Write-ColorOutput Cyan "  API Gateway (Ocelot):  http://localhost:5000"
    Write-ColorOutput Cyan "  Health Dashboard:      http://localhost:6010"
    Write-Host ""
    Write-ColorOutput Cyan "  --- Infrastructure ---"
    Write-ColorOutput Cyan "  PostgreSQL:            localhost:5433"
    Write-ColorOutput Cyan "  Redis:                 localhost:6379"
    Write-ColorOutput Cyan "  RabbitMQ:              http://localhost:15672 (guest/guest)"
    Write-ColorOutput Cyan "  Elasticsearch:         http://localhost:9200"
    Write-ColorOutput Cyan "  Kibana:                http://localhost:5601"
    Write-ColorOutput Cyan "  PgAdmin:               http://localhost:5050"
    Write-ColorOutput Cyan "  Portainer:             http://localhost:9000"
    Write-Host ""
    Write-ColorOutput Yellow "  HOT RELOAD:"
    Write-ColorOutput White "  - Sửa file .cs/.json → Backend service tự rebuild"
    Write-ColorOutput White "  - Sửa file .tsx/.ts/.css → React HMR cập nhật ngay"
    Write-Host ""
    Write-ColorOutput Yellow "  FIRST TIME SETUP:"
    Write-ColorOutput White "  Services are initializing. This may take 1-2 minutes."
    Write-ColorOutput White "  Run migrations: docker compose exec product.api dotnet ef database update"
    Write-Host ""
    Write-ColorOutput Yellow "  Useful commands:"
    Write-ColorOutput Cyan "  docker compose logs -f              # Xem tất cả logs"
    Write-ColorOutput Cyan "  docker compose logs -f product.api  # Xem logs 1 service"
    Write-ColorOutput Cyan "  docker compose ps                   # Xem trạng thái"
    Write-ColorOutput Cyan "  docker compose restart product.api  # Restart 1 service"
    Write-ColorOutput Yellow "  Dừng tất:  .\run-gateway.ps1 -Mode stop"
}

function Start-VisualStudio {
    Write-ColorOutput Green "=========================================="
    Write-ColorOutput Green "  VISUAL STUDIO MODE"
    Write-ColorOutput Green "=========================================="
    Write-Host ""

    Set-Location $srcPath

    Write-ColorOutput Yellow "[1/4] Starting infrastructure in Docker..."
    docker compose up -d nexusdb basketdb rabbitmq elasticsearch kibana

    Start-Sleep -Seconds 5

    Write-ColorOutput Yellow "[2/4] Restoring NuGet packages..."
    Set-Location $gatewayPath
    dotnet restore

    Write-ColorOutput Yellow "[3/4] Building OcelotApiGw..."
    dotnet build --no-restore

    Write-Host ""
    Write-ColorOutput Yellow "[4/4] Starting Gateway (dotnet run)..."
    Write-ColorOutput Cyan "  Gateway: http://localhost:5000"
    Write-ColorOutput Yellow "  Press Ctrl+C to stop"
    Write-Host ""

    dotnet run --no-launch-profile --urls "http://+:5000"
}

function Show-Logs {
    Set-Location $srcPath
    Write-ColorOutput Yellow "Showing logs (Ctrl+C to exit)..."
    docker compose logs -f --tail 50
}

function Show-Status {
    Set-Location $srcPath
    Write-Host ""
    Write-ColorOutput Yellow "Container Status:"
    Write-Host ""
    docker compose ps -a
    Write-Host ""
}

function Stop-AllContainers {
    Write-ColorOutput Yellow "Stopping all containers..."
    Set-Location $srcPath
    docker compose down
    Write-ColorOutput Green "All containers stopped."
}

# Main
Clear-Host

if ($Mode -ne "") {
    switch ($Mode) {
        "docker" { Start-DockerFullStack }
        "vs"     { Start-VisualStudio }
        "logs"   { Show-Logs }
        "status" { Show-Status }
        "stop"   { Stop-AllContainers }
    }
} else {
    while ($true) {
        Show-Menu
        $choice = Read-Host "  Chọn (1-6)"
        Write-Host ""
        switch ($choice) {
            "1" { Start-DockerFullStack; break }
            "2" { Start-VisualStudio; break }
            "3" { Show-Logs; break }
            "4" { Show-Status; break }
            "5" { Stop-AllContainers; break }
            "6" { exit }
            default {
                Write-ColorOutput Red "  Lựa chọn không hợp lệ. Chọn 1-6."
                Start-Sleep -Seconds 1
            }
        }
    }
}
