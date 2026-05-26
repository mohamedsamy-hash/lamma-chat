# لمّة Chat v12 - دليل الإعداد الكامل

## 📋 المتطلبات

- Supabase Account
- Node.js 16+
- Modern Web Browser

## 🔧 خطوات الإعداد

### 1. استنساخ المشروع

```bash
git clone https://github.com/mohamedsamy-hash/lamma-chat.git
cd lamma-chat
```

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إعداد ملف البيئة

انسخ `.env.example` إلى `.env.local`:

```bash
cp .env.example .env.local
```

أضف بيانات Supabase الخاصة بك في `.env.local`

### 4. إعداد قاعدة البيانات Supabase

#### أنشئ جداول Supabase:

**1️⃣ جدول المستخدمين المحظورين:**

```sql
CREATE TABLE banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  nickname TEXT,
  reason TEXT,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('normal', 'super')),
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  banned_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to read bans"
  ON banned_users FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Allow admins to insert bans"
  ON banned_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Allow admins to delete bans"
  ON banned_users FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
```

**2️⃣ جدول سجل الرسائل:**

```sql
CREATE TABLE messages_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT,
  sender_id TEXT,
  sender_name TEXT,
  recipient_id TEXT,
  recipient_name TEXT,
  content TEXT,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow owner to read all messages"
  ON messages_log FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Allow all to insert messages"
  ON messages_log FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

**3️⃣ جدول الغرف:**

```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏠',
  topic TEXT DEFAULT '',
  max_users INTEGER DEFAULT 100,
  password TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  user_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to read rooms"
  ON rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admins to manage rooms"
  ON rooms FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'owner')));
```

**4️⃣ جداول الحظر الإضافية:**

```sql
CREATE TABLE ip_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  banned_by TEXT
);

CREATE TABLE device_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  reason TEXT,
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  banned_by TEXT
);

ALTER TABLE ip_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_bans ENABLE ROW LEVEL SECURITY;
```

**5️⃣ فعّل Realtime:**

```sql
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE banned_users;
ALTER PUBLICATION supabase_realtime ADD TABLE messages_log;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE ip_bans;
ALTER PUBLICATION supabase_realtime ADD TABLE device_bans;
```

### 5. تشغيل التطبيق

#### للتطوير:

```bash
npm run dev
```

#### للإنتاج:

```bash
npm run build
npm run preview
```

## 📁 بنية المشروع

```
lamma-chat/
├── index.html              # HTML الرئيسي
├── css/
│   ├── main.css           # الأساليب الأساسية
│   ├── landing.css        # صفحة الدخول
│   ├── chat.css           # واجهة الدردشة
│   └── animations.css     # الحركات
├── js/
│   ├── main.js            # نقطة الدخول الرئيسية
│   ├── config.js          # الإعدادات
│   ├── auth.js            # المصادقة
│   ├── chat.js            # منطق الدردشة
│   ├── commands.js        # معالج الأوامر
│   ├── moderation.js      # نظام الإشراف
│   ├── database.js        # عمليات قاعدة البيانات
│   └── utils.js           # أدوات مساعدة
├── .env.example           # متغيرات البيئة
├── .gitignore            # ملفات Git المستثناة
├── package.json          # إدارة المشاريع
└── SETUP.md              # هذا الملف
```

## 🎯 الميزات الرئيسية

✅ **أوامر الشرطة المائلة (Slash Commands)**
✅ **نظام الحظر المتقدم**
✅ **وضع التخفي (Ghost Mode)**
✅ **حماية التكرار (Flood Protection)**
✅ **حظر IP والأجهزة**
✅ **الغرف الديناميكية**
✅ **نظام الإنذارات**
✅ **نظام VIP**
✅ **المراقبة السرية**

## 🐛 استكشاف الأخطاء

### المشكلة: لا يتصل بـ Supabase

**الحل:**
- تحقق من `VITE_SUPABASE_URL` و `VITE_SUPABASE_KEY` في `.env.local`
- تأكد من تفعيل Realtime في Supabase
- تحقق من اتصالك بالإنترنت

### المشكلة: الأوامر لا تعمل

**الحل:**
- تأكد من أنك تستخدم `/` في بداية الأمر
- تحقق من أنك تملك الصلاحيات المطلوبة
- اطلع على `js/commands.js` للأوامر المتاحة

### المشكلة: الأسلوب غير صحيح

**الحل:**
- امسح ذاكرة التخزين المؤقت: `Ctrl+Shift+Delete`
- أعد تحميل الصفحة: `Ctrl+R`
- تحقق من ملفات CSS في مجلد `css/`

## 📞 الدعم والمساعدة

للمشاكل والاستفسارات، يرجى فتح issue على:
https://github.com/mohamedsamy-hash/lamma-chat/issues

## 📄 الترخيص

MIT License
