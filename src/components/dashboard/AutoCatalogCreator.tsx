'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createCatalog, checkCatalogName } from '@/app/actions/catalog';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { slugify, convertArabicNumerals } from '@/lib/utils';
import { OnboardingFormSimple } from './OnboardingFormSimple';

export function AutoCatalogCreator({
    userPhone,
    userEmail,
    userName
}: {
    userPhone: string,
    userEmail?: string,
    userName?: string
}) {
    const router = useRouter();
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleCreateCatalog = useCallback(async (displayName: string, slug: string, whatsapp: string, businessType: string) => {
        setIsCreating(true);
        const cleanSlug = convertArabicNumerals(slug).replace(/[^\d]/g, '');
        const cleanWhatsapp = convertArabicNumerals(whatsapp).replace(/[^\d+]/g, '');

        const formData = new FormData();
        formData.append('display_name', displayName.trim());
        formData.append('name', cleanSlug);
        // Extract country code if present, otherwise default to +20
        let countryCode = '+20';
        if (cleanWhatsapp.startsWith('+966')) countryCode = '+966';
        else if (cleanWhatsapp.startsWith('+971')) countryCode = '+971';
        else if (cleanWhatsapp.startsWith('+212')) countryCode = '+212';
        else if (cleanWhatsapp.startsWith('+20')) countryCode = '+20';

        formData.append('country_code', countryCode);

        // Ensure whatsapp is properly saved
        if (!cleanWhatsapp.startsWith('+')) {
            formData.set('whatsapp_number', countryCode + cleanWhatsapp.replace(/[^\d]/g, ''));
        } else {
            formData.set('whatsapp_number', cleanWhatsapp);
        }

        // Business segment chosen at signup (defaults to 'store' for older pending data)
        formData.append('business_type', businessType === 'restaurant' ? 'restaurant' : 'store');

        try {
            const result = await createCatalog(null, formData);

            if (result && result.message === undefined) {
                // Success: createCatalog redirects or we reload
                localStorage.removeItem('pendingStoreName');
                localStorage.removeItem('pendingStoreSlug');
                localStorage.removeItem('pendingWhatsApp');
                localStorage.removeItem('pendingBusinessType');
                router.refresh();
            } else if (result && result.message) {
                toast({
                    title: 'تنبيه',
                    description: result.message,
                    variant: 'destructive',
                });
                setIsCreating(false);
            }
        } catch (error) {
            console.error('Auto creation failed:', error);
            setIsCreating(false);
        }
    }, [router, toast]);

    useEffect(() => {
        const pendingStoreName = localStorage.getItem('pendingStoreName');
        const pendingStoreSlug = localStorage.getItem('pendingStoreSlug');
        const pendingWhatsApp = localStorage.getItem('pendingWhatsApp');

        if (pendingStoreName && pendingStoreSlug && pendingWhatsApp) {
            // Older pending data (started before this feature) defaults to 'store'
            const pendingBusinessType = localStorage.getItem('pendingBusinessType') || 'store';
            handleCreateCatalog(pendingStoreName, pendingStoreSlug, pendingWhatsApp, pendingBusinessType);
        } else {
            setShowForm(true);
        }
    }, [handleCreateCatalog]);

    if (showForm && !isCreating) {
        return (
            <OnboardingFormSimple
                onSubmit={(data) => handleCreateCatalog(data.displayName, data.slug, data.whatsapp, data.businessType)}
                isSubmitting={isCreating}
            />
        );
    }

    if (!isCreating) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
            <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <Loader2 className="h-12 w-12 text-brand-primary animate-spin relative z-10" />
            </div>
            <div className="space-y-2 relative z-10">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    جار إنشاء المتجر...
                    <Sparkles className="h-5 w-5 text-amber-500 animate-bounce" />
                </h2>
                <p className="text-muted-foreground">ثواني ونكون انتهينا من إعداد كل شيء لك</p>
            </div>
        </div>
    );
}
