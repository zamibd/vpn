# Docker দ্রুত রেফারেন্স (Quick Reference)

## ⚡ সবচেয়ে গুরুত্বপূর্ণ কমান্ড

### শুরু করুন
```bash
docker compose up -d
```

### লগ দেখুন
```bash
docker compose logs -f
```

### বন্ধ করুন
```bash
docker compose down
```

### স্থিতি যাচাই করুন
```bash
docker compose ps
```

---

## 🚀 এক মিনিটে শুরু করুন

```bash
# প্রকল্পে যান
cd /Users/imzami/Desktop/Project/vpn

# সব চালু করুন
docker compose up -d

# ব্রাউজারে খুলুন
# http://localhost

# লগইন করুন
# Username: 123456
# Password: 654321
```

**এটাই! আপনার VPN সিস্টেম চলছে! 🎉**

---

## 📋 তিনটি সেবা

| সেবা | পোর্ট | URL | বর্ণনা |
|------|--------|-----|--------|
| Nginx | 80 | http://localhost | ফ্রন্টএন্ড + API প্রক্সি |
| Backend | 8080 | http://localhost:8080 | Go API সার্ভার |
| MySQL | 3306 | localhost:3306 | ডাটাবেস |

---

## 🛠️ সাধারণ কমান্ড

| কাজ | কমান্ড |
|------|--------|
| **সব শুরু করুন** | `docker compose up -d` |
| **সব বন্ধ করুন** | `docker compose down` |
| **লগ দেখুন** | `docker compose logs -f` |
| **Backend লগ** | `docker compose logs -f backend` |
| **MySQL লগ** | `docker compose logs -f mysql` |
| **Restart করুন** | `docker compose restart` |
| **নির্দিষ্ট সেবা রিস্টার্ট** | `docker compose restart backend` |
| **Backend rebuild** | `docker compose build backend` |
| **সবকিছু rebuild** | `docker compose build` |
| **Status দেখুন** | `docker compose ps` |

---

## 🔧 Container এ প্রবেশ করুন

```bash
# Backend shell
docker compose exec backend sh

# MySQL CLI
docker compose exec mysql mysql -u vpn_user -pvpn_password vpn_management

# Nginx shell
docker compose exec nginx sh
```

---

## 🗄️ ডাটাবেস অপারেশন

```bash
# ব্যবহারকারী দেখুন
docker compose exec mysql mysql -u vpn_user -pvpn_password vpn_management \
  -e "SELECT id, username, role, status FROM users;"

# নতুন admin তৈরি করুন
docker compose exec mysql mysql -u vpn_user -pvpn_password vpn_management \
  -e "INSERT INTO users (username, password, email, role, expires_at) VALUES ('654321', '123456', 'admin2@vpn.local', 'admin', '2099-12-31');"

# Backup নিন
docker compose exec mysql mysqldump -u vpn_user -pvpn_password vpn_management > backup.sql

# Backup পুনরুদ্ধার করুন
docker compose exec mysql mysql -u vpn_user -pvpn_password vpn_management < backup.sql
```

---

## 🧪 API টেস্টিং

```bash
# প্যাকেজ পান
curl http://localhost:8080/api/packages

# লগইন করুন
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"123456","password":"654321"}'

# প্রোফাইল পান (TOKEN দিয়ে)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/user/profile
```

---

## 📊 Performance চেক করুন

```bash
# CPU এবং মেমরি
docker stats

# নির্দিষ্ট container
docker stats vpn-backend vpn-mysql
```

---

## 🧹 পরিষ্কার করুন

```bash
# সব বন্ধ করুন এবং ভলিউম মুছুন
docker compose down -v

# সব Docker garbage সাফ করুন
docker system prune -a

# শুধু অব্যবহৃত image মুছুন
docker image prune -a
```

---

## 🔍 সমস্যা সমাধান

| সমস্যা | সমাধান |
|--------|--------|
| **Container start হচ্ছে না** | `docker compose logs backend` দেখুন |
| **MySQL connect error** | `docker compose ps mysql` যাচাই করুন |
| **Port ইতিমধ্যে ব্যবহৃত** | `lsof -i :80` দিয়ে খুঁজুন |
| **API response না দেওয়া** | `curl http://localhost:8080/api/packages` পরীক্ষা করুন |
| **Frontend load না হওয়া** | Nginx logs দেখুন: `docker compose logs nginx` |

---

## 🎯 উৎপাদনের জন্য

```bash
# Production compose file দিয়ে চালু করুন
docker compose -f docker compose.prod.yml up -d

# Production logs
docker compose -f docker compose.prod.yml logs -f

# Production down
docker compose -f docker compose.prod.yml down
```

---

## 📱 মোবাইলে টেস্ট করুন

আপনার মোবাইল থেকে:
```
http://YOUR_COMPUTER_IP:80
```

যেমন: `http://192.168.1.100`

---

## ⏰ দৈনিক কাজ

### সকাল - সেবা শুরু করুন
```bash
docker compose up -d
```

### দিনের মধ্য - লগ মনিটর করুন
```bash
docker compose logs -f
```

### সন্ধ্যা - গতি চেক করুন
```bash
docker stats
```

### রাত - ব্যাকআপ নিন
```bash
docker compose exec mysql mysqldump -u vpn_user -pvpn_password vpn_management > backup-$(date +%Y%m%d).sql
```

---

## 💡 টিপস

✅ **Pro Tips:**
- সবসময় `docker compose.yml` এ কমান্ড চালান
- সর্বদা লগ মনিটর করুন
- নিয়মিত ব্যাকআপ নিন
- পরিবর্তনের আগে backup তৈরি করুন

---

## 🆘 জরুরি সাহায্য

```bash
# সবকিছু সম্পূর্ণ রিসেট করুন (সাবধান!)
docker compose down -v
docker system prune -a
docker compose up -d

# Logs দেখুন
docker compose logs --tail=50 backend
```

---

**Happy Dockerizing! 🐳**
