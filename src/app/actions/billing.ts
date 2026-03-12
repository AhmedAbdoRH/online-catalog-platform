"use server";

import Verifier from "google-play-billing-validator";
import { createAdminClient } from "@/lib/supabase/admin";
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
    return { ok: false, error: "لم يتم إعداد التحقق من Google Play" };
  }
  // تصحيح المفتاح: بعض المنصات تخزن \n كنص، نحولها لأسطر فعلية
  if (key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }

  try {
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
    } catch (verifyErr: unknown) {
      // معالجة الأخطاء من Verifier مباشرة
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
      return { ok: false, error: result?.errorMessage || "فشل التحقق من الاشتراك" };
    }

    const supabaseAdmin = createAdminClient();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "يجب تسجيل الدخول" };
    }

    const { data: catalog } = await supabaseAdmin
      .from("catalogs")
      .select("id, user_id")
      .eq("id", catalogId)
      .single();

    if (!catalog) {
      return { ok: false, error: "الكتالوج غير موجود" };
    }
    if (catalog.user_id !== user.id) {
      return { ok: false, error: "غير مصرح بتحديث هذا الكتالوج" };
    }

    const { error } = await supabaseAdmin
      .from("catalogs")
      .update({ plan: "pro" })
      .eq("id", catalogId);

    if (error) {
      return { ok: false, error: error.message || "فشل تحديث الخطة" };
    }
    return { ok: true };
  } catch (err: unknown) {
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
