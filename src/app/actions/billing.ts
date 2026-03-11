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
    const result = await verifier.verifySub({
      packageName: PACKAGE_NAME,
      productId: PRODUCT_ID,
      purchaseToken,
    });

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
      msg =
        (o.errorMessage as string) ??
        (o.message as string) ??
        (o.error as string) ??
        JSON.stringify(o);
    } else if (typeof err === "string") {
      msg = err;
    }
    return { ok: false, error: msg || "حدث خطأ أثناء التحقق" };
  }
}
