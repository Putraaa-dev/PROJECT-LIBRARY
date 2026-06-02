# 🚀 Panduan Deploy ke Hostinger

## 📋 Prasyarat

1. Akun Hostinger dengan Node.js support
2. MongoDB Atlas account (cloud database)
3. Git installed
4. npm/Node.js v16+ (local)

---

## 🔧 Persiapan Lokal (Sebelum Push)

### 1. Build Frontend untuk Production

```bash
npm install
npm run build
```

Ini akan membuat folder `dist/` berisi file static React yang sudah dioptimalkan.

### 2. Verifikasi Setup

```bash
# Test production build lokal
npm start
# Buka http://localhost:3000
```

---

## 📤 Deploy ke Hostinger

### Opsi A: Menggunakan Git (Recommended)

#### 1. Di Hostinger Control Panel

1. Buka **Advanced → Git**
2. Klik **Setup Git Repository**
3. Pilih branch: `main` (atau branch Anda)
4. Set **Build Command:**
   ```
   npm install && npm run build
   ```
5. Set **Start Command:**
   ```
   npm start
   ```
6. Salin clone URL yang diberikan

#### 2. Di Local Machine

```bash
# Tambah remote Hostinger
git remote add hostinger <CLONE_URL_DARI_HOSTINGER>

# Push ke Hostinger
git push -u hostinger main
```

Hostinger akan otomatis:
- Menjalankan `npm install && npm run build`
- Menjalankan `npm start`
- Deploy aplikasi Anda ✅

### Opsi B: Upload Manual (via cPanel)

1. Siapkan local:
   ```bash
   npm install
   npm run build
   npm prune --production  # Remove dev dependencies
   ```

2. Zip folder project (exclude: `node_modules/`, `.git`, `.env.local`)

3. Upload via File Manager:
   - Extract ke public_html
   - SSH ke server:
     ```bash
     cd public_html
     npm install --production
     npm start
     ```

---

## 🔑 Environment Variables di Hostinger

### 1. Via SSH Terminal

```bash
nano .env.local
```

Tambahkan:
```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
MONGODB_DB=librarytogether
VITE_API_URL=
PORT=3000
NODE_ENV=production
MONGODB_TLS_ALLOW_INVALID_CERTS=false
```

**ATAU**

### 2. Via Hostinger Control Panel

Jika tersedia di panel, set environment variables di:
- Advanced → Node.js → Environment Variables

---

## 📦 Konfigurasi MongoDB Atlas

### 1. Setup MongoDB Atlas Connection

1. Buka [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Login/Register
3. Create Project → Create Cluster
4. Pilih AWS, Region terdekat (Indonesia: ap-southeast-1)
5. M0 Free tier sudah cukup untuk awal

### 2. Setup Database User

1. Click **Security → Database Access**
2. Add Database User:
   - Username: `rizkiputrastudy_db_user`
   - Password: (gunakan password yang aman)
   - Role: `readWriteAnyDatabase`

### 3. Get Connection String

1. Click **Deployment → Clusters → Connect**
2. Pilih **Drivers → Node.js**
3. Copy connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
   ```

4. Replace USERNAME, PASSWORD, DATABASE_NAME
5. Paste ke `.env.local` sebagai `MONGODB_URI`

### 4. Add Hostinger IP to Whitelist

1. Click **Security → Network Access**
2. Add IP Address
3. Masukkan IP server Hostinger Anda
4. Atau Allow from anywhere: `0.0.0.0/0` (less secure, but works)

---

## 🗂️ Struktur Folder di Hostinger

```
/public_html/
├── api/                    # Backend endpoints
├── src/                    # React source (hanya diperlukan saat build)
├── dist/                   # Compiled frontend (serve otomatis)
├── node_modules/           # Dependencies
├── server.js               # Express server
├── package.json
├── .env.local              # Environment variables
├── vite.config.ts
└── .htaccess               # URL rewriting
```

---

## ✅ Verification Checklist

Setelah deploy, pastikan:

- [ ] Website bisa diakses via domain
- [ ] API endpoints berjalan: `https://yourdomain.com/api/books`
- [ ] Login/Register berfungsi
- [ ] Database terkoneksi (cek di logs)
- [ ] Tidak ada CORS errors

### Troubleshooting Commands:

```bash
# SSH ke server Hostinger
ssh username@your_server_ip

# Cek logs
pm2 logs  # atau tail -f ~/.pm2/logs/error.log

# Restart aplikasi
npm start

# Cek processes
ps aux | grep node

# Cek port
lsof -i :3000
```

---

## 🔍 Database Fallback

Jika MongoDB tidak terhubung, aplikasi akan **otomatis fallback** ke in-memory database dengan data default. Tapi data akan hilang setiap kali server restart.

Untuk production: **Pastikan MongoDB URI terkonfigurasi dengan benar.**

---

## 📊 Monitoring & Maintenance

### Setup PM2 (Process Manager)

```bash
npm install -g pm2

# Start dengan PM2
pm2 start server.js --name "perpustakaan"

# Startup on boot
pm2 startup
pm2 save
```

### Setup Log Rotation

```bash
pm2 install pm2-logrotate
```

---

## 🔒 Security Tips

1. **Jangan commit `.env.local`** - gunakan `.env.example` untuk template
2. **Update Node.js & npm** secara berkala
3. **Enable HTTPS** di Hostinger (SSL Certificate)
4. **Set strong MongoDB password**
5. **Restrict IP access** jika memungkinkan
6. **Backup database** secara regular

---

## 📞 Support

- **Hostinger Docs:** https://support.hostinger.com/en/articles/4518477-how-to-deploy-a-node-js-application
- **MongoDB Docs:** https://docs.mongodb.com/manual/
- **Vite Build Guide:** https://vitejs.dev/guide/build.html

---

## 🎯 Quick Checklist untuk Deploy Hari Ini

```bash
# 1. Build
npm run build

# 2. Commit & Push
git add .
git commit -m "Ready for production"
git push hostinger main

# 3. SSH ke server & setup .env
# 4. Tunggu Hostinger selesai setup
# 5. Test di browser
# 6. Check logs jika ada error

echo "✅ Deploy complete!"
```

---

**Last updated:** June 2, 2026
