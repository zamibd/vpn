# Docker Setup Guide - VPN Management System

## Docker Setup Complete!

Your VPN Management System is now fully Dockerized and production-ready.

## Required Software

- Docker (v20.10+) - [Download](https://www.docker.com/products/docker-desktop)
- Docker Compose (v1.29+) - Usually included with Docker Desktop

## Verify Installation

```bash
docker --version
docker compose --version
```

## Quick Start

### 1. Start All Services
```bash
cd /Users/imzami/Desktop/Project/vpn
docker-compose up -d
docker compose

### 2. Verify Services
```bash
docker-compose ps
```

Expected output:
```
CONTAINER ID   IMAGE           STATUS              PORTS
...            vpn-mysql       Up (healthy)        3306/tcp
docker compose vpn-backend     Up                  8080/tcp
...            vpn-nginx       Up                  80/tcp, 443/tcp
```

### 3. Open Browser
```
http://localhost
```

## System Architecture

```
┌─────────────────────────────────────────┐
│      Browser (http://localhost)         │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │   Nginx (80)    │
        │  Reverse Proxy  │
        └────┬─────────┬──┘
             │         │
        ┌────▼──┐  ┌───▼─────────┐
        │Backend│  │   Static    │
        │ API   │  │   Frontend  │
        │(8080) │  │   Assets    │
        └────┬──┘  └─────────────┘
             │
        ┌────▼───────────┐
        │   MySQL        │
        │   (3306)       │
        │  Database      │
        └────────────────┘
```

## Docker Services

### MySQL Database
- **Container**: vpn-mysql
- **Image**: mysql:8.0
- **Port**: 3306
- **Volume**: mysql_data (persistent)
- **Status**: Auto health check enabled

### Go Backend API
- **Container**: vpn-backend
- **Port**: 8080
- **Depends on**: MySQL (waits for health check)
- **Config**: All environment variables from .env

### Nginx Reverse Proxy
- **Container**: vpn-nginx
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Role**: Frontend serving + API proxying
- **SSL**: Ready for production configuration

docker composeer Commands

### Service Management
docker compose
docker composervices
docker compose up -d

# Stop all services (keeps data)
docker-compose stop

# Start stopped services
docker compose start

# Restart all services
docker compose restart

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove everything (WARNING: deletes data)
docker compose down -v
```

docker composegs
```bash
# Real-time logs from all services
docker-compose logs -f

# Last 50 lines
docker compose logs --tail=50

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f nginx

# Last lines of specific service
docker-compose logs --tail=100 backend
docker compose

### Container Operations
docker compose
# Show container status
docker-compose ps
docker compose
# Enter backend container
docker-compose exec backend sh

# Enter MySQL container
docker-compose exec mysql mysql -u vpn_user -pvpn_password vpn_management

# Enter Nginx container
docker-compose exec nginx sh
```

### Building and Rebuilding
```bash
# Build all images
docker-compose build

# Rebuild without using cache
docker-compose build --no-cache backend
docker compose
# Build and start in one command
docker-compose up -d --build

# Build only backend
docker-compose build backend
```

## Database Operations

### Access MySQL
```bash
docker-compose exec mysql mysql -u vpn_user -pvpn_password vpn_management
```

### View Users
```bash
docker-compose exec mysql mysql -u vpn_user -pvpn_password vpn_management \
  -e "SELECT id, username, role, status FROM users;"
```

### Create Backup
```bash
docker-compose exec mysql mysqldump -u vpn_user -pvpn_password vpn_management \
  > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Backup
```bash
docker-compose exec mysql mysql -u vpn_user -pvpn_password vpn_management \
  < backup-20251124.sql
```

## Environment Configuration

All sensitive data is stored in `.env` file:

```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=vpn_user
DB_PASS=vpn_password
DB_ROOT_PASSWORD=vpn_root_password
DB_NAME=vpn_management

# Server
PORT=8080
ENV=development

# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secret-key-change-this-in-production
```

## Volumes and Data Persistence

MySQL data is stored in Docker volume `mysql_data`:

```bash
# List all volumes
docker volume ls

# Inspect volume
docker volume inspect vpn_mysql_data

# Backup volume
docker run --rm -v vpn_mysql_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mysql-backup.tar.gz -C /data .
```

## API Testing

### Get Packages
```bash
cdocker composealhost:8080/api/packages
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
docker composeme":"123456","password":"654321"}'
```

docker composee (with token)
```bash
TOKEN="your_jwt_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/user/profile
```
docker compose
## Monitoring

docker composerce Usage
```bash
docker stats
docker stats vpn-backend vpn-mysql vpn-nginx
```

### Check Disk Space
```bash
docker system df
```
docker compose
### View Container Processes
```bash
docker-compose top backend
docker-compose top mysql
```
docker compose
## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

docker composeuration
docker-compose config

docker composeng
docker-compose build backend
docker-compose up -d backend
```
docker compose
### MySQL Connection Errors
```bash
# Check MySQL is running
docker-compose ps mysql

# Check health
docker-compose exec mysql mysqladmin ping

# View MySQL logs
docker-compose logs mysql
```

### Port Already in Use
```bash
# Find process using port
lsof -i :80
lsof -i :8080

# Or change port in .env
PORT=8090
docker-compose restart
```

### Nginx 502 Bad Gateway
```bash
# Check backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend
docker compose
# Verify nginx config
docker-compose exec nginx nginx -t
docker compose

### Complete Cleanup
```bash
# Stop all services
docker compose down -v
docker compose
# Remove all Docker unused resources
docker system prune -a

# Start fresh
docker-compose up -d --build
```

## Production Deployment

Use `docker-compose.prod.yml` for production:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Features:
- Resource limits (CPU and memory)
- Logging configuration
- Restart policies
- Health checks
docker compose
## Performance Tips

### Enable BuildKit
```bash
export DOCKER_BUILDKIT=1
docker-compose build
```

### Set Resource Limits
Already configured in `docker-compose.prod.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

### Log Rotation
Already configured in production file:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "10"
```

## Useful Docker Aliases

Add to your shell profile:

```bash
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
```

## File Descriptions

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for Go backend |
| `docker-compose.yml` | Development configuration |
| `docker-compose.prod.yml` | Production configuration |
| `docker-compose.override.yml` | Development overrides |
| `nginx.conf` | Reverse proxy configuration |
| `.dockerignore` | Build context optimization |

## Next Steps

- For production deployment: See `DEPLOYMENT.md`
- For quick reference: See `DOCKER_QUICKREF.md`
- For troubleshooting: Check logs with `docker-compose logs -f`

---

**Docker Setup Complete!** ✅

Use `docker-compose up -d` to start your system.
