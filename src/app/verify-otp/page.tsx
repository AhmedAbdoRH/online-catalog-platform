import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default async function VerifyOtpPage({ searchParams }: { searchParams: Promise<{ message: string; phone: string; type: string }> }) {
    const params = await searchParams;
    const phone = params.phone;
    const type = params.type || 'sms'; // 'login' or 'signup'

    const verifyOtp = async (formData: FormData) => {
        'use server';
        const otp = formData.get('otp') as string;
        const phone = formData.get('phone') as string;
        const verificationType = formData.get('type') as string;

        const supabase = await createClient();

        // Determine OTP type based on verification type
        const otpType = verificationType === 'signup' ? 'phone_change' : 'sms';

        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms',
        });

        if (error) {
            console.error('OTP verification error:', error.message);
            return redirect(`/verify-otp?message=${encodeURIComponent('خطأ: رمز التحقق غير صحيح أو منتهي الصلاحية')}&phone=${encodeURIComponent(phone)}&type=${verificationType}`);
        }

        return redirect('/dashboard');
    };

    const isSignup = type === 'signup';

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center">
                        {isSignup ? 'تأكيد رقم الهاتف' : 'التحقق من رمز OTP'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        لقد أرسلنا رمز تحقق إلى رقم هاتفك {phone}. يرجى إدخال الرمز أدناه.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4" action={verifyOtp}>
                        <div className="grid gap-2">
                            <Label htmlFor="otp">رمز التحقق (OTP)</Label>
                            <Input 
                                id="otp" 
                                name="otp" 
                                type="text" 
                                required 
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                                placeholder="000000"
                            />
                            <input type="hidden" name="phone" value={phone} />
                            <input type="hidden" name="type" value={type} />
                        </div>
                        <Button type="submit" className="w-full">
                            {isSignup ? 'تأكيد وإنشاء الحساب' : 'تحقق وتسجيل الدخول'}
                        </Button>
                        {params?.message && (
                            <p className="mt-4 p-4 bg-destructive/15 text-destructive text-center rounded-md text-sm">
                                {params.message}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}