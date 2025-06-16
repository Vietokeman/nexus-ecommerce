# 1. Clone project từ GitHub

git clone https://github.com/Vietokeman/distributed-ecommerce-platform.git
cd distributed-ecommerce-platform

# 2. Start toàn bộ services trong Docker Compose

docker compose up -d

# 3. Kiểm tra các container đang chạy

docker ps

# 4. Kiểm tra volumes đã được tạo

docker volume ls

# 5. Kiểm tra log của một service cụ thể (VD: elasticsearch)

docker logs elasticsearch

# 6. Nếu cần stop toàn bộ services

docker compose down

# 7. Nếu muốn xóa luôn volumes khi stop (mất data)

docker compose down -v

# 8. Reset lại nếu gặp lỗi port/volume (cẩn thận mất dữ liệu)

docker system prune -a --volumes

# 9. Truy cập các dịch vụ qua trình duyệt:

# SQL Server: localhost:1433 (qua SSMS hoặc Azure Data Studio)

# MySQL: localhost:3306

# PostgreSQL: localhost:5432

# Redis: localhost:6379

# MongoDB: localhost:27017

# RabbitMQ UI: http://localhost:15672

# pgAdmin: http://localhost:5050

# Portainer: http://localhost:9000

# Elasticsearch: http://localhost:9200

# Kibana: http://localhost:5601
