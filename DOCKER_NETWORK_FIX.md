# 🔧 Docker Network Issue - Quick Fix Guide

## Lỗi: `failed to copy: httpReadSeeker: failed open`

Lỗi này xảy ra khi pull Docker images từ Docker Hub do network timeout/firewall/DNS.

---

## ✅ GIẢI PHÁP NHANH (Thứ tự ưu tiên)

### Option 1: Retry lại (80% trường hợp fix được)

```powershell
# Cách 1: Run script lại (đã có retry logic)
.\run-gateway.ps1 -Mode docker

# Cách 2: Pull manually từng image
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src
docker compose pull --ignore-pull-failures
docker compose up -d
```

### Option 2: Đổi DNS (Fix network routing)

**Google DNS:**

```powershell
# PowerShell as Admin
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8","8.8.4.4")
```

**Cloudflare DNS:**

```powershell
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("1.1.1.1","1.0.0.1")
```

**Kiểm tra interface name:**

```powershell
Get-NetAdapter | Select-Object Name, Status
# Thay "Ethernet" bằng tên thực tế (VD: "Wi-Fi", "Ethernet 2")
```

**Hoặc đổi qua GUI:**

1. Control Panel → Network Connections
2. Right-click adapter → Properties
3. IPv4 → Properties → Use the following DNS:
   - Preferred: `8.8.8.8`
   - Alternate: `8.8.4.4`

### Option 3: Restart Docker Desktop

```powershell
# Restart Docker service
Restart-Service com.docker.service

# Hoặc restart Docker Desktop app
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Option 4: Tắt VPN/Proxy tạm thời

Nếu đang dùng VPN/Corporate Proxy:

```powershell
# Disable proxy tạm thời
$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:NO_PROXY = ""

# Retry
docker compose pull
```

### Option 5: Pull từng image một (Slow but reliable)

```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src

# Pull infrastructure images
docker pull postgis/postgis:16-3.4
docker pull redis:alpine
docker pull rabbitmq:3-management-alpine
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.17.2
docker pull docker.elastic.co/kibana/kibana:7.17.2
docker pull dpage/pgadmin4
docker pull portainer/portainer-ce

# Pull SDK images
docker pull mcr.microsoft.com/dotnet/sdk:8.0
docker pull node:20-alpine

# Start containers (will skip re-pulling)
docker compose up -d
```

---

## 🚀 CHẠY MÀ KHÔNG CẦN PULL (Skip images đã có)

Nếu images đã được pull 1 phần:

```powershell
cd d:\Git-Repo\Microservice\distributed-ecommerce-platform\src

# Start với images hiện có, skip pull
docker compose up -d --no-build

# Xem logs để check services nào đang chạy
docker compose ps
docker compose logs -f
```

---

## 🔍 KIỂM TRA & DEBUG

### Check Docker Hub connectivity

```powershell
# Test DNS resolution
nslookup registry-1.docker.io
nslookup production.cloudflare.docker.com

# Test HTTP connection
curl -I https://registry-1.docker.io/v2/

# Test Docker pull một image nhỏ
docker pull hello-world
```

### Check Docker daemon

```powershell
docker info
docker version

# Xem Docker storage
docker system df
```

### Check network

```powershell
# Test internet
Test-NetConnection google.com -Port 443
Test-NetConnection registry-1.docker.io -Port 443

# Check firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Docker*"}
```

---

## 💡 ADVANCED SOLUTIONS

### Solution A: Sử dụng Docker Mirror (China/Corporate)

Edit `C:\ProgramData\docker\config\daemon.json`:

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com"
  ]
}
```

Restart Docker Desktop sau khi sửa.

### Solution B: Increase timeout

Edit `daemon.json`:

```json
{
  "max-concurrent-downloads": 3,
  "max-download-attempts": 5
}
```

### Solution C: Manual download (Offline install)

```powershell
# Save images to tar file (on machine with good internet)
docker pull postgis/postgis:16-3.4
docker save postgis/postgis:16-3.4 -o postgis.tar

# Transfer tar file to target machine, then load
docker load -i postgis.tar
```

---

## 🎯 RECOMMENDED WORKFLOW

**Lần đầu setup:**

```powershell
# 1. Đổi DNS sang Google/Cloudflare
# 2. Restart Docker Desktop
# 3. Run script
.\run-gateway.ps1 -Mode docker
```

**Nếu vẫn lỗi:**

```powershell
# Pull manually từng cái
docker pull mcr.microsoft.com/dotnet/sdk:8.0  # Quan trọng nhất
docker pull node:20-alpine                     # Quan trọng thứ 2
docker pull postgis/postgis:16-3.4            # Database
docker pull redis:alpine                       # Cache
docker pull rabbitmq:3-management-alpine      # Message Queue

# Rồi start (skip các image fail)
docker compose up -d --no-build
```

**Check services:**

```powershell
docker compose ps              # Xem status
docker compose logs -f         # Xem logs realtime
docker compose logs product.api  # Logs 1 service
```

---

## 📊 Container Startup Time

| Service                    | Expected Time | Notes                      |
| -------------------------- | ------------- | -------------------------- |
| Infrastructure (DB, Redis) | 10-20s        | Nhanh nhất                 |
| .NET Services (first run)  | 30-60s        | `dotnet restore` + build   |
| React Client (first run)   | 40-80s        | `npm install` + dev server |
| Subsequent runs            | 5-10s         | Hot reload mode            |

---

## ⚠️ TROUBLESHOOTING

### Lỗi: Port already in use

```powershell
# Tìm process đang dùng port
netstat -ano | findstr "5000"
netstat -ano | findstr "3000"
netstat -ano | findstr "5433"

# Kill process
taskkill /PID <PID> /F

# Hoặc stop containers cũ
docker compose down
```

### Lỗi: Out of disk space

```powershell
# Clean Docker cache
docker system prune -a --volumes

# Check space
docker system df

# Remove unused images
docker image prune -a
```

### Lỗi: Container keeps restarting

```powershell
# Xem logs để biết nguyên nhân
docker compose logs <service-name>

# VD:
docker compose logs product.api
docker compose logs ocelot.apigw
docker compose logs react.client
```

### Lỗi trong container: `database does not exist`

```powershell
# Run migrations
docker compose exec product.api dotnet ef database update
docker compose exec customer.api dotnet ef database update
docker compose exec ordering.api dotnet ef database update
# ... repeat cho các services khác
```

---

## 🔗 REFERENCE

- [Docker Hub Status](https://status.docker.com/)
- [Docker Network Troubleshooting](https://docs.docker.com/config/daemon/proxy/)
- [Cloudflare CDN Status](https://www.cloudflarestatus.com/)

---

## 📞 QUICK HELP

**Vẫn không chạy được?**

1. Kiểm tra Docker Desktop đã chạy chưa: `docker info`
2. Kiểm tra internet: `ping 8.8.8.8`
3. Kiểm tra DNS: `nslookup registry-1.docker.io`
4. Check firewall: Tắt Windows Firewall tạm thời để test
5. Try offline mode: Start với images đã có `docker compose up -d --no-build`

**Emergency fallback:**

```powershell
# Chỉ chạy infrastructure, skip microservices
docker compose up -d nexusdb basketdb rabbitmq elasticsearch

# Run Gateway từ Visual Studio
.\run-gateway.ps1 -Mode vs
```

---

Generated: 2026-02-16
