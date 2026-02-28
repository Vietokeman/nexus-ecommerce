# ==============================================================================

# DEPLOYMENT GUIDE - Nexus Commerce Platform

# ==============================================================================

# Hướng dẫn deploy sản phẩm đầu tay lên production

# ==============================================================================

# ======================== OPTION 1: VPS (DigitalOcean/Vultr/Hetzner) ========================

# Chi phí: $20-40/tháng cho VPS 4GB RAM

# Phù hợp: Sản phẩm đầu tay, MVP, portfolio

# Bước 1: Chuẩn bị VPS (Ubuntu 22.04, 4GB RAM minimum)

# ssh root@your-vps-ip

# apt update && apt upgrade -y

# curl -fsSL https://get.docker.com | sh

# apt install docker-compose-plugin -y

# Bước 2: Clone code

# git clone https://github.com/your-repo/distributed-ecommerce-platform.git

# cd distributed-ecommerce-platform/src

# Bước 3: Tạo file .env cho production

# cp .env.example .env

# nano .env # Sửa passwords, JWT secrets

# Bước 4: Deploy production (dùng Dockerfile build, KHÔNG dùng SDK/watch)

# docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Bước 5: Kiểm tra health

# curl http://localhost:6010/healthcheck-dashboard

# ======================== OPTION 2: Tách DB riêng (RECOMMENDED) ========================

# Database nên tách riêng để:

# - Dễ backup/restore

# - Không mất data khi redeploy

# - Scale independently

# Dùng Managed Database (rẻ nhất):

# - Supabase PostgreSQL: FREE tier (500MB)

# - Neon.tech: FREE tier (512MB)

# - Railway: $5/tháng

# - DigitalOcean Managed DB: $15/tháng

# Khi dùng external DB, chỉ cần đổi connection string:

# ConnectionStrings:DefaultConnectionString=Host=your-db-host;Port=5432;Database=ProductDb;Username=admin;Password=secure_password;

# ======================== OPTION 3: Railway / Render (Easiest) ========================

# Deploy từng service lên Railway hoặc Render

# - Mỗi service = 1 Railway service

# - PostgreSQL = Railway PostgreSQL addon

# - Redis = Railway Redis addon

# Chi phí: ~$15-25/tháng

# ======================== OPTION 4: Free Tier Stack ========================

# Hoàn toàn miễn phí cho demo/portfolio:

# - Frontend: Vercel (free)

# - Database: Supabase/Neon (free tier)

# - Redis: Upstash (free tier)

# - API Services: Render free tier (cold start 30s)

# - RabbitMQ: CloudAMQP free tier

# ======================== TÁCH DB CÓ KHÓ KHÔNG? ========================

# KHÔNG KHÓ! Chỉ cần:

# 1. Tạo managed PostgreSQL (Supabase/Neon)

# 2. Đổi connection string trong docker-compose.prod.yml

# 3. Bỏ service nexusdb trong compose

# 4. Mỗi service tự tạo database khi khởi chạy (auto-migrate)

#

# VÍ DỤ:

# Thay:

# Host=nexusdb;Port=5432;Database=ProductDb;Username=admin;Password=xxx

# Bằng:

# Host=db.supabase.co;Port=5432;Database=ProductDb;Username=postgres;Password=your-supabase-password
