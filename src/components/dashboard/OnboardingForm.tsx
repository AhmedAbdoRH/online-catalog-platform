'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createCatalog } from '@/app/actions/catalog';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
};

export function OnboardingForm() {
  const [state, formAction] = useActionState(createCatalog, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

   useEffect(() => {
    if (state?.message) {
      toast({
        title: 'خطأ',
        description: state.message,
        variant: 'destructive'
      });
    }
  }, [state, toast]);

  return (
      <form ref={formRef} action={formAction} className="space-y-8">
        {state?.message && (
            <Alert variant="destructive">
                <AlertTitle>حدث خطأ</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}
        <div className="space-y-2">
            <Label htmlFor="name">اسم الكتالوج (باللغة الإنجليزية)</Label>
            <Input 
                id="name"
                name="name"
                placeholder="my-restaurant" 
                required 
                pattern="^[a-z0-9-]+$"
                title="يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط"
            />
            <p className="text-sm text-muted-foreground">
                سيتم استخدام هذا الاسم في رابط الكتالوج الخاص بك. مثال: my-restaurant.online-menu.site
            </p>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="logo">شعار العمل</Label>
            <Input 
                id="logo"
                name="logo"
                type="file" 
                accept="image/*" 
                required 
            />
        </div>

        <SubmitButton pendingText="جاري الإنشاء..." className="w-full">
          إنشاء كتالوجي
        </SubmitButton>
      </form>
  );
}
