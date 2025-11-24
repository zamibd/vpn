# 🐳 Docker সম্পূর্ণ সেটআপ - VPN Management System

## ✅ Docker সম্পূর্ণভাবে সেটআপ হয়েছে!

আপনার VPN Management System এখন সম্পূর্ণভাবে **Dockerized** এবং production-ready।

---

## 📦 তৈরি করা হয়েছে এমন ফাইল

### Docker Configuration Files

```
✅ Dockerfile                 - Multi-stage build করে optimized image
✅ docker compose.yml         - Development/standard setup
✅ docker compose.prod.yml    - Production-grade configuration
✅ docker compose.override.yml- Development overrides
✅ nginx.conf                 - Reverse proxy & static files
✅ .dockerignore             - Build context অপটিমাইজেশন
✅ .env.example              - Environment template
```

### Documentation Files

```
✅ DOCKER_SETUP.md           - বিস্তারিত Docker সেটআপ গাইড
✅ DOCKER_QUICKREF.md        - দ্রুত রেফারেন্স কমান্ড
✅ DEPLOYMENT.md             - সম্পূর্ণ ডিপ্লয়মেন্ট গাইড
✅ PROJECT_SUMMARY.md        - প্রকল্প সারসংক্ষেপ
✅ QUICK_START.md            - দ্রুত শুরু গাইড
```

---

## 🚀 তাৎক্ষণিক শুরু করুন (৩০ সেকেন্ড)

### ধাপ ১: Docker চালু করুন
```bash
cd /Users/imzami/Desktop/Project/vpn
docker compose up -d
```

### ধাপ ২: অপেক্ষা করুন (২০ সেকেন্ড)
MySQL স্বাস্থ্যকর হওয়ার জন্য অপেক্ষা করুন...

### ধাপ ৩: ব্রাউজারে খুলুন
```
http://localhost
```

### ধাপ ৪: লগইন করুন
```
Username: 123456
Password: 654321
```

**সম্পন্ন! 🎉**

---

## 🏗️ আর্কিটেকচার

```
┌─────────────────────────────────────────────────────┐
│                   আপনার ব্রাউজার                      │
│                  http://localhost                   │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Nginx (Port 80)       │
        │  Reverse Proxy          │
        │  Static Files Serve     │
        └────┬─────────────┬──────┘
             │             │
        ┌────▼────┐  ┌─────▼──────┐
        │ Backend  │  │  Frontend  │
        │ API      │  │   Assets   │
        │ (8080)   │  │  (html/js) │
        └────┬─────┘  └────────────┘
             │
        ┌────▼────────────┐
        │   MySQL (3306)  │
        │   ডাটাবেস        │
        └─────────────────┘
```

---

## 📊 তিনটি Docker Services

### 1. **MySQL Database** (`vpn-mysql`)
- **Image:** mysql:8.0
- **Port:** 3306
- **Volume:** mysql_data (persistent)
- **Status:** স্বয়ংক্রিয় স্বাস্থ্য পরীক্ষা
- **সম্পর্ক:** Backend এর জন্য অপেক্ষা করে

### 2. **Go Backend** (`vpn-backend`)
- **Image:** Custom (Dockerfile থেকে built)
- **Port:** 8080
- **সম্পর্ক:** MySQL এর পরে শুরু হয়
- **পরিবেশ:** সব API config সহ
- **স্বাস্থ্য:** API endpoint দ্বারা পরীক্ষা করা হয়

### 3. **Nginx Reverse Proxy** (`vpn-nginx`)
- **Image:** nginx:alpine
- **Port:** 80 (HTTP), 443 (HTTPS)
- **ভূমিকা:** Frontend serve + API proxy
- **সম্পর্ক:** Backend সুস্থ হওয়ার পর শুরু হয়
- **SSL:** Production এর জন্য প্রস্তুত

---

## 🔧 কনফিগারেশন অপশন

### Development মোড (ডিফল্ট)
```bash
docker compose up -d
```
- Local development এর জন্য
- সহজ debugging
- দ্রুত reload

### Production মোড
```bash
docker compose -f docker compose.prod.yml up -d
```
- Resource limits সহ
- Logging configured
- Optimized settings

---

## 📋 সব কমান্ড রেফারেন্স

### শুরু এবং বন্ধ করুন

| কমান্ড | বর্ণনা |
|--------|--------|
| `docker compose up -d` | সব সেবা শুরু করুন |
| `docker compose down` | সব সেবা বন্ধ করুন |
| `docker compose restart` | সব পুনরায় শুরু করুন |
| `docker compose ps` | স্থিতি দেখুন |

### লগ এবং ডিবাগিং

| কমান্ড | বর্ণনা |
|--------|--------|
| `docker compose logs -f` | রিয়েল-টাইম সব লগ |
| `docker compose logs -f backend` | Backend লগ |
| `docker compose logs -f mysql` | MySQL লগ |
| `docker compose logs -f nginx` | Nginx লগ |
| `docker compose logs --tail=50 backend` | শেষ ৫০ লাইন |

### Build এবং আপডেট

| কমান্ড | বর্ণনা |
|--------|--------|
| `docker compose build` | সব images rebuild করুন |
| `docker compose build --no-cache backend` | Cache ছাড়া rebuild |
| `docker compose up -d --build` | Build করে শুরু করুন |

### ডাটাবেস অপারেশন

| কমান্ড | বর্ণনা |
|--------|--------|
| `docker compose exec mysql mysql -u vpn_user -pvpn_password vpn_management` | MySQL CLI |
| `docker compose exec mysql mysqldump ... > backup.sql` | Backup নিন |
| `docker compose exec mysql mysql ... < backup.sql` | Restore করুন |

### Container প্রবেশ করুন

| কমান্ড | বর্ণনা |
|--------|--------|
| `docker compose exec backend sh` | Backend shell |
| `docker compose exec mysql bash` | MySQL shell |
| `docker compose exec nginx sh` | Nginx shell |

---

## 🌐 URLs এবং পোর্ট

| সেবা | URL | পোর্ট | বর্ণনা |
|------|-----|-------|--------|
| Frontend | http://localhost | 80 | Nginx দ্বারা serve |
| Backend API | http://localhost:8080 | 8080 | সরাসরি API প্রবেশ |
| MySQL | localhost:3306 | 3306 | ডাটাবেস সংযোগ |
| HTTPS | https://localhost | 443 | Production (SSL configure করার পর) |

---

## 🔐 Environment ভেরিয়েবল

### .env ফাইল (Development)
```env
DB_HOST=mysql
DB_PORT=3306
DB_USER=vpn_user
DB_PASS=vpn_password
DB_NAME=vpn_management
PORT=8080
JWT_SECRET=your-secret-key
```

### Production এর জন্য পরিবর্তন করুন:
```env
DB_PASS=strong_password_with_special_chars
JWT_SECRET=long_random_secret_key
```

---

## 📊 ভলিউম এবং ডেটা স্থায়িত্ব

### MySQL ডেটা ভলিউম
```bash
docker volume ls                    # সব volumes দেখুন
docker volume inspect vpn_mysql_data # বিস্তারিত দেখুন
```

### ডেটা ব্যাকআপ করুন
```bash
# ডাটাবেস backup
docker compose exec mysql mysqldump \
  -u vpn_user -pvpn_password vpn_management > backup.sql

# সংকুচিত
gzip backup.sql
```

### ডেটা পুনরুদ্ধার করুন
```bash
gunzip backup.sql.gz
docker compose exec mysql mysql \
  -u vpn_user -pvpn_password vpn_management < backup.sql
```

---

## 🧪 API টেস্টিং

### সব প্যাকেজ পান
```bash
curl http://localhost:8080/api/packages
```

### লগইন করুন
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"123456","password":"654321"}'
```

### প্রোফাইল পান (Token দিয়ে)
```bash
curl -H "Authorization: Bearer TOKEN_HERE" \
  http://localhost:8080/api/user/profile
```

---

## 🔄 আপডেট এবং পুনর্নিযুক্তি

### কোড আপডেট করুন
```bash
# নতুন কোড pull করুন
git pull origin main

# Backend rebuild করুন
docker compose build backend

# নতুন version দিয়ে চালু করুন
docker compose up -d backend
```

### সম্পূর্ণ নতুন ডিপ্লয়মেন্ট
```bash
docker compose down
docker system prune -a
docker compose up -d --build
```

---

## 🚨 সমস্যা সমাধান

### সমস্যা: Container start হচ্ছে না
```bash
# ধাপ ১: লগ দেখুন
docker compose logs backend

# ধাপ ২: Environment check করুন
docker compose config

# ধাপ ৩: Volume মুছুন এবং পুনরায় শুরু করুন
docker compose down -v
docker compose up -d
```

### সমস্যা: MySQL Connection Error
```bash
# MySQL চলছে কি যাচাই করুন
docker compose ps mysql

# Health check পরীক্ষা করুন
docker compose exec mysql mysqladmin ping
```

### সমস্যা: Port ব্যবহৃত
```bash
# Port খুঁজুন
lsof -i :80
lsof -i :8080

# Docker compose এ পোর্ট পরিবর্তন করুন
# ports:
#   - "8081:8080"
```

### সমস্যা: Nginx 502 Bad Gateway
```bash
# Backend চলছে কি যাচাই করুন
docker compose ps backend

# Backend logs দেখুন
docker compose logs backend

# Nginx config পরীক্ষা করুন
docker compose exec nginx nginx -t
```

---

## 📈 মনিটরিং এবং মেট্রিক্স

### Real-time মনিটরিং
```bash
docker stats
docker stats vpn-backend vpn-mysql vpn-nginx
```

### Docker Events দেখুন
```bash
docker events --filter type=container
```

### ডিস্ক স্পেস ব্যবহার
```bash
docker system df
docker volume inspect vpn_mysql_data
```

---

## 🎯 উৎপাদন চেকলিস্ট

```
প্রাক-ডিপ্লয়মেন্ট:
☐ সব কোড টেস্ট করা হয়েছে
☐ Environment variables সেট করা হয়েছে
☐ ডাটাবেস ব্যাকআপ তৈরি করা হয়েছে
☐ SSL সার্টিফিকেট প্রস্তুত
☐ Docker installed এবং running

ডিপ্লয়মেন্ট:
☐ docker compose.prod.yml দিয়ে চালু করুন
☐ সব সেবা স্বাস্থ্যকর চেক করুন
☐ API endpoints পরীক্ষা করুন
☐ Logs স্বাভাবিক দেখছে নিশ্চিত করুন

পোস্ট-ডিপ্লয়মেন্ট:
☐ ব্যবহারকারী লগইন পরীক্ষা করুন
☐ Monitoring সেটআপ করুন
☐ Backup automation সেটআপ করুন
☐ Alert notification সেটআপ করুন
```

---

## 💡 টিপস এবং ট্রিকস

### দ্রুত ডিবাগিং
```bash
# একটি কমান্ড চালান container এ
docker compose exec backend sh -c "command here"

# Multiple কমান্ড
docker compose exec backend sh -c "cd /app && go version"
```

### Performance অপটিমাইজেশন
```bash
# Image size কমান
docker image prune -a

# Unused volumes সরান
docker volume prune

# Network cleanup
docker network prune
```

### ডেভেলপমেন্ট কৌশল
```bash
# Hot reload সহ build
docker compose build --no-cache
docker compose up -d

# Log streaming এর সাথে
docker compose up -d && docker compose logs -f
```

---

## 📚 ফাইল রেফারেন্স

### প্রধান Docker ফাইল

| ফাইল | উদ্দেশ্য |
|------|---------|
| `Dockerfile` | Backend image build করা |
| `docker compose.yml` | Development orchestration |
| `docker compose.prod.yml` | Production orchestration |
| `nginx.conf` | Reverse proxy config |
| `.dockerignore` | Build context optimization |

### ডকুমেন্টেশন

| ফাইল | বিষয় |
|------|------|
| `DOCKER_SETUP.md` | বিস্তারিত সেটআপ |
| `DOCKER_QUICKREF.md` | দ্রুত কমান্ড |
| `DEPLOYMENT.md` | উৎপাদন গাইড |
| `DOCKER_COMPLETE.md` | এই ফাইল |

---

## 🎓 পরবর্তী শেখার বিষয়

1. **Kubernetes:** Docker থেকে K8s এ মাইগ্রেশন
2. **CI/CD:** GitHub Actions সহ automated deployment
3. **Monitoring:** Prometheus + Grafana সেটআপ
4. **Logging:** ELK Stack একীকরণ
5. **Scaling:** Multiple instances load balancing

---

## ✨ আপনি সম্পন্ন করেছেন!

```
✅ Backend API - Dockerized
✅ Frontend - Nginx এ serve
✅ Database - MySQL container
✅ Documentation - সম্পূর্ণ এবং বিস্তারিত
✅ Production Ready - সব configuration সহ
```

## 🚀 এখন কী করতে হবে?

```bash
# সেবা শুরু করুন
docker compose up -d

# লগ মনিটর করুন
docker compose logs -f

# ব্রাউজারে খুলুন
# http://localhost
```

---

**Happy Dockering! 🐳✨**

**সাপোর্ট প্রয়োজন? DOCKER_QUICKREF.md দেখুন!**
