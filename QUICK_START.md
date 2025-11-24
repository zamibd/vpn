# Quick Start Guide - VPN Management System

## 30-Second Setup

### Step 1: Start Docker Services
```bash
cd /Users/imzami/Desktop/Project/vpn
docker-compose up -d
```

### Step 2: Wait for MySQL (20 seconds)
MySQL will initialize automatically with the schema.

### Step 3: Open Browser
```
https://bdtunnel.com
```

### Step 4: Login
```
Username: 123456
Password: 654321
```

**Done!** 🎉

---

## Detailed Setup

### Prerequisites
- Docker installed and running
- Docker Compose v1.29+
- Port 80, 443, 8080 available

### Installation

```bash
# Navigate to project directory
cd /Users/imzami/Desktop/Project/vpn

# Start all services
docker-compose up -d

# Verify services started
docker-compose ps
```

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | https://bdtunnel.com | Web interface |
| Backend API | https://bdtunnel.com/api | Direct API access |
| MySQL | localhost:3306 | Database |

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | 123456 | 654321 |

## Common Operations

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f nginx
```

### Stop Services
```bash
docker-compose stop
```

### Restart Services
```bash
docker-compose restart
```

### Complete Shutdown
```bash
docker-compose down
```

### Full Reset (WARNING: Deletes data)
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## Environment Setup

Edit `.env` file for configuration:

```env
DB_HOST=mysql
DB_PORT=3306
DB_USER=vpn_user
DB_PASS=vpn_password
DB_NAME=vpn_management
PORT=8080
JWT_SECRET=your-secret-key-change-this-in-production
ENV=development
```

## First Steps After Login

1. **Admin Dashboard**
   - View all users
   - Suspend/activate users
   - Manage reseller quotas

2. **Create Reseller**
   - Set user creation quota
   - Monitor reseller activity

3. **Reseller Creates Users**
   - Select expiry period (1/3/6/12 months)
   - Auto-generated username and password
   - Share credentials with users

## Troubleshooting

### Services Won't Start
```bash
docker-compose logs
# Check for port conflicts or database connection errors
```

### Can't Connect to MySQL
```bash
docker-compose ps mysql
# Ensure MySQL container is healthy
```

### Port Already in Use
```bash
# Change in .env file
PORT=8090
# Restart services
docker-compose restart
```

### Database Not Initialized
```bash
docker-compose exec mysql mysql -u vpn_user -pvpn_password vpn_management \
  < database/schema.sql
```

## API Testing

### Get Packages
```bash
curl https://bdtunnel.com/api/packages
```

### Login Request
```bash
curl -X POST https://bdtunnel.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"123456","password":"654321"}'
```

### Get Profile (with token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://bdtunnel.com/api/user/profile
```

## Next Steps

- Read `DOCKER_SETUP.md` for detailed Docker information
- Check `DEPLOYMENT.md` for production setup
- Review `DOCKER_COMPLETE.md` for complete reference

## Support

For detailed information, see:
- `README.md` - Project overview
- `DOCKER_SETUP.md` - Docker guide
- `DEPLOYMENT.md` - Production deployment

---

**That's it! You're ready to go.** 🚀
