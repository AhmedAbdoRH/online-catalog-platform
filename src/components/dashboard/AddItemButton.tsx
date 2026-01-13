'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ItemForm } from './ItemForm';
import type { Category } from '@/lib/types';

interface AddItemButtonProps {
    catalogId: number;
    catalogPlan: string;
    categories: Category[];
    countryCode?: string | null;
}

export function AddItemButton({ catalogId, catalogPlan, categories, countryCode }: AddItemButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap">
                        إضافة منتج
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px] max-h-[95vh] overflow-y-auto bg-emerald-950 border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-amber-500">
                        <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                        إضافة منتج جديد
                    </DialogTitle>
                    <DialogDescription>
                        املأ تفاصيل المنتج الجديد بدقة ليظهر بشكل جذاب في متجرك.
                    </DialogDescription>
                </DialogHeader>
                <ItemForm
                    catalogId={catalogId}
                    isPro={catalogPlan === 'pro' || catalogPlan === 'business'}
                    categories={categories}
                    countryCode={countryCode}
                    onSuccess={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                />

            </DialogContent>
        </Dialog>
    );
}
