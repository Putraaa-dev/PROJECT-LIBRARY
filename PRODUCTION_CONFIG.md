# Production Configuration Guide

## 📋 Hostinger Environment Variables (.env.local)

Setelah deploy ke Hostinger, set environment variables berikut:

### 1. MongoDB Configuration (WAJIB)

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/librarytogether?retryWrites=true&w=majority
MONGODB_DB=librarytogether
```

**Cara mendapatkan:**
1. Login ke MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Go to Deployments → Clusters → Connect
3. Select "Drivers" → "Node.js"
4. Copy connection string
5. Replace USERNAME dan PASSWORD
6. Paste ke `.env.local` di server Hostinger

### 2. API Configuration (Optional)

```env
VITE_API_URL=
```

**Kosongkan jika:**
- Frontend dan backend di host yang sama ✅ (rekomendasi untuk Hostinger)

**Isi dengan URL jika:**
- Frontend dan backend di domain berbeda (e.g., https://yourdomain.com)

### 3. Server Configuration

```env
PORT=3000
NODE_ENV=production
```

**Notes:**
- Hostinger akan automatically assign port
- Jangan ubah PORT jika sudah berjalan

### 4. MongoDB TLS (Optional)

```env
MONGODB_TLS_ALLOW_INVALID_CERTS=false
```

Set `true` hanya jika ada certificate validation errors

### 5. CORS Configuration (Optional)

```env
CORS_ORIGIN=https://yourdomain.com
```

Restrict API access ke domain tertentu (security)

---

## 🔐 MongoDB Atlas Security Checklist

- [ ] Database user created dengan password yang aman
- [ ] IP whitelist ditambahkan:
  - Server Hostinger IP, ATAU
  - Allow anywhere: `0.0.0.0/0` (less secure)
- [ ] Role set to: `readWriteAnyDatabase`
- [ ] Cluster deployment region dipilih (terdekat dengan target users)

---

## 🎯 Hostinger Setup Steps

### Via SSH Terminal

```bash
# 1. SSH ke server
ssh username@your_hostinger_ip

# 2. Navigate ke project
cd public_html

# 3. Create/Edit .env.local
nano .env.local
# Paste environment variables di atas, lalu Ctrl+X, Y, Enter

# 4. Install dependencies
npm install

# 5. Build (jika belum)
npm run build

# 6. Test start
npm start
# Ctrl+C untuk stop

# 7. Setup PM2 (optional tapi recommended)
npm install -g pm2
pm2 start server.js --name "perpustakaan"
pm2 save
pm2 startup
```

### Via Hostinger Panel (jika support)

1. Go to: Hosting → Advanced → Environment Variables
2. Tambahkan variables dari list di atas
3. Save

---

## ✅ Verification

Setelah setup, test:

```bash
# Test API
curl -X GET https://yourdomain.com/api/books

# Should return JSON array of books

# Test Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@perpus.id",
    "password": "admin123"
  }'
```

---

## 🐛 Troubleshooting

### Error: "Missing MongoDB connection URI"

**Solution:**
```bash
# Check if .env.local exists
cat .env.local

# Verify MONGODB_URI is set correctly
# Must start with: mongodb+srv://
```

### Error: "Cannot connect to MongoDB"

**Check:**
1. MongoDB username & password correct?
2. IP address whitelisted in MongoDB Atlas?
3. Database name exists?

**Fix:**
```bash
# Reconnect to MongoDB
pm2 restart perpustakaan
```

### Port already in use

**Solution:**
```bash
# Kill existing process
lsof -i :3000
kill -9 PID

# Or use different port
PORT=3001 npm start
```

### Cannot find dist folder

**Solution:**
```bash
npm run build
```

---

## 🚀 Production Checklist

- [ ] .env.local dengan credentials yang benar
- [ ] npm install selesai
- [ ] npm run build selesai (dist/ folder ada)
- [ ] MongoDB Atlas terhubung
- [ ] IP Hostinger whitelisted di MongoDB
- [ ] Server berjalan tanpa error
- [ ] API endpoints accessible
- [ ] HTTPS enabled di domain
- [ ] SSL certificate configured

---

## 📞 Quick Commands Reference

```bash
# Build
npm run build

# Start development
npm run dev

# Start production
npm start

# Install dependencies
npm install

# Install production only (remove dev deps)
npm install --production

# Check PM2 processes
pm2 list

# View logs
pm2 logs perpustakaan

# Restart app
pm2 restart perpustakaan

# Stop app
pm2 stop perpustakaan
```

---

Last updated: June 2, 2026
