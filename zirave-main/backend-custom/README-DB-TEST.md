# اختبار الاتصال بقاعدة البيانات - ZİRAVE Backend

## 📋 نظرة عامة

هذا الدليل يوضح كيفية اختبار الاتصال بقاعدة بيانات Supabase من خلال مشروع NestJS الخلفي.

## 🚀 الملفات المطلوبة

### 1. ملف الاختبار
- **الموقع:** `src/test-db-connection.ts`
- **الوظيفة:** اختبار الاتصال بقاعدة البيانات وجلب البيانات

### 2. ملف إعداد قاعدة البيانات
- **الموقع:** `setup-database.sql`
- **الوظيفة:** إنشاء الجداول والسياسات المطلوبة

### 3. ملف البيئة
- **الموقع:** `.env`
- **الوظيفة:** تخزين مفاتيح Supabase والإعدادات

## 🔧 كيفية التشغيل

### الخطوة 1: التأكد من وجود ملف .env
```bash
# تأكد من وجود الملف
ls .env

# تحقق من المحتوى
cat .env
```

### الخطوة 2: تشغيل اختبار الاتصال
```bash
npm run test:db
```

### الخطوة 3: إنشاء الجداول (إذا لم تكن موجودة)
```bash
# باستخدام Supabase CLI
supabase db reset

# أو باستخدام psql مباشرة
psql -h your-supabase-host -U postgres -d postgres -f setup-database.sql
```

## 📊 النتائج المتوقعة

### ✅ إذا كان كل شيء يعمل بشكل صحيح:
```
🔍 بدء اختبار الاتصال بقاعدة البيانات...

✅ تم إنشاء تطبيق NestJS بنجاح
✅ تم الحصول على خدمة Supabase بنجاح

🔍 اختبار الاتصال الأساسي...
✅ الاتصال بقاعدة البيانات يعمل

🔍 اختبار جدول profiles...
✅ نجح الوصول لجدول profiles
📊 عدد الملفات الشخصية: 3
👤 أول ملف شخصي: { ... }

🔍 اختبار العميل الإداري...
✅ العميل الإداري يعمل بشكل صحيح

🎉 تم إكمال اختبار الاتصال!
```

### ⚠️ إذا كانت هناك مشاكل:
```
❌ خطأ في الاتصال: Invalid API key
💡 يجب تحديث مفاتيح Supabase في ملف .env

❌ خطأ في الوصول لجدول profiles: Table not found
💡 يجب إنشاء الجداول باستخدام setup-database.sql
```

## 🔑 متطلبات مفاتيح Supabase

### المفاتيح المطلوبة في ملف .env:
```env
# مفتاح الاتصال العام (مطلوب)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# مفتاح الخدمة الإدارية (اختياري - للعمليات الإدارية)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### كيفية الحصول على المفاتيح:
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى Settings > API
4. انسخ المفاتيح المطلوبة

## 🗄️ الجداول المطلوبة

### الجداول الأساسية:
- **profiles** - ملفات المستخدمين الشخصية
- **products** - المنتجات في السوق
- **conversations** - المحادثات
- **messages** - الرسائل
- **shipment_requests** - طلبات النقل
- **shipment_bids** - عروض النقل
- **diagnosis_results** - نتائج تشخيص النباتات

### كيفية إنشاء الجداول:
```bash
# الطريقة 1: استخدام ملف SQL
psql -h your-supabase-host -U postgres -d postgres -f setup-database.sql

# الطريقة 2: استخدام Supabase CLI
supabase db reset

# الطريقة 3: من لوحة التحكم
# اذهب إلى Supabase Dashboard > SQL Editor
# انسخ محتوى setup-database.sql والصقه
```

## 🐛 استكشاف الأخطاء

### مشكلة: "Invalid API key"
**الحل:** تحديث مفاتيح Supabase في ملف .env

### مشكلة: "Table not found"
**الحل:** تشغيل ملف setup-database.sql

### مشكلة: "Connection refused"
**الحل:** التأكد من صحة SUPABASE_URL

### مشكلة: "Permission denied"
**الحل:** التأكد من صحة مفاتيح API

## 📝 ملاحظات مهمة

1. **أمان المفاتيح:** لا تشارك مفاتيح Supabase مع أي شخص
2. **بيئة التطوير:** استخدم مفاتيح منفصلة للتطوير والإنتاج
3. **النسخ الاحتياطي:** احتفظ بنسخة احتياطية من قاعدة البيانات
4. **المراقبة:** راقب استخدام قاعدة البيانات من لوحة التحكم

## 🔗 روابط مفيدة

- [Supabase Documentation](https://supabase.com/docs)
- [NestJS Documentation](https://nestjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
