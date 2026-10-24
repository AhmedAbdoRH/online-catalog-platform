# اونلاين كاتلوج للمطاعم — تطبيق أندرويد مستقل

نسخة أندرويد مستقلة (AAB خاص بها) لتطبيق **المطاعم والكافيهات**، منفصلة عن تطبيق المتاجر
(`android/` في جذر المشروع)، بس بتشارك نفس:

- **المصادقة**: Supabase Auth + Google Sign-In (نفس المشروع `online-catalog-481010`)
- **قاعدة البيانات**: نفس الـ catalogs / orders / users

## الفرق الوحيد

| | تطبيق المتاجر (`android/`) | تطبيق المطاعم (`restaurant-app/`) |
|---|---|---|
| applicationId | `com.nextcatalog.app` | `com.nextcatalog.restaurants` |
| الاسم | اونلاين كاتلوج | اونلاين كاتلوج للمطاعم |
| الأيقونة | خلفية بيضاء | خلفية برتقالية غامقة `#7C2D12` |
| صفحة الافتتاح | `tagr-online.com/login?native_android=1` | `tagr-online.com/login?native_android=1&segment=restaurant` |
| الشريحة عند التسجيل | يختار (متجر/مطعم) | **مثبّتة على مطعم/كافيه** |
| رقم الإصدار | 1.0.15 (15) | 1.0.0 (1) |

لما المستخدم يسجّل من تطبيق المطاعم، الكتالوج بيتعمل بـ `business_type = 'restaurant'`
و `restaurant_mode_enabled = true` تلقائياً (أرقام الطاولات شغالة من أول يوم).

## البناء

```bash
# من جذر المشروع الرئيسي (الـ node_modules مشتركة عبر junction)
cd restaurant-app
npx cap copy android          # تحديث أصول الويب (مش مطلوبة لتغيير الرابط — محفور في capacitor.config.ts)
cd android
./gradlew bundleRelease       # AAB موقّع
```

الناتج: `restaurant-app/android/app/build/outputs/bundle/release/app-release.aab`

> ملاحظة: `node_modules` هنا junction على `node_modules` بتاع المشروع الرئيسي،
> فمحتاج تبني من نفس الجهاز/نفس المسار.

## ⚠️ خطوة مطلوبة قبل نشر التطبيق على Google Play

عشان **تسجيل الدخول بجوجل** يشتغل جوه تطبيق المطاعم، لازم تسجّل الحزمة الجديدة في Firebase
(نفس المشروع — مش محتاج مشروع جديد):

1. افتح [Firebase Console](https://console.firebase.google.com/project/online-catalog-481010/settings/general)
2. أضف تطبيق أندرويد جديد بنفس الـ package name:
   ```
   com.nextcatalog.restaurants
   ```
3. حط الـ SHA-1 بتاع مفتاح التوقيع (نفس مفتاح تطبيق المتاجر):
   ```
   15:23:C5:5A:95:79:49:07:36:9E:34:92:A5:DF:37:15:0D:83:A2:D2
   ```
   (للحصول عليه: `keytool -list -v -keystore android/app/my-release-key.jks -alias my-key-alias`)
4. نزّل `google-services.json` الجديد وحطه في `restaurant-app/android/app/google-services.json`
   (الملف الحالي معدّل يدوياً عشان البناء يعدّي — بعد الخطوة دي استبدله بالرسمي)
5. ابني من جديد: `./gradlew bundleRelease`

بدون الخطوة دي، التطبيق هيفتح ويسجّل الدخول بالإيميل عادي، بس **زر جوجل** هيرجع
خطأ `DEVELOPER_ERROR (10)`.

## تذكير: الشريحة في الداتابيز

محتاج تكون migration `supabase/migrations/0016_add_business_type.sql` متطبّقة على الداتابيز
(عمود `business_type`)، وإلا إنشاء كتالوج مطعم جديد هيفشل. الـ SQL موجود في المشروع.
