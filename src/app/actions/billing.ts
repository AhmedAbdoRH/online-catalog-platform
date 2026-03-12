"use server";

import Verifier from "google-play-billing-validator";
import { createClient } from "@/lib/supabase/server";

const PACKAGE_NAME = "com.nextcatalog.app";
const PRODUCT_ID = "pro_yearly";

export type VerifyResult = { ok: true } | { ok: false; error: string };

export async function verifyAndActivatePro(
  purchaseToken: string,
  catalogId: number
): Promise<VerifyResult> {
  const email = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PLAY_PRIVATE_KEY;

  if (!email || !key) {
    console.error("❌ Google Play credentials not set:", { hasEmail: !!email, hasKey: !!key });
    return { ok: false, error: "لم يتم إعداد التحقق من Google Play" };
  }
  
  // تصحيح المفتاح: بعض المنصات تخزن \n كنص، نحولها لأسطر فعلية
  if (key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }

  try {
    console.log("🔄 بدء التحقق من الشراء:", { catalogId, packageName: PACKAGE_NAME, productId: PRODUCT_ID });
    
    // Support both default and direct export from CJS package
    const Ctor = (Verifier as { default?: typeof Verifier }).default ?? Verifier;
    const verifier = new Ctor({ email, key });
    
    let result;
    try {
      result = await verifier.verifySub({
        packageName: PACKAGE_NAME,
        productId: PRODUCT_ID,
        purchaseToken,
      });
      console.log("✅ نتيجة التحقق من Google Play:", { isSuccessful: result?.isSuccessful, errorMessage: result?.errorMessage });
    } catch (verifyErr: unknown) {
      // معالجة الأخطاء من Verifier مباشرة
      console.error("❌ فشل التحقق من Google Play:", verifyErr);
      let verifyMsg = "فشل التحقق من الاشتراك";
      if (verifyErr instanceof Error) {
        verifyMsg = verifyErr.message;
      } else if (verifyErr && typeof verifyErr === "object") {
        const obj = verifyErr as Record<string, unknown>;
        verifyMsg = (obj.message as string) ?? (obj.error as string) ?? JSON.stringify(verifyErr).substring(0, 200);
      }
      return { ok: false, error: verifyMsg };
    }

    if (!result?.isSuccessful) {
      console.error("❌ الشراء غير صحيح من Google Play:", result?.errorMessage);
      return { ok: false, error: result?.errorMessage || "فشل التحقق من الاشتراك" };
    }

    console.log("✅ تم التحقق من الشراء بنجاح");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("❌ لا يوجد مستخدم مسجل دخول");
      return { ok: false, error: "يجب تسجيل الدخول" };
    }

    console.log("✅ المستخدم المسجل:", user.id);

    const { data: catalog, error: catalogError } = await supabase
      .from("catalogs")
      .select("id, user_id, plan")
      .eq("id", catalogId)
      .single();

    console.log("📊 نتيجة جلب الكتالوج:", { catalog, catalogError });

    if (catalogError) {
      console.error("❌ خطأ في جلب الكتالوج:", catalogError);
      return { ok: false, error: "خطأ في الوصول للكتالوج: " + catalogError.message };
    }

    if (!catalog) {
      console.error("❌ الكتالوج غير موجود:", catalogId);
      return { ok: false, error: "الكتالوج غير موجود" };
    }
    
    console.log("✅ تم جلب الكتالوج:", { id: catalog.id, currentPlan: catalog.plan, hasPlanColumn: 'plan' in catalog });

    // تحقق من وجود حقل plan
    if (!('plan' in catalog)) {
      console.error("❌ حقل plan غير موجود في الكتالوج:", catalog);
      return { ok: false, error: "حقل الباقة غير موجود في قاعدة البيانات" };
    }

    if (catalog.user_id !== user.id) {
      console.error("❌ المستخدم لا يمتلك هذا الكتالوج:", { catalogUserId: catalog.user_id, currentUserId: user.id });
      return { ok: false, error: "غير مصرح بتحديث هذا الكتالوج" };
    }

    console.log("🔄 جاري تحديث الخطة إلى Pro...");

    // تحديث الخطة باستخدام authenticated user (يملك صلاحيات RLS)
    const { data: updateData, error } = await supabase
      .from("catalogs")
      .update({ plan: "pro" })
      .eq("id", catalogId)
      .select();

    console.log("📊 نتيجة تحديث قاعدة البيانات:", { updateData, error });

    if (error) {
      console.error("❌ فشل تحديث الخطة:", error);
      return { ok: false, error: "فشل تحديث الخطة: " + (error.message || error.code) };
    }

    if (!updateData || updateData.length === 0) {
      console.error("❌ لم يتم تحديث أي سجل:", { catalogId, updateData });
      return { ok: false, error: "لم يتم العثور على الكتالوج للتحديث" };
    }
    
    console.log("✅ تم تحديث الخطة بنجاح!", { updatedCatalog: updateData[0] });
    return { ok: true };
  } catch (err: unknown) {
    console.error("❌ خطأ عام في verifyAndActivatePro:", err);
    let msg = "حدث خطأ أثناء التحقق";
    
    if (err instanceof Error) {
      msg = err.message;
    } else if (err && typeof err === "object") {
      const o = err as Record<string, unknown>;
      // جرب استخراج الرسالة من عدة حقول ممكنة
      if (typeof o.message === "string") {
        msg = o.message;
      } else if (typeof o.errorMessage === "string") {
        msg = o.errorMessage;
      } else if (typeof o.error === "string") {
        msg = o.error;
      } else if (typeof o.error === "object" && o.error !== null && "message" in o.error) {
        msg = (o.error as Record<string, unknown>).message as string;
      } else if (typeof o.toString === "function") {
        msg = o.toString();
      } else {
        msg = JSON.stringify(o).substring(0, 200) || "خطأ غير معروف";
      }
    } else if (typeof err === "string") {
      msg = err;
    }
    
    // تأكد أن الرسالة ليست [object Object]
    if (msg === "[object Object]") {
      msg = "حدث خطأ أثناء التحقق من الاشتراك. يرجى المحاولة لاحقاً.";
    }
    
    return { ok: false, error: msg || "حدث خطأ أثناء التحقق" };
  }
}
