# Infrastructure Setup Reference (RabbitMQ, ELK, Ocelot)

Date: 2026-03-22

Muc tieu tai lieu nay: chi cho ban diem vao nhanh de setup RabbitMQ, ELK (Elasticsearch + Kibana), va Ocelot Gateway trong project nay, kem lien ket den file cau hinh thuc te.

## 1) Doc o dau truoc

1. Full deployment + runbook (chi tiet nhat)
   - `docs/DEPLOYMENT_GUIDE_VI.md`
2. Docker stack toi uu / startup nhanh
   - `DOCKER_OPTIMIZATION.md`
3. Ocelot route map thuc te
   - `src/APIGateWays/OcelotApiGw/ocelot.json`
   - `src/APIGateWays/OcelotApiGw/ocelot.Development.json`
4. Ocelot runtime middleware + Elasticsearch sink
   - `src/APIGateWays/OcelotApiGw/Program.cs`
5. Port mapping va env wiring (docker)
   - `src/docker-compose.yml`
   - `src/docker-compose.override.yml`
6. Frontend gateway base URL
   - `src/WebApps/React.Client/.env.example`

## 2) Quick start local infrastructure

Chay tai thu muc `src`:

```powershell
Set-Location "d:/Git-Repo/Microservice/distributed-ecommerce-platform/src"
docker compose up -d rabbitmq elasticsearch kibana ocelot.apigw
```

Kiem tra nhanh:

```powershell
docker compose ps rabbitmq elasticsearch kibana ocelot.apigw
```

## 3) Cac URL can nho

- Ocelot Gateway Swagger: http://localhost:5000/swagger
- Ocelot Health: http://localhost:5000/health
- RabbitMQ Management UI: http://localhost:15672 (guest/guest)
- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601

## 4) RabbitMQ setup va ket noi

- Service docker: `rabbitmq:3-management-alpine`
- Port host: `5672` (AMQP), `15672` (Management UI)
- Connection string env da duoc wiring trong compose:
  - `EventBusSettings:HostAddress=amqp://guest:guest@rabbitmq:5672`

Noi de kiem tra trong code/doc:

- `src/docker-compose.override.yml` (cac dong EventBusSettings)
- `docs/DEPLOYMENT_GUIDE_VI.md` (section Event Transmission voi RabbitMQ)

## 5) ELK setup va ket noi

- Elasticsearch image: `docker.elastic.co/elasticsearch/elasticsearch:7.17.2`
- Kibana image: `docker.elastic.co/kibana/kibana:7.17.2`
- Port host:
  - Elasticsearch: `9200`
  - Kibana: `5601`
- Ocelot gateway da push log len Elasticsearch trong:
  - `src/APIGateWays/OcelotApiGw/Program.cs`
  - key config: `ElasticConfiguration:Uri`

Noi de kiem tra env compose:

- `src/docker-compose.override.yml`
  - `ElasticConfiguration:Uri=http://elasticsearch:9200`
  - `ELASTICSEARCH_HOSTS=http://elasticsearch:9200`

## 6) Ocelot setup va route reference

File route chinh:

- Docker/integration route: `src/APIGateWays/OcelotApiGw/ocelot.json`
- Development route: `src/APIGateWays/OcelotApiGw/ocelot.Development.json`

Runtime wiring:

- `Program.cs` load `ocelot.json` va bat `UseSwaggerForOcelotUI()`
- CORS cho phep full origin/method/header
- Gateway la single entry point cho FE trong integrated mode

Vi du route da dong bo:

- Product by no route qua gateway:
  - `/api/products/search/{productNo}`

## 7) FE phai tro vao gateway nhu the nao

React client:

- File env mau: `src/WebApps/React.Client/.env.example`
- Key bat buoc:
  - `VITE_API_BASE_URL=http://localhost:5000`

Y nghia:

- FE goi `/api/...` -> base URL `localhost:5000` -> Ocelot -> downstream service.
- Khi doi environment, doi `VITE_API_BASE_URL`, khong hard-code service port o component.

## 8) Troubleshooting checklist

1. Gateway 404:
   - check route trong `ocelot.json`/`ocelot.Development.json`
   - check service downstream co up trong docker compose khong
2. RabbitMQ khong nhan event:
   - check `EventBusSettings:HostAddress`
   - check queue/exchange trong UI `localhost:15672`
3. Khong thay log tren Kibana:
   - check `ElasticConfiguration:Uri`
   - check index moi trong Elasticsearch (`http://localhost:9200/_cat/indices?v`)

## 9) External official references

- RabbitMQ Documentation: https://www.rabbitmq.com/documentation.html
- Elasticsearch Documentation: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- Kibana Documentation: https://www.elastic.co/guide/en/kibana/current/index.html
- Ocelot Documentation: https://ocelot.readthedocs.io/
