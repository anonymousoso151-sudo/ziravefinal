# تطبيق مخطط قاعدة البيانات - دليل سريع

## 🚀 كيفية التطبيق من لوحة التحكم

### الخطوة 1: الوصول إلى لوحة التحكم
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروع **ZİRAVE** (hybjjzpibecoqdqbumzn)

### الخطوة 2: فتح SQL Editor
1. من القائمة الجانبية، اختر **SQL Editor**
2. اضغط على **New Query**

### الخطوة 3: نسخ وتشغيل المخطط
1. انسخ محتوى ملف `supabase/apply-schema.sql`
2. الصق المحتوى في SQL Editor
3. اضغط **Run** لتطبيق المخطط

### الخطوة 4: التحقق من النجاح
بعد التشغيل، يجب أن ترى رسالة:
```
ZİRAVE Database Schema applied successfully!
```

## 📊 ما سيتم إنشاؤه

### الجداول:
- ✅ **profiles** - ملفات المستخدمين
- ✅ **products** - المنتجات
- ✅ **conversations** - المحادثات
- ✅ **messages** - الرسائل
- ✅ **shipment_requests** - طلبات النقل
- ✅ **shipment_bids** - عروض النقل
- ✅ **diagnosis_results** - نتائج التشخيص
- ✅ **notifications** - الإشعارات

### البيانات التجريبية:
- 4 مستخدمين بأدوار مختلفة
- 3 منتجات تجريبية

## ✅ التحقق من التطبيق

بعد تطبيق المخطط، يمكنك التحقق من نجاح العملية:

```bash
cd backend-custom
npm run test:db
```

### النتيجة المتوقعة:
```
✅ نجح الوصول لجدول profiles
📊 عدد الملفات الشخصية: 4
✅ نجح الوصول لجدول products
📊 عدد المنتجات: 3
🎉 تم إكمال اختبار الاتصال!
```

## 🔗 روابط مفيدة

- [Supabase Dashboard](https://supabase.com/dashboard/project/hybjjzpibecoqdqbumzn)
- [SQL Editor](https://supabase.com/dashboard/project/hybjjzpibecoqdqbumzn/sql)
- [Table Editor](https://supabase.com/dashboard/project/hybjjzpibecoqdqbumzn/editor)

---

**ملاحظة:** هذا الملف آمن للتشغيل المتكرر - لن يحدث أي أخطاء إذا تم تشغيله أكثر من مرة.
