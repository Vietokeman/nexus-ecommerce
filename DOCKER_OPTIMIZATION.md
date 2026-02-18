# 🚀 Docker Optimization Guide

## Performance Issues & Solutions

### Problem: "Build quá nặng, tốc độ quá lâu"

Docker build chậm có thể do nhiều nguyên nhân:

---

## ✅ GIẢI PHÁP NHANH

### Option 1: Minimal Development Setup (KHUYẾN NGHỊ)

**Vấn đề:** Chạy tất cả 15+ services cùng lúc → Tốn RAM, CPU, và thời gian build

**Giải pháp:** Chỉ chạy infrastructure + services đang develop

```powershell
cd src
docker compose -f docker-compose.dev-minimal.yml up -d
```

**Bao gồm:**
- ✅ PostgreSQL (nexusdb)
- ✅ Redis (basketdb)
- ✅ RabbitMQ
- ✅ Elasticsearch
- ✅ API Gateway (Ocelot)
- ✅ React Client
- ⚠️ Các services khác: Comment/uncomment trong file theo nhu cầu

**Lợi ích:**
- Build nhanh gấp 5-10 lần (chỉ 2-3 services thay vì 15)
- Tiết kiệm RAM (từ 8GB → 2GB)
- Hot-reload vẫn hoạt động

**Cách enable thêm services:**

Mở `docker-compose.dev-minimal.yml`, uncomment service cần thiết:

```yaml
# Uncomment để enable Product API
product.api:
  image: mcr.microsoft.com/dotnet/sdk:8.0
  container_name: src-product-api-dev
  # ... rest of config
```

---

### Option 2: Production Build Optimization

**Vấn đề:** Production build tạo image quá lớn (>500MB mỗi service)

**Giải pháp đã áp dụng:**

#### 1. Improved .dockerignore

```ignore
# Đã exclude:
- bin/, obj/ (build outputs)
- node_modules/
- .git/, .vs/, .idea/ (IDE files)
- **.md, docs/ (documentation)
- logs/, *.log (log files)
```

**Kết quả:** Giảm context size từ ~500MB → ~50MB

#### 2. Multi-Stage Dockerfile (Đã có sẵn)

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# ... restore + build ...

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
# ... chỉ copy runtime ...
```

**Kết quả:** Final image từ ~500MB → ~200MB

#### 3. Layer Caching Strategy

Dockerfile sử dụng layer caching tối ưu:
1. Copy .csproj files → Restore (cached nếu dependencies không đổi)
2. Copy source code → Build (cached nếu code không đổi)
3. Publish → Final image

**Build lần đầu:** ~5-10 phút  
**Build lần sau (có cache):** ~30 giây - 2 phút

---

## 📊 So Sánh Performance

| Setup | Services | First Build | Rebuild | RAM Usage | Disk |
|-------|----------|-------------|---------|-----------|------|
| Full Stack | 15 services | ~15-20 min | ~5-8 min | 8GB | 5GB |
| Minimal Dev | 2-3 services | ~2-3 min | ~30 sec | 2GB | 1GB |
| Production | Build only | ~5 min | ~30 sec | N/A | 200MB/service |

---

## 🔧 Advanced Optimizations

### 1. Use BuildKit for Parallel Builds

```powershell
# Enable Docker BuildKit
$env:DOCKER_BUILDKIT=1
$env:COMPOSE_DOCKER_CLI_BUILD=1

docker compose build --parallel
```

**Kết quả:** Build nhiều services song song, giảm tổng thời gian 40-50%

---

### 2. Pre-pull Base Images

```powershell
# Pull base images trước để save time
docker pull mcr.microsoft.com/dotnet/sdk:8.0
docker pull mcr.microsoft.com/dotnet/aspnet:8.0
docker pull node:20-alpine
docker pull postgis/postgis:16-3.4
```

---

### 3. Use Docker Layer Caching in CI/CD

Nếu build trên CI/CD (GitHub Actions, GitLab CI), enable layer caching:

```yaml
# GitHub Actions example
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v2

- name: Build with cache
  uses: docker/build-push-action@v4
  with:
    context: .
    file: ./Dockerfile
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

---

## 🎯 Development Strategies by Team Size

### 1 Developer (Solo)
```powershell
# Minimal setup
docker compose -f docker-compose.dev-minimal.yml up -d
```

**Run thêm services trong VS/Rider:**
- Run Product.API từ IDE
- Run Customer.API từ IDE
- Debug trực tiếp, hot-reload ngay lập tức

---

### 2-5 Developers (Small Team)
```powershell
# Infrastructure + Domain services
docker compose up -d nexusdb basketdb rabbitmq elasticsearch ocelot.apigw react.client
```

Mỗi developer run services riêng của mình từ IDE.

---

### 5+ Developers (Large Team)
- Infrastructure: Local Docker
- Services: Shared Dev Environment (Kubernetes/Docker Swarm)
- Developers chỉ run service đang develop

---

## 🛠️ Troubleshooting

### Build bị stuck

```powershell
# Clean Docker cache
docker builder prune -a

# Rebuild without cache
docker compose build --no-cache
```

### RAM hết

```powershell
# Check RAM usage
docker stats

# Stop unused services
docker compose stop customer.api basket.api ordering.api
```

### Disk hết

```powershell
# Clean unused images
docker image prune -a

# Clean volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

---

## 📝 Best Practices

### Development Mode
- ✅ Use `docker-compose.dev-minimal.yml`
- ✅ Run services from IDE for better debugging
- ✅ Only containerize infrastructure (DB, Redis, RabbitMQ)

### Production Mode
- ✅ Use `docker-compose.yml` (multi-stage builds)
- ✅ Enable BuildKit for parallel builds
- ✅ Pre-pull base images
- ✅ Use layer caching in CI/CD

### General
- ✅ Keep .dockerignore updated
- ✅ Minimize layers in Dockerfile
- ✅ Use specific base image tags (not `latest`)
- ✅ Combine RUN commands when possible

---

## 🔗 Quick Commands

```powershell
# Minimal Dev (Fastest)
cd src
docker compose -f docker-compose.dev-minimal.yml up -d

# Full Dev (Hot-reload)
cd src
docker compose up -d

# Production Build
cd src
docker compose -f docker-compose.yml build

# Build with parallel + cache
$env:DOCKER_BUILDKIT=1
docker compose build --parallel

# Check build time
Measure-Command { docker compose build product.api }

# Monitor resources
docker stats
```

---

## 📈 Expected Performance

### Minimal Dev Setup
- **First run:** 2-3 minutes (pull images + build gateway + frontend)
- **Subsequent runs:** 10-30 seconds (containers already exist)
- **Hot-reload:** Instant (dotnet watch detects changes)

### Full Dev Setup (15 services)
- **First run:** 15-20 minutes (build all services)
- **Subsequent runs:** 5-8 minutes (cached layers)
- **Hot-reload:** Instant

### Production Build (với BuildKit)
- **First build:** 5-10 minutes per service
- **Rebuild (cache hit):** 30 seconds - 2 minutes
- **Parallel build:** ~40-50% faster than sequential

---

## 🎉 Kết Luận

**Sử dụng `docker-compose.dev-minimal.yml` cho development hàng ngày!**

Chỉ run full stack khi:
- Integration testing toàn bộ hệ thống
- Demo cho client
- QA testing
- Production deployment

---

**Last Updated:** February 2026  
**Maintainer:** Nexus Commerce Team
