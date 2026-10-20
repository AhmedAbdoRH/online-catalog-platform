# 🍽️ دليل نظام المطاعم والكافيهات

تم بنجاح إضافة نظام متكامل موازي لنظام الشحن، مخصص للمطاعم والكافيهات.

## 📂 الملفات المضافة/المعدلة

### ملفات جديدة:
1. ✅ `src/lib/tables.ts` - مكتبة إدارة أرقام الطاولات
2. ✅ `src/components/dashboard/TableNumbersDialog.tsx` - واجهة إدارة الطاولات
3. ✅ `supabase/migrations/0015_add_restaurant_mode.sql` - إضافة الأعمدة للقاعدة

### ملفات معدلة:
1. ✅ `src/lib/types.ts` - إضافة الأنواع الجديدة
2. ✅ `src/app/actions/catalog.ts` - إضافة وظائف updateTableNumbers & updateRestaurantMode
3. ✅ `src/components/menu/DirectOrderForm.tsx` - دعم اختيار الطاولة
4. ✅ `src/components/cart/CartDrawer.tsx` - تحديث رسائل WhatsApp
5. ✅ `src/components/menu/ProductActions.tsx` - تمرير البيانات الجديدة
6. ✅ `src/components/dashboard/SettingsForm.tsx` - إضافة TableNumbersDialog
7. ✅ `src/app/[slug]/item/[itemId]/ClientProductPage.tsx` - تمرير بيانات المطعم

## 🚀 خطوات التفعيل

### 1. تطبيق Migration على قاعدة البيانات

يجب تطبيق الملف `supabase/migrations/0015_add_restaurant_mode.sql` على Supabase:

```sql
-- في Supabase Dashboard → SQL Editor → New Query
-- قم بنسخ محتوى الملف وتنفيذه:

ALTER TABLE catalogs 
ADD COLUMN IF NOT EXISTS table_numbers TEXT[] DEFAULT '{}';

ALTER TABLE catalogs 
ADD COLUMN IF NOT EXISTS restaurant_mode_enabled BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN catalogs.table_numbers IS 'List of table names/numbers for restaurant/cafe mode';
COMMENT ON COLUMN catalogs.restaurant_mode_enabled IS 'Enable restaurant/cafe mode';
```

### 2. إعادة تشغيل خادم التطوير

```bash
npm run dev
```

## 🎯 طريقة الاستخدام

### للتاجر (صاحب المطعم):

1. **افتح لوحة التحكم** → الإعدادات
2. **ابحث عن قسم** "أرقام الطاولات (نظام المطاعم/الكافيهات)"
3. **اضغط على** "إدارة الطاولات"
4. **أضف أرقام الطاولات:**
   - اضغط "إضافة طاولة جديدة"
   - اكتب الرقم أو الاسم (مثل: 1، 2، VIP-1، A1)
   - كرر للطاولات الأخرى
5. **احفظ التعديلات**

### للعميل:

عند الطلب، سيظهر للعميل:
- حقل "رقم الطاولة" (قائمة منسدلة)
- حقل "ملاحظات إضافية" بدلاً من "العنوان"
- يجب اختيار الطاولة لإتمام الطلب

## 🔍 آلية العمل

```typescript
// النظام يحدد تلقائياً أي نمط يستخدم:
const isRestaurantMode = 
  catalog.restaurant_mode_enabled && 
  hasConfiguredTableNumbers(catalog.table_numbers);

const isShippingMode = 
  !isRestaurantMode && 
  hasConfiguredShippingRates(catalog.shipping_rates);
```

### الأولوية:
1. إذا فُعّل `restaurant_mode_enabled` وهناك طاولات → **نظام المطعم** 🍽️
2. وإلا إذا كان هناك `shipping_rates` → **نظام الشحن** 🚚
3. وإلا → **نظام عادي** 📦

## 📋 مثال رسالة WhatsApp

```
طلب جديد من كتالوج مطعم النخيل:

• شاورما دجاج × 2 — 80 ج.م
• عصير برتقال × 1 — 25 ج.م

🪑 رقم الطاولة: 7

الإجمالي: 105 ج.م

━━━━━━━━━━━━━━━━━━
📋 بيانات العميل:
━━━━━━━━━━━━━━━━━━
👤 الاسم: محمد علي
📱 رقم الهاتف: 01001234567
📍 ملاحظات: بدون ثوم من فضلك
━━━━━━━━━━━━━━━━━━
```

## 🧪 اختبار النظام

### 1. اختبار إضافة طاولات:
- افتح الإعدادات
- اضغط "إدارة الطاولات"
- أضف: 1، 2، 3، VIP
- احفظ

### 2. اختبار الطلب:
- افتح صفحة منتج
- اضغط "اطلب عبر واتساب"
- يجب أن يظهر "اختر رقم الطاولة"
- اختر طاولة
- املأ البيانات
- تأكد من ظهور رقم الطاولة في رسالة WhatsApp

## ⚠️ ملاحظات مهمة

### التوافق مع الأنظمة الحالية:
- ✅ **لا يؤثر** على التجار الذين يستخدمون نظام الشحن
- ✅ **مستقل تماماً** - يمكن التبديل بينهما بسهولة
- ✅ **اختياري** - يمكن عدم استخدام أي من النظامين

### التحقق من الصحة:
- ❌ لا يمكن إرسال طلب بدون اختيار طاولة (في نظام المطعم)
- ❌ لا يمكن إضافة طاولات مكررة
- ✅ يتم التحقق من رقم الطاولة قبل الإرسال

### الترتيب:
- الأرقام أولاً (1, 2, 3, ...)
- ثم الحروف والأسماء (A, B, VIP, ...)

## 🔧 الصيانة والدعم

### إضافة طاولات جديدة:
- لا يتطلب إعادة تشغيل الخادم
- يتم الحفظ فوراً في القاعدة

### حذف طاولات:
- احذف من القائمة واحفظ
- الطلبات السابقة لن تتأثر

### تعطيل النظام:
- فقط احذف جميع الطاولات أو عطل restaurant_mode_enabled

## 📊 إحصائيات متوقعة

بعد استخدام النظام، يمكن تطويره ليوفر:
- [ ] عدد الطلبات لكل طاولة
- [ ] الطاولات الأكثر استخداماً
- [ ] متوسط وقت الطلب
- [ ] أكثر المنتجات طلباً حسب الطاولة

---

## ✨ الخلاصة

النظام جاهز تماماً للاستخدام! 

**المطلوب فقط:**
1. تطبيق Migration على Supabase
2. إعادة تشغيل الخادم
3. البدء في إضافة أرقام الطاولات

**تم التطوير بواسطة:** Kiro AI 🤖  
**التاريخ:** 19 أكتوبر 2026
