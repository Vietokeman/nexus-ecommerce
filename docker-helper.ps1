# ==============================================================================
# QUICK COMMANDS - Docker Compose Helper
# ==============================================================================
# Tập hợp các lệnh thường dùng cho project
# ==============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DOCKER COMPOSE - QUICK COMMANDS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$srcPath = "d:\Git-Repo\Microservice\distributed-ecommerce-platform\src"

function Show-Commands {
    Write-Host "Chạy từ đây (auto CD):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Start All       - docker compose up -d" -ForegroundColor Green
    Write-Host "  2. Stop All        - docker compose down" -ForegroundColor Red
    Write-Host "  3. Restart All     - docker compose restart" -ForegroundColor Yellow
    Write-Host "  4. View Status     - docker compose ps" -ForegroundColor Cyan
    Write-Host "  5. View Logs       - docker compose logs -f" -ForegroundColor Cyan
    Write-Host "  6. View Logs 1 svc - docker compose logs -f <service-name>" -ForegroundColor Cyan
    Write-Host "  7. Rebuild         - docker compose up -d --build" -ForegroundColor Magenta
    Write-Host "  8. Clean All       - docker compose down -v (XÓA DATA!)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  9. Shell vào container - docker compose exec <service> sh" -ForegroundColor White
    Write-Host " 10. Run command         - docker compose exec <service> <command>" -ForegroundColor White
    Write-Host ""
    Write-Host "  0. Exit" -ForegroundColor Gray
    Write-Host ""
}

while ($true) {
    Show-Commands
    $choice = Read-Host "Chọn (0-10)"
    
    Set-Location $srcPath
    
    switch ($choice) {
        "1" {
            Write-Host "`nStarting all services..." -ForegroundColor Green
            docker compose up -d
            Write-Host "`nDone! Check status with option 4" -ForegroundColor Green
            Read-Host "`nPress Enter to continue"
        }
        "2" {
            Write-Host "`nStopping all services..." -ForegroundColor Yellow
            docker compose down
            Write-Host "`nDone!" -ForegroundColor Green
            Read-Host "`nPress Enter to continue"
        }
        "3" {
            Write-Host "`nRestarting all services..." -ForegroundColor Yellow
            docker compose restart
            Write-Host "`nDone!" -ForegroundColor Green
            Read-Host "`nPress Enter to continue"
        }
        "4" {
            Write-Host "`nContainer Status:" -ForegroundColor Cyan
            docker compose ps
            Read-Host "`nPress Enter to continue"
        }
        "5" {
            Write-Host "`nShowing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
            docker compose logs -f --tail 100
        }
        "6" {
            Write-Host "`nAvailable services:" -ForegroundColor Yellow
            Write-Host "  product.api, customer.api, basket.api, ordering.api"
            Write-Host "  inventory.api, payment.api, identity.api, hangfire.api"
            Write-Host "  flashsale.api, groupbuy.api, ocelot.apigw, react.client"
            Write-Host "  nexusdb, basketdb, rabbitmq, elasticsearch, kibana"
            Write-Host ""
            $service = Read-Host "Service name"
            if ($service) {
                Write-Host "`nShowing logs for $service (Ctrl+C to exit)..." -ForegroundColor Cyan
                docker compose logs -f --tail 100 $service
            }
        }
        "7" {
            Write-Host "`nRebuilding all services..." -ForegroundColor Magenta
            docker compose up -d --build
            Write-Host "`nDone!" -ForegroundColor Green
            Read-Host "`nPress Enter to continue"
        }
        "8" {
            $confirm = Read-Host "`nCảnh báo: Sẽ XÓA TẤT CẢ DATA! Tiếp tục? (yes/no)"
            if ($confirm -eq "yes") {
                Write-Host "`nCleaning all containers and volumes..." -ForegroundColor Red
                docker compose down -v
                Write-Host "`nDone!" -ForegroundColor Green
            } else {
                Write-Host "`nCancelled." -ForegroundColor Yellow
            }
            Read-Host "`nPress Enter to continue"
        }
        "9" {
            $service = Read-Host "`nService name (VD: product.api, nexusdb)"
            if ($service) {
                Write-Host "`nEntering shell in $service..." -ForegroundColor White
                docker compose exec $service sh
            }
        }
        "10" {
            $service = Read-Host "`nService name"
            $command = Read-Host "Command to run"
            if ($service -and $command) {
                Write-Host "`nRunning command in $service..." -ForegroundColor White
                docker compose exec $service $command
            }
            Read-Host "`nPress Enter to continue"
        }
        "0" {
            Write-Host "`nGoodbye!" -ForegroundColor Green
            exit
        }
        default {
            Write-Host "`nInvalid choice!" -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
    
    Clear-Host
}
