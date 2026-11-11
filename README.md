# NABIL — متجر نبيل للإلكترونيات

موقع كتالوج عربي RTL (بدون شراء أونلاين) + لوحة تحكم إدارية آمنة.
الواجهة: React + Tailwind + Vite | الخلفية: Cloudflare Workers + D1 + R2 (بدون Supabase).

## البنية
- `src/` — الموقع العام + لوحة التحكم (/admin)
- `worker/` — Cloudflare Worker (مصادقة، صلاحيات، رفع صور إلى R2)
- `wrangler.toml` — إعدادات D1 و R2

## النشر عبر GitHub + Cloudflare

### 1) رفع الكود إلى GitHub
```bash
git init && git add . && git commit -m "NABIL store"
git remote add origin https://github.com/YOUR_USER/nabil-store.git
git push -u origin main
```

### 2) قاعدة البيانات D1
```bash
npx wrangler login
npx wrangler d1 create nabil-db
# انسق database_id الناتج إلى wrangler.toml
npx wrangler d1 execute nabil-db --remote --file=worker/schema.sql
```

### 3) تخزين الصور R2
```bash
npx wrangler r2 bucket create nabil-images
```

### 4) نشر الـ API (Workers)
```bash
npx wrangler secret put SESSION_SECRET        # قيمة عشوائية: openssl rand -hex 32
npx wrangler secret put ALLOWED_ORIGINS       # مثال: https://nabil.pages.dev,https://your-domain.com
npx wrangler deploy
# ستحصل على رابط مثل: https://nabil-api.YOUR_SUBDOMAIN.workers.dev
```

### 5) ربط الموقع (Cloudflare Pages)
في لوحة Cloudflare: Workers & Pages → Create → Pages → Connect to Git → اختر المستودع:
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- متغيرات البيئة (Settings → Environment variables):
  - `VITE_API_URL` = رابط الـ Worker من الخطوة 4

عند كل `git push` سيتم نشر الموقع تلقائيًا.

### 6) أول مدير
نفّذ مرة واحدة (استبدل القيم):
```bash
# لتوليد كلمة مرور مشفرة استخدم أي مولّد SHA-256 مع salt، أو:
node -e "
const c=require('crypto');
const salt=c.randomBytes(16).toString('hex');
const hash=c.createHash('sha256').update(salt+':'+'YOUR_PASSWORD').digest('hex');
console.log(salt+':'+hash);
"
# ثم أدخل الناتج:
npx wrangler d1 execute nabil-db --remote --command \
  "INSERT INTO users (id,name,email,password,role) VALUES ('$(uuidgen)','المدير','admin@nabil.dz','SALT:HASH_FROM_ABOVE','admin')"
```

## الأدوار
- **admin**: صلاحيات كاملة + إدارة المستخدمين
- **editor**: المنتجات والتصنيفات والإعدادات فقط
- الصلاحيات مفروضة في الـ Worker (`requireAuth` / `requireAdmin`) وليس فقط في الواجهة.

## تشغيل محلي
```bash
npm install
echo 'SESSION_SECRET=dev-secret-0123456789abcdef' > .dev.vars
npm run dev          # الواجهة :5173
npx wrangler dev     # الـ API :8787 (نافذة ثانية)
```

## ملاحظات أمنية
- كلمات المرور: SHA-256 مملّح (salt عشوائي 128-bit لكل مستخدم) — لا تُخزن أبدًا كنص صريح
- الجلسات: HttpOnly + Secure + SameSite=Lax، تُخزن في D1 وتنتهي بعد 7 أيام
- تحميل الصور: تحقق من النوع والحجم (JPG/PNG/WebP/AVIF، أقصى 5MB) ومسار عشوائي في R2
- CORS: يسمح فقط بالنطاقات المحددة في ALLOWED_ORIGINS
- لا يمكن تسجيل حسابات من الواجهة العامة — الإدارة فقط من لوحة التحكم
