'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Catalog Page Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">عذراً، حدث خطأ ما!</h2>
            <p className="text-muted-foreground mb-4">
                {error.message || 'تعذر تحميل المتجر. يرجى المحاولة مرة أخرى لاحقاً.'}
            </p>
            {error.digest && (
                <p className="text-xs text-gray-500 mb-4">Error ID: {error.digest}</p>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
                <Button
                    onClick={() => reset()}
                    variant="default"
                >
                    محاولة مرة أخرى
                </Button>
                <Button
                    asChild
                    variant="outline"
                    className="bg-[#25D366] hover:bg-[#20ba5a] text-white border-none gap-2 font-bold"
                >
                    <a
                        href={`https://wa.me/201008116452?text=${encodeURIComponent(`مرحباً، واجهت مشكلة في صفحة المتجر. معرف الخطأ: ${error.digest || 'غير معروف'}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <MessageCircle className="h-4 w-4" />
                        تواصل مع المطور
                    </a>
                </Button>
            </div>
        </div>
    );
}
