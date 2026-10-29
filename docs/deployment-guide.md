# دليل النشر والاستضافة السحابية
## Enterprise Cloud Deployment and Infrastructure Guide

---

## 1. البنية الطوبولوجية للنظام في بيئة الإنتاج (Production Topology)

تم تصميم النظام ببنية برمجية مفصولة بالكامل (Decoupled Architecture) تتيح التوسع المستقل لكل طبقة:

```text
[ Client Browsers / Mobile Devices ]
                 │
                 ▼ (HTTPS / TLS 1.3)
 ┌────────────────────────────────────────┐
 │   Vercel Edge Network (Next.js 14)     │
 │   - Static Generation & Edge Caching   │
 │   - Frontend Dashboard (App Router)    │
 └──────────────────┬─────────────────────┘
                    │
                    │ REST API Calls (JWT Bearer)
                    ▼
 ┌────────────────────────────────────────┐
 │   Render / Ubuntu Cloud VPS            │
 │   - Nginx Reverse Proxy (SSL Term.)    │
 │   - PHP 8.2+ FPM Runtime Engine        │
 │   - Geofence & Haversine Math Core     │
 └──────────────────┬─────────────────────┘
                    │
                    │ PDO MySQL (Port 3306)
                    ▼
 ┌────────────────────────────────────────┐
 │   Managed MySQL 8.0 Database           │
 │   - ACID Transactions & Strict Schema  │
 │   - Automated Daily Encrypted Backups  │
 └────────────────────────────────────────┘
```

---

## 2. جدول متغيرات البيئة السرية (Environment Variables Reference)

### 2.1. الواجهة الأمامية (`frontend/.env.production`)

| اسم المتغير | الوصف الفني | مثال القيمة |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | عنوان مسار الـ API الخلفي للإنتاج | `https://api.attend.company.com/api` |
| `NEXT_PUBLIC_APP_ENV` | بيئة التشغيل | `production` |

---

### 2.2. الخادم الخلفي (`backend/.env`)

| اسم المتغير | الوصف الفني | مثال القيمة |
| :--- | :--- | :--- |
| `APP_ENV` | بيئة العمل (تعطل المحاكاة وتفعل الأمان) | `production` |
| `APP_KEY` | المفتاح السري لتوقيع توكنات الـ JWT (64 محرفاً عشوائياً) | `base64:4F8k90wL...` |
| `DB_HOST` | عنوان مضيف قاعدة البيانات | `127.0.0.1` أو عنوان المزود السحابي |
| `DB_PORT` | منفذ اتصال MySQL | `3306` |
| `DB_DATABASE` | اسم قاعدة البيانات | `smart_attendance_db` |
| `DB_USERNAME` | اسم مستخدم قاعدة البيانات | `attend_user` |
| `DB_PASSWORD` | كلمة مرور قاعدة البيانات القوية | `StrongComplexPass2026!` |
| `ALLOW_SIMULATION` | تعطيل أزرار ومحاكاة الإحداثيات الوهمية | `false` |
| `MAX_ALLOWED_ACCURACY_METERS` | الحد الأقصى المقبول لدقة إشارة الـ GPS | `50.0` |
| `CORS_ALLOWED_ORIGINS` | النطاقات المصرح لها بالاتصال بالـ API | `https://attend.company.com,https://attend.vercel.app` |

---

## 3. خطوات نشر الواجهة الأمامية على منصة Vercel

1. **ربط مستودع الكود (Git Repository Connection):**
   - تسجيل الدخول إلى لوحة تحكم [Vercel](https://vercel.com).
   - النقر على **Add New Project** واختيار مستودع المشروع.
2. **ضبط مسار المشروع (Root Directory):**
   - اختيار المجلد الفرعي: `frontend`.
3. **ضبط إعدادات البناء (Build Settings):**
   - Framework Preset: `Next.js`.
   - Build Command: `next build`.
   - Output Directory: `.next`.
   - Install Command: `npm install`.
4. **حقن متغيرات البيئة (Environment Variables):**
   - إضافة المتغير:
     - `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com/api`
     - `NEXT_PUBLIC_APP_ENV` = `production`
5. **النشر والتشغيل (Deploy):**
   - النقر على **Deploy**. سيقوم Vercel ببناء الواجهة وتوليد الحزم الثابتة مع التوزيع عبر شبكة Edge CDN العالمية.

---

## 4. خطوات نشر الخادم الخلفي على Render أو سيرفر سحابي (Ubuntu VPS / Nginx)

### الخيار الأول: النشر عبر منصة Render (Docker Web Service)

1. إنشاء ملف `Dockerfile` في مسار `backend/`:
   ```dockerfile
   FROM php:8.2-fpm-alpine
   RUN apk add --no-cache nginx libpng-dev libzip-dev oniguruma-dev curl-dev
   RUN docker-php-ext-install pdo pdo_mysql mbstring gd curl
   WORKDIR /var/www/html
   COPY . /var/www/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 8000
   CMD php-fpm -D && nginx -g "daemon off;"
   ```
2. في لوحة تحكم Render: اختيار **New Web Service**، وتحديد المستودع والمجلد `backend`.
3. إضافة متغيرات البيئة المذكورة في البند 2.2 داخل تبويب **Environment**.

---

### الخيار الثاني: النشر على سيرفر سحابي مخصص (Ubuntu 22.04 LTS VPS)

1. **تحديث الحزم وتثبيت البرمجيات الأساسية:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y nginx php8.2-fpm php8.2-mysql php8.2-curl php8.2-mbstring php8.2-xml git ufw
   ```

2. **تجهيز مجلد المشروع وسحب الكود:**
   ```bash
   sudo mkdir -p /var/www/attend-backend
   sudo git clone https://github.com/your-org/attend.git /var/www/attend-backend
   sudo chown -R www-data:www-data /var/www/attend-backend
   sudo chmod -R 755 /var/www/attend-backend
   ```

3. **إعداد جدار الحماية (UFW Firewall):**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow OpenSSH
   sudo ufw enable
   ```

4. **تكوين خادم Nginx (`/etc/nginx/sites-available/attend-api`):**
   ```nginx
   server {
       listen 80;
       server_name api.attend.company.com;
       root /var/www/attend-backend/backend;

       index server.php index.php;

       # إخفاء ملفات البيئة والملفات الخفية
       location ~ /\. {
           deny all;
           access_log off;
           log_not_found off;
       }

       # ترويسات الأمان العامة و CORS
       add_header X-Frame-Options "DENY" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;

       location / {
           try_files $uri $uri/ /server.php?$query_string;
       }

       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           include fastcgi_params;
           fastcgi_read_timeout 60s;
       }
   }
   ```

5. **تفعيل الموقع وإعادة تشغيل Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/attend-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **تثبيت شهادة الأمان SSL المجانية عبر Let's Encrypt:**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api.attend.company.com --non-interactive --agree-tos -m admin@company.com
   ```

---

## 5. تجهيز قاعدة البيانات وإنشاء الجداول (Database Setup & Seeding)

1. **إنشاء قاعدة البيانات ومستخدم النظام:**
   ```sql
   CREATE DATABASE smart_attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'attend_user'@'localhost' IDENTIFIED BY 'StrongComplexPass2026!';
   GRANT ALL PRIVILEGES ON smart_attendance_db.* TO 'attend_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **استيراد المخطط الهيكلي:**
   ```bash
   mysql -u attend_user -p smart_attendance_db < backend/database/schema.sql
   ```

3. **حسابات النظام الافتراضية الجاهزة للاختبار:**
   - **حساب المدير (Owner):** `owner@company.com` / كلمة المرور: `password123`
   - **حساب الموظف الأول (Employee):** `ahmed@company.com` / كلمة المرور: `password123`

---

## 6. قائمة التحقق النهائية قبل الإطلاق (Production Go-Live Checklist)

- [x] شهادة الأمان (SSL/TLS 1.3) مفعلة على كل من الدومين الأمامي والخلفي مع إجبار التحويل التلقائي لـ HTTPS.
- [x] ترويسات الـ CORS مقيدة حصرياً بعنوان دومين الـ Frontend المسجل ولا تقبل `*`.
- [x] المتغير `ALLOW_SIMULATION` مضبوط على `false` لمنع تجاوز فحص الـ GPS الحقيقي.
- [x] المنفذ `3306` لقاعدة البيانات محمي ومغلق عن الوصول الخارجي (مقتصر على `localhost` أو الشبكة الداخلية الخاصة VPC).
- [x] تفعيل النسخ الاحتياطي التلقائي اليومي (Automated Backup) لقاعدة بيانات MySQL عبر Cron Job.
- [x] توقيت السيرفر مضبوط بدقة ومربوط بخوادم NTP مع تحديد المنطقة الزمنية المعيارية للشركة (مثال: `Africa/Cairo` / `Asia/Riyadh`).

