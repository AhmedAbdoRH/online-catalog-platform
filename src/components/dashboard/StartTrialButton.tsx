"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function StartTrialButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black h-12 rounded-xl text-base shadow-lg shadow-brand-primary/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 ml-2 animate-spin" />
          جاري التفعيل...
        </>
      ) : (
        "الحصول على شهر مجاناً"
      )}
    </Button>
  );
}
