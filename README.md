# VPN Management System

A complete VPN package sales and management system built with Go, MySQL, and HTML/CSS/JavaScript.

## Features

### User Roles
- **Admin**: Full control - manage all users, set reseller quotas
- **Reseller**: Create users up to the quota set by admin
- **User**: Login and view their own data

### User Account Features
- Auto-generated 6-digit username
- Auto-generated 6-digit password
- Multiple expiry options: 1 month, 3 months, 6 months, 12 months
- Automatic suspension/deletion when expired

### VPN Packages
- 1 Month - $2.99
- 3 Months - $7.99
- 6 Months - $14.99
- 12 Months - $27.99

## Technology Stack

### Backend
- Go 1.21+
- Gorilla Mux - HTTP routing
- MySQL/MariaDB - Database
- JWT - Authentication

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- JavaScript (Vanilla)
- Font Awesome 6

### Containerization
- Docker
- Docker Compose
- Nginx (Reverse Proxy)

## Project Structure

```
vpn/
├── backend/              # Go backend API
│   ├── main.go          # Server and routing
│   ├── auth.go          # JWT authentication and middleware
│   └── handlers.go      # API handlers
│
├── frontend/            # Web interface
│   ├── index.html       # Homepage (package showcase)
│   ├── login.html       # Login page
│   ├── dashboard.html   # Main dashboard (3-in-1)
│   ├── css/
│   │   └── style.css    # Styling
│   └── js/
│       ├── app.js       # Homepage logic
│       ├── login.js     # Login logic
│       └── dashboard.js # Dashboard functionality
│
├── database/
│   └── schema.sql       # Database schema and migrations
│
├── Docker files
│   ├── Dockerfile
│   ├── docker compose.yml
│   ├── docker compose.prod.yml
│   ├── docker compose.override.yml
│   └── nginx.conf
│
└── Documentation
    ├── README.md
    ├── QUICK_START.md
    ├── DEPLOYMENT.md
    ├── DOCKER_SETUP.md
    └── .env (environment configuration)
```

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- MySQL 8.0 or MariaDB

### Setup (One Command)

```bash
cd /Users/imzami/Desktop/Project/vpn
docker compose up -d
```

Access the application: `http://localhost`

### Default Admin Credentials
- Username: `123456`
- Password: `654321`

## Environment Configuration

The system uses `.env` file for all sensitive configuration. Key variables:

```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=vpn_user
DB_PASS=vpn_password
DB_NAME=vpn_management

# Server
PORT=8080
JWT_SECRET=your-secret-key-change-this-in-production
```

**Important**: Change `JWT_SECRET` in production!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new account

### User Routes
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/update` - Update profile
- `DELETE /api/user/delete` - Delete account

### Admin Routes
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get user details
- `PUT /api/admin/users/{id}/suspend` - Suspend user
- `PUT /api/admin/users/{id}/activate` - Activate user
- `DELETE /api/admin/users/{id}/delete` - Delete user

### Reseller Routes
- `POST /api/reseller/create-user` - Create new user
- `GET /api/reseller/users` - List own users
- `GET /api/reseller/quota` - Get quota information

### Public Routes
- `GET /api/packages` - Get all VPN packages

## Docker Commands

### Start Services
```bash
docker compose up -d
```

### View Logs
```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f mysql
```

### Check Status
```bash
docker compose ps
```

### Stop Services
```bash
docker compose down
```

### Production Deployment
```bash
docker compose -f docker compose.prod.yml up -d
```

## Database

The system includes automatic database initialization with:
- User management table
- Reseller quota management
- VPN packages catalog
- Activity logging

Default admin user is created during initialization:
- Username: 123456
- Password: 654321

## Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing (upgrade to bcrypt in production)
- Protected API endpoints
- Environment-based configuration

## Production Deployment Checklist

- [ ] Change default admin credentials
- [ ] Update JWT_SECRET to strong value
- [ ] Use bcrypt for password hashing
- [ ] Enable SSL/TLS (HTTPS)
- [ ] Configure firewall rules
- [ ] Setup database backups
- [ ] Enable logging and monitoring
- [ ] Configure rate limiting

## Troubleshooting

### MySQL Connection Error
```bash
docker compose logs mysql
docker compose ps mysql
```

### Backend Not Responding
```bash
docker compose logs backend
curl http://localhost:8080/api/packages
```

### Port Already in Use
```bash
lsof -i :80
lsof -i :8080
# Or change port in .env
```

### Complete Reset
```bash
docker compose down -v
docker system prune -a
docker compose up -d --build
```

## File Descriptions

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage Go application build |
| `docker compose.yml` | Development environment setup |
| `docker compose.prod.yml` | Production environment with resource limits |
| `nginx.conf` | Reverse proxy configuration |
| `.env` | Environment variables and secrets |
| `go.mod` | Go module dependencies |
| `schema.sql` | Database initialization script |

## Testing

### API Testing with cURL

Get packages:
```bash
curl http://localhost:8080/api/packages
```

Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"123456","password":"654321"}'
```

Get user profile (with token):
```bash
curl -H "Authorization: Bearer TOKEN_HERE" \
  http://localhost:8080/api/user/profile
```

## Support Documentation

- `QUICK_START.md` - Quick setup guide
- `DOCKER_SETUP.md` - Docker detailed guide
- `DEPLOYMENT.md` - Production deployment guide
- `DOCKER_COMPLETE.md` - Complete reference

## Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Two-factor authentication
- [ ] Mobile application
- [ ] Advanced reporting
- [ ] Analytics dashboard
- [ ] VPN server management

## License

MIT License

## Support

For issues or questions, refer to the documentation files or check application logs:

```bash
docker compose logs -f
```

---

**Version**: 1.0  
**Last Updated**: November 24, 2025
