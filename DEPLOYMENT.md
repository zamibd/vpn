# Deployment Guide - VPN Management System

## Deployment Options

### 1. Local Development

```bash
cd /Users/imzami/Desktop/Project/vpn
docker-compose up -d
```

**Access**: http://localhost

**Features**:
- Easy debugging
- Hot reload
- Direct database access
- Real-time logs

### 2. Production Deployment

#### Step 1: Server Setup

```bash
# SSH into your server
ssh user@your-server.com

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 2: Clone Project

```bash
git clone https://github.com/yourusername/vpn-management.git
cd vpn-management
```

#### Step 3: Configure Environment

```bash
# Create production .env file
cat > .env << 'ENVEOF'
DB_HOST=mysql
DB_PORT=3306
DB_USER=prod_vpn_user
DB_PASS=$(openssl rand -base64 32)
DB_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_NAME=vpn_management
PORT=8080
JWT_SECRET=$(openssl rand -base64 64)
ENV=production
LOG_LEVEL=info
MYSQL_VERSION=8.0
NGINX_VERSION=alpine
ENVEOF

# Edit with strong passwords
nano .env
```

#### Step 4: SSL Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf with SSL paths
# ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

# Mount certificates in docker-compose.prod.yml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

#### Step 5: Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
```

## Nginx SSL Configuration

Update `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Scaling Setup

### Multiple Backend Instances

Create `docker-compose.scale.yml`:

```yaml
version: '3.8'

services:
  backend-1:
    build: .
    environment:
      INSTANCE_ID: 1
    networks:
      - vpn-network

  backend-2:
    build: .
    environment:
      INSTANCE_ID: 2
    networks:
      - vpn-network

  backend-3:
    build: .
    environment:
      INSTANCE_ID: 3
    networks:
      - vpn-network

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
    depends_on:
      - backend-1
      - backend-2
      - backend-3
    networks:
      - vpn-network
```

### Nginx Load Balancing

Create `nginx-lb.conf`:

```nginx
upstream backend {
    server backend-1:8080;
    server backend-2:8080;
    server backend-3:8080;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Backup Strategy

### Automated Daily Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups"

mkdir -p $BACKUP_DIR

# MySQL backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
  -u vpn_user -p$DB_PASS vpn_management > $BACKUP_DIR/db-$DATE.sql

# Compress
gzip $BACKUP_DIR/db-$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +30 -delete

echo "Backup created: $BACKUP_DIR/db-$DATE.sql.gz"
```

### Setup Cron Job

```bash
# Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

## Code Updates and Rollback

### Deploy New Code

```bash
# Pull latest code
git pull origin main

# Rebuild backend
docker-compose build backend

# Start new version
docker-compose up -d backend

# Check logs
docker-compose logs -f backend
```

### Rollback to Previous Version

```bash
# Revert changes
git revert HEAD

# Rebuild and restart
docker-compose build backend
docker-compose up -d backend
```

## Database Migrations

```bash
# Backup before migration
docker-compose exec mysql mysqldump -u vpn_user -p$DB_PASS vpn_management > backup.sql

# Run migration
docker-compose exec mysql mysql -u vpn_user -p$DB_PASS vpn_management < migration.sql

# Verify
docker-compose exec mysql mysql -u vpn_user -p$DB_PASS vpn_management -e "SELECT * FROM users LIMIT 1;"
```

## Monitoring and Logging

### Check Container Logs

```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# View JSON logs
docker logs --tail=100 vpn-backend | jq
```

### Monitor Resources

```bash
docker stats
docker stats vpn-mysql vpn-backend vpn-nginx
```

### Check Disk Space

```bash
docker system df
docker volume inspect vpn_mysql_data
```

## Security Checklist

- [ ] Change default admin credentials
- [ ] Update JWT_SECRET to strong random value (min 64 chars)
- [ ] Enable SSL/TLS with valid certificate
- [ ] Setup firewall (UFW/iptables)
- [ ] Restrict database access to backend only
- [ ] Enable MySQL root password
- [ ] Setup automated backups
- [ ] Configure log rotation
- [ ] Monitor access logs
- [ ] Setup rate limiting in Nginx
- [ ] Disable unnecessary ports
- [ ] Enable health checks
- [ ] Setup alerts/monitoring

### Firewall Configuration (Ubuntu/UFW)

```bash
sudo ufw enable
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw deny 3306/tcp    # Block MySQL
sudo ufw deny 8080/tcp    # Block backend direct access
```

## Troubleshooting

### Container Won't Start
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Database Connection Failed
```bash
docker-compose -f docker-compose.prod.yml ps mysql
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping
```

### High Memory Usage
```bash
docker stats
# Check limits in docker-compose.prod.yml
```

### Certificate Renewal
```bash
# Certbot auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Manual renewal
sudo certbot renew
```

## Production Deployment Checklist

```
Pre-Deployment:
☐ All tests pass
☐ Environment variables set
☐ Database backup created
☐ SSL certificate ready
☐ Domain DNS configured

Deployment:
☐ Services started successfully
☐ All containers healthy
☐ API endpoints responding
☐ Logs show no errors

Post-Deployment:
☐ Test user login
☐ Setup monitoring
☐ Enable automated backups
☐ Configure alerts
☐ Document deployment
```

## Support Commands

```bash
# View deployment status
docker-compose -f docker-compose.prod.yml ps

# View logs with filters
docker-compose -f docker-compose.prod.yml logs --since 5m backend

# Database query
docker-compose -f docker-compose.prod.yml exec mysql mysql \
  -u vpn_user -p$DB_PASS vpn_management -e "SHOW STATUS;"

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Full reset (CAUTION)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d --build
```

## Performance Optimization

### Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_expires_at ON users(expires_at);
```

### Nginx Caching
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    proxy_pass http://backend;
}
```

### Connection Pooling
Configure in application code for production.

## Next Steps

After successful deployment:
1. Setup monitoring (Prometheus, Grafana)
2. Configure log aggregation (ELK Stack)
3. Setup CI/CD pipeline (GitHub Actions)
4. Plan disaster recovery
5. Document procedures

---

**Deployment Complete!** ✅

For detailed information, see README.md and DOCKER_SETUP.md
