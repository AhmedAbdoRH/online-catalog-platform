# إعداد Google Play Billing لباقة البرو

## ما تم تنفيذه

1. **إذن BILLING** في `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="com.android.vending.BILLING" />
   ```

2. **إضافة plugin** `@capgo/native-purchases` للدفع داخل التطبيق

3. **خدمة الدفع** في `src/lib/billing.ts` مع زر موحد في `ProUpgradeButton`

4. **تحديث واجهة الترقية** لاستخدام Google Billing في تطبيق Android وواتساب في المتصفح

---

## خطوات إكمال الإعداد في Google Play Console

### 1. إنشاء اشتراك (Subscription)

1. ادخل إلى [Google Play Console](https://play.google.com/console/)
2. اختر تطبيق **أونلاين كتالوج**
3. من القائمة: **Monetize** → **Products** → **Subscriptions**
4. اضغط **Create subscription**

### 2. إعداد الاشتراك

| الحقل | القيمة |
|-------|--------|
| **Product ID** | `pro_yearly` (أو غيّره في `src/lib/billing.ts`) |
| **Name** | باقة البرو السنوية |

### 3. إنشاء Base Plan

1. اضغط **Add base plan**
2. **Base plan ID**: `yearly-plan` (يجب أن يطابق `PRO_BASE_PLAN_ID` في الكود)
3. **Billing period**: سنوي (12 شهر)
4. **Price**: حدد السعر (مثل 3200 ج.م أو ما يناسبك)
5. حدد الدول والمناطق
6. اضغط **Activate**

### 4. تحديث الكود إن تغيرت القيم

في ملف `src/lib/billing.ts`:

```ts
export const PRO_SUBSCRIPTION_ID = 'pro_yearly';    // Product ID
export const PRO_BASE_PLAN_ID = 'yearly-plan';      // Base Plan ID
```

### 5. رفع نسخة اختبار

1. رفع نسخة (APK/AAB) على **Internal testing** أو **Closed testing**
2. إضافة **License testers** في **Setup** → **License testing**
3. الاشتراكات لا تعمل على المحاكي، تحتاج جهاز حقيقي أو محاكي مع Google Play

### 6. ربط الاشتراك بحساب المستخدم (اختياري)

للتأكد أن المستخدم اشترى البرو وتحديث قاعدة البيانات:

- إنشاء API endpoint للتحقق من `purchaseToken` عبر [Google Play Developer API](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions)
- عند نجاح الشراء، تحديث حقل `plan` في جدول `catalogs` إلى `pro`

---

## المصادر

- [Capgo Native Purchases - Getting Started](https://capgo.app/docs/plugins/native-purchases/getting-started/)
- [Capgo - إنشاء اشتراك أندرويد](https://capgo.app/docs/plugins/native-purchases/android-create-subscription/)
- [Google Play Billing](https://developer.android.com/google/play/billing)
