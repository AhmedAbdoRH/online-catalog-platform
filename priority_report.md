# 🚨 تقرير الأولويات — Online Catalog Platform
### مرتّبة من الأكثر حرجًا إلى الأقل

---

## الفئة 1 — 🔴 حرج أمني فوري (يجب الحل **قبل أي إطلاق**)

---

### #1 — ملف GCP Service Account JSON موجود محليًا في الريبو
**الخطورة: 10/10 — كارثة أمنية**

**ما وجدناه في الكود:**
الملف `online-catalog-481010-527c9826b236.json` موجود في جذر المشروع ويحتوي على:
- `private_key` كاملة لخدمة Google Cloud
- `client_email`: `billing@online-catalog-481010.iam.gserviceaccount.com`
- `private_key_id`

الملف ملحوظ في `.gitignore` بـ `online-catalog-*.json`، مما يعني أنه **لم يُرفع للريبو العام**، لكنه موجود محليًا وهذا بحد ذاته خطر.

> [!CAUTION]
> لو هذا الملف وصل لأي مكان بالخطأ (GitHub, CI, backup) = أي شخص يقدر ينتحل هوية الـ billing service account الخاصة بـ Google Play. **غيّر الـ credentials فورًا** وتأكد من عدم وجوده في أي سجل git بـ `git log --all --full-history -- "online-catalog-*.json"`.

**التصرف الفوري:**
```bash
# تأكد أنه مش في git history
git log --all --full-history -- "online-catalog-481010-527c9826b236.json"

# احذفه من مجلد العمل
del "online-catalog-481010-527c9826b236.json"

# أضفه للـ .gitignore (موجود بالفعل، تأكد فقط)
```

---

### #2 — ملفات Keystore Fingerprints مرفوعة على Git
**الخطورة: 9/10 — ثغرة أمنية حقيقية**

**ما وجدناه:** الملفات التالية **مرفوعة فعلًا على Git** (مؤكد بـ `git ls-files`):
```
keys_one_line.txt   ← مرفوع على git
keys_output.txt     ← مرفوع على git
signing_report.txt  ← مرفوع على git
```

**ما تحتويه:**
- `signing_report.txt` يحتوي على SHA1 و SHA256 fingerprints للـ Android Keystore
- `keys_*.txt` تحتوي على بيانات الـ keystore

**الخطر:** SHA fingerprints = يقدر أي شخص يتحقق من هوية الـ APK أو يبني هجمات على التطبيق.

**التصرف الفوري:**
```bash
# احذفهم من git history (مهم جدًا)
git rm --cached keys_one_line.txt keys_output.txt signing_report.txt build_aab.log build_error.log test_phone_auth.sql

# أضف للـ .gitignore
echo "keys_*.txt" >> .gitignore
echo "signing_report.txt" >> .gitignore
echo "*.log" >> .gitignore
echo "test_*.sql" >> .gitignore

git commit -m "security: remove sensitive files from git tracking"
```

> [!WARNING]
> لمسح التاريخ كاملًا استخدم `git filter-repo` أو BFG Repo Cleaner، لأن `git rm` يحذف من الـ HEAD فقط لا من التاريخ.

---

### #3 — `customer.ts` يستخدم Browser Supabase Client في Server Action
**الخطورة: 8/10 — ثغرة أمنية وظيفية**

**الكود المشكل** في [`customer.ts` السطر 3](file:///d:/online-catalog-platform-5/src/app/actions/customer.ts#L3-L3):
```typescript
// ❌ خطأ: استيراد browser client في server action
import { createClient } from '@/lib/supabase/client'
```

**يجب أن يكون:**
```typescript
// ✅ صحيح
import { createClient } from '@/lib/supabase/server'
```

**الخطر المباشر:**
- الـ browser client لا يحمل session token الخاص بالخادم
- `exportCustomersToCSV` تجلب بيانات العملاء لأي كتالوج بدون التحقق من ملكية المستخدم
- `saveCustomerData` تضيف عملاء لأي `catalogId` بدون ownership check

---

### #4 — `exportCustomersToCSV` بدون Authorization Check + ثغرة CSV Injection
**الخطورة: 8/10 — تسريب بيانات + هجوم حقن**

**الكود المشكل** في [`customer.ts` السطر 42-79](file:///d:/online-catalog-platform-5/src/app/actions/customer.ts#L42-L79):

```typescript
// ❌ لا يوجد فحص: هل المستخدم يملك هذا الـ catalogId؟
export async function exportCustomersToCSV(catalogId: number) {
  const supabase = await createClient() // browser client!
  // ... يجلب customers أي catalog بدون فحص
  
  // ❌ CSV Injection: إذا أدخل عميل اسمه "=cmd|/C calc!A0"
  customers.map(customer => [
    `"${customer.name}"`,  // لا يوجد escape للـ formula characters
  ])
}
```

**الإصلاح:**
```typescript
import { createClient } from '@/lib/supabase/server'

export async function exportCustomersToCSV(catalogId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'غير مصرح به' }

  // تحقق من الملكية أولًا
  const { data: catalog } = await supabase
    .from('catalogs')
    .select('id')
    .eq('id', catalogId)
    .eq('user_id', user.id)
    .single()

  if (!catalog) return { success: false, error: 'غير مصرح به' }

  // باقي الكود...
  // CSV Injection escape:
  const escapeCsv = (val: string) => {
    const cleaned = String(val).replace(/^[=+\-@\t\r]/, "'$&")
    return `"${cleaned.replace(/"/g, '""')}"`
  }
}
```

---

## الفئة 2 — 🟠 حرج وظيفي (يؤثر على المستخدمين مباشرة)

---

### #5 — Billing: لا يوجد `plan_expires_at` عند تفعيل Pro
**الخطورة: 8/10 — ثغرة مالية**

**الكود المشكل** في [`billing.ts` السطر 116-120](file:///d:/online-catalog-platform-5/src/app/actions/billing.ts#L116-L120):
```typescript
// ❌ يحدّث الخطة لـ "pro" بدون تاريخ انتهاء
await supabase
  .from("catalogs")
  .update({ plan: "pro" })  // plan_expires_at غايب!
  .eq("id", catalogId)
```

**الخطر:** إذا ألغى المستخدم الاشتراك من Google Play، الحساب يبقى Pro إلى الأبد لأن `plan_expires_at` = null، و`isProPlan()` يعتبر null = active.

**الإصلاح:**
```typescript
// احسب تاريخ الانتهاء بناءً على نوع الاشتراك
const expiresAt = type === 'yearly'
  ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

await supabase
  .from("catalogs")
  .update({ 
    plan: "pro",
    plan_expires_at: expiresAt.toISOString()
  })
  .eq("id", catalogId)
```

---

### #6 — Test الـ Authentication يفشل: Dashboard يظهر بعد بيانات خاطئة
**الخطورة: 7/10 — خلل في صلاحيات الدخول**

**ما رصده الاختبار:** تسجيل دخول ببيانات خاطئة يُظهر الـ Dashboard بدلًا من رسالة خطأ.

**السبب المحتمل:** الـ middleware في [`middleware.ts` السطر 30-39](file:///d:/online-catalog-platform-5/src/middleware.ts#L30-L39):
```typescript
} catch (e) {
  // ❌ عند فشل الـ middleware، يسمح بالمرور!
  console.error('Middleware Error:', e);
  return NextResponse.next({ ... }); // يكمل بدون فحص auth
}
```

إذا فشل Supabase client في الـ middleware لأي سبب (network, config)، **يسمح لأي طلب بالمرور بما فيها `/dashboard`**.

**الإصلاح:**
```typescript
} catch (e) {
  console.error('Middleware Error:', e);
  // ❌ لا تسمح بالمرور — أعد توجيه للـ login
  const url = new URL(request.url)
  if (url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}
```

---

### #7 — Store Settings: تغيير اسم المتجر لا يُحفظ
**الخطورة: 7/10 — خلل وظيفي مباشر (مُثبت بالاختبار)**

**ما رصده الاختبار:** بعد حفظ "Test Store Alpha"، يعود الاسم لـ "العباس التاني".

**السبب المحتمل في [`catalog.ts`](file:///d:/online-catalog-platform-5/src/app/actions/catalog.ts):**
```typescript
// السطر 195-196: display_name يأخذ من currentCatalog إذا كان FormData فارغًا
const display_name = (formData.get('display_name') as string 
  || currentCatalog.display_name  // ← قد يرجع القيمة القديمة
  || currentCatalog.name || '')
```

إذا كان الـ form يرسل `display_name` فارغًا أو بقيمة خاطئة، يُحفظ الاسم القديم. يحتاج فحص الـ form submission من جانب الـ client أيضًا.

---

### #8 — RLS: قراءة عامة بدون `is_published`
**الخطورة: 7/10 — تسريب بيانات التجار**

**في الكود الفعلي** من `supabase_rls_policies.sql`:
```sql
-- ❌ كل الكتالوجات مكشوفة حتى غير المكتملة
CREATE POLICY "Public can read catalogs"
ON catalogs FOR SELECT
USING (true);
```

**الخطر:** تاجر في منتصف إعداد متجره (بيانات ناقصة، أسعار خاطئة) = مكشوف للعموم.

---

### #9 — `saveCustomerData`: لا يوجد Validation على المدخلات
**الخطورة: 6/10 — بيانات فاسدة + SQL-adjacent risks**

**الكود** في [`customer.ts` السطر 6-40](file:///d:/online-catalog-platform-5/src/app/actions/customer.ts#L6-L40):
```typescript
// ❌ لا Zod، لا sanitization، لا فحص طول
export async function saveCustomerData(
  catalogId: number, 
  name: string,      // يقبل أي نص
  phone: string,     // يقبل أي نص
  address: string    // يقبل أي نص
)
```

على عكس `items.ts` الذي يستخدم Zod، `customer.ts` لا يتحقق من أي شيء.

---

## الفئة 3 — 🟡 ديون تقنية (تؤثر على الاستدامة والنمو)

---

### #10 — Plan Logic مبني على Magic Strings
**الخطورة: 6/10 — خطأ إملائي = تاجر يفقد ميزاته**

**في [`plans.ts` السطر 18](file:///d:/online-catalog-platform-5/src/lib/plans.ts#L18)**:
```typescript
// ❌ Magic strings — أي خطأ إملائي صامت
const isPro = plan === 'pro' || plan === 'pro-trial' || plan === 'business';
```

**الإصلاح المقترح:**
```typescript
export const PRO_TIER_PLANS = new Set(['pro', 'pro-trial', 'business'] as const)
export const isProPlan = (catalog: Catalog | null): boolean =>
  !!catalog?.plan && PRO_TIER_PLANS.has(catalog.plan.toLowerCase() as any)
```

---

### #11 — Variants تلغي الـ `discount_price` بصمت
**الخطورة: 6/10 — سلوك غير متوقع يضر التاجر**

**في [`items.ts` السطر 178-185](file:///d:/online-catalog-platform-5/src/app/actions/items.ts#L178-L185)**:
```typescript
if (variants && variants.length > 0) {
  price = minPrice;
  discountPrice = null;  // ❌ يُلغى الخصم بدون إخبار التاجر
}
```

تاجر يضيف variant لمنتج عليه خصم = يفقد الخصم بدون أي رسالة تحذير.

---

### #12 — `any` types في كود الأسعار
**الخطورة: 5/10 — أخطاء صامتة في الحسابات المالية**

**في [`items.ts` السطر 180](file:///d:/online-catalog-platform-5/src/app/actions/items.ts#L180)**:
```typescript
variants.map((v: any) => parseFloat(v.price) || 0)
//              ^^^^ any في كود مالي = خطر
```

لو `v.price = "99,99"` → `parseFloat` يرجع `99` بدل `99.99`.

---

### #13 — لا يوجد Database Indexes
**الخطورة: 5/10 — أداء كارثي مع نمو البيانات**

من `db.sql` لا يوجد indexes على:
```sql
-- مفقود:
CREATE INDEX idx_categories_catalog_id ON categories(catalog_id);
CREATE INDEX idx_menu_items_catalog_id ON menu_items(catalog_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_customers_catalog_id ON customers(catalog_id);
```

---

### #14 — ملفات `.log` مرفوعة على Git
**الخطورة: 5/10 — تسريب معلومات البيئة**

```
build_aab.log    ← مرفوع على git
build_error.log  ← مرفوع على git
```

قد تحتوي على env vars، paths، أو معلومات البنية التحتية.

---

### #15 — تضارب Deployment: Cloudflare + Netlify + Firebase
**الخطورة: 4/10 — فوضى تشغيلية**

`package.json` + `apphosting.yaml` + `.netlifyignore` = 3 مسارات نشر نشطة. اختر واحدًا واحذف الباقي.

---

### #16 — اسم المشروع في `package.json` = "nextn"
**الخطورة: 4/10 — مؤشر على Prototype غير مكتمل**

```json
{ "name": "nextn", "version": "0.1.0" }
```

---

## الفئة 4 — 🟢 تحسينات (مهمة لكن ليست عاجلة)

---

### #17 — `auth_old.ts` موجود في الـ codebase
### #18 — تضارب Branding: "أونلاين متجر" vs "تاجر أون لاين"
### #19 — ملفا `db.sql` مكررة (جذر + src/)
### #20 — غياب Tests تمامًا
### #21 — `tsconfig.json` بدون `strict: true`
### #22 — `.vscode` و `.idx` مرفوعة في الريبو
### #23 — `README.md` فارغ تمامًا

---

## 📊 جدول الأولويات التنفيذية

| الترتيب | المشكلة | الخطورة | الوقت المقدر | الأولوية |
|---------|---------|---------|-------------|---------|
| 1 | GCP Service Account JSON محليًا | 🔴 10/10 | 30 دقيقة | **فوري** |
| 2 | Keystore files مرفوعة على Git | 🔴 9/10 | 1 ساعة | **فوري** |
| 3 | Browser client في Server Action | 🔴 8/10 | 30 دقيقة | **اليوم** |
| 4 | CSV Export بدون auth + CSV Injection | 🔴 8/10 | 2 ساعة | **اليوم** |
| 5 | Billing بدون `plan_expires_at` | 🟠 8/10 | 1 ساعة | **هذا الأسبوع** |
| 6 | Middleware يسمح بالمرور عند الخطأ | 🟠 7/10 | 30 دقيقة | **هذا الأسبوع** |
| 7 | Store name لا يُحفظ | 🟠 7/10 | 2-4 ساعات | **هذا الأسبوع** |
| 8 | RLS بدون `is_published` | 🟠 7/10 | 2 ساعات | **هذا الأسبوع** |
| 9 | Customer save بدون validation | 🟠 6/10 | 1 ساعة | **هذا الأسبوع** |
| 10 | Magic strings في Plan logic | 🟡 6/10 | 1 ساعة | **الأسبوع القادم** |
| 11 | Variants تلغي discount بصمت | 🟡 6/10 | 2 ساعات | **الأسبوع القادم** |
| 12 | `any` types في كود الأسعار | 🟡 5/10 | 1 ساعة | **الأسبوع القادم** |
| 13 | Database indexes مفقودة | 🟡 5/10 | 1 ساعة | **الأسبوع القادم** |
| 14 | Log files على Git | 🟡 5/10 | 30 دقيقة | **الأسبوع القادم** |
| 15 | تضارب Deployment | 🟢 4/10 | 2 ساعات | لاحقًا |
| 16-23 | باقي التحسينات | 🟢 ≤4/10 | متنوع | لاحقًا |

---

> [!IMPORTANT]
> **خلاصة:** المشاكل #1 و#2 و#3 و#4 يجب حلها **قبل أي commit جديد**، وليس فقط قبل الإطلاق. المشكلة #3 تحديدًا (browser client في server action) موجودة في production الآن.
