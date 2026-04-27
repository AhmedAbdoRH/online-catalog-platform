'use client';

import { useState, useEffect } from 'react';
import { cn, formatPrice } from "@/lib/utils";
import { MessageCircle, Package, ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ItemVariant } from "@/lib/types";
import { ShareButtons } from './ShareButtons';
import { DirectOrderForm } from './DirectOrderForm';
import { saveCustomerData } from '@/app/actions/customer';
import { useCart } from '@/components/cart/CartContext';

interface ProductActionsProps {
    basePrice: number;
    variants: ItemVariant[];
    productName: string;
    catalogName: string;
    catalogPhone: string | null;
    productUrl: string;
    themeClass?: string;
    countryCode?: string | null;
    directOrderEnabled?: boolean;
    catalogId?: number;
    productId: number;
    productImage?: string | null;
}

interface DirectOrderFormData {
    name: string;
    phone: string;
    address: string;
}

export function ProductActions({
    basePrice,
    variants = [],
    productName,
    catalogName,
    catalogPhone,
    productUrl,
    themeClass,
    countryCode,
    directOrderEnabled = true,
    catalogId,
    productId,
    productImage
}: ProductActionsProps) {
    const { addItem, openCart } = useCart();
    // Sort variants by price just in case
    const sortedVariants = [...variants].sort((a, b) => a.price - b.price);

    // Default to first variant if exists, else null
    const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(
        sortedVariants.length > 0 ? sortedVariants[0] : null
    );

    const [showDirectOrderDialog, setShowDirectOrderDialog] = useState(false);
    const [customerData, setCustomerData] = useState<DirectOrderFormData | null>(null);

    const currentPrice = selectedVariant ? selectedVariant.price : basePrice;

    // Formatting price
    // formatPrice moved to @/lib/utils.ts


    // WhatsApp logic
    const getWhatsAppLink = () => {
        if (!catalogPhone) return null;

        let message = `أرغب في طلب ${productName}`;
        if (selectedVariant) {
            message += ` (${selectedVariant.name})`;
        }
        message += ` من ${catalogName}`;
        message += `.\nالسعر: ${formatPrice(currentPrice, countryCode)}`;
        message += `\nالتفاصيل: ${productUrl}`;

        // Add customer data if available and has content
        if (customerData && (customerData.name || customerData.phone || customerData.address)) {
            message += `\n\n━━━━━━━━━━━━━━━━━━`;
            message += `\n📋 بيانات العميل:`;
            message += `\n━━━━━━━━━━━━━━━━━━`;
            if (customerData.name) message += `\n👤 الاسم: ${customerData.name}`;
            if (customerData.phone) message += `\n📱 رقم الهاتف: ${customerData.phone}`;
            if (customerData.address) message += `\n📍 العنوان: ${customerData.address}`;
            message += `\n━━━━━━━━━━━━━━━━━━`;
        }

        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = catalogPhone.replace(/[^\d]/g, '');

        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    };

    const handleDirectOrderSubmit = (data: DirectOrderFormData) => {
        setCustomerData(data);
        setShowDirectOrderDialog(false);

        // Save customer data to database
        if (catalogId && data.name && data.phone) {
            saveCustomerData(catalogId, data.name, data.phone, data.address || '');
        }

        // Open WhatsApp after form submission
        const link = getWhatsAppLink();
        if (link) {
            window.open(link, '_blank');
        }
    };

    const handleInquiry = () => {
        setShowDirectOrderDialog(false);
        // Open WhatsApp with inquiry message
        if (catalogPhone) {
            const message = `استفسار بخصوص الطلب ..`;
            const encodedMessage = encodeURIComponent(message);
            const cleanPhone = catalogPhone.replace(/[^\d]/g, '');
            const link = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
            window.open(link, '_blank');
        }
    };

    const whatsappLink = getWhatsAppLink();

    // Price Display Logic
    const renderPriceDisplay = () => {
        return (
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-bold italic">السعر</span>
                <span className="font-black text-brand-accent text-2xl drop-shadow-sm">
                    {formatPrice(currentPrice, countryCode)}
                </span>

            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Variants Selection */}
            {sortedVariants.length > 0 && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">اختر الحجم / النوع:</label>
                    <div className="flex flex-wrap gap-2">
                        {sortedVariants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm transition-all duration-200 border",
                                    selectedVariant?.id === variant.id
                                        ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-md font-semibold"
                                        : "bg-white/50 border-transparent hover:bg-white/80 hover:border-brand-primary/30 text-foreground"
                                )}
                            >
                                {variant.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Box */}
            <div className="grid gap-3 rounded-2xl border border-dashed border-white/40 bg-white/60 p-4 shadow-inner backdrop-blur dark:bg-slate-950/50">
                {renderPriceDisplay()}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {whatsappLink ? (
                    directOrderEnabled ? (
                        <Button
                            onClick={() => setShowDirectOrderDialog(true)}
                            className="flex-1 rounded-full bg-[#25D366] text-sm font-semibold shadow-[0_18px_40px_rgba(37,211,102,0.35)] hover:bg-[#1fb55b] h-12"
                        >
                            <MessageCircle className="ml-2 h-5 w-5" />
                            {sortedVariants.length > 0 ? `اطلب (${selectedVariant?.name || 'الآن'})` : 'اطلب عبر واتساب'}
                        </Button>
                    ) : (
                        <Button
                            asChild
                            className="flex-1 rounded-full bg-[#25D366] text-sm font-semibold shadow-[0_18px_40px_rgba(37,211,102,0.35)] hover:bg-[#1fb55b] h-12"
                        >
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="ml-2 h-5 w-5" />
                                {sortedVariants.length > 0 ? `اطلب (${selectedVariant?.name || 'الآن'})` : 'اطلب عبر واتساب'}
                            </a>
                        </Button>
                    )
                ) : (
                    <div className="flex-1 rounded-full border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
                        <MessageCircle className="ml-2 inline h-4 w-4" />
                        رقم الواتساب غير متوفر
                    </div>
                )}

                {/* Add to Cart Icon Button */}
                <Button
                    onClick={() => {
                        const itemName = selectedVariant 
                            ? `${productName} (${selectedVariant.name})` 
                            : productName;
                        addItem({
                            id: selectedVariant ? Number(`${productId}${selectedVariant.id}`) : productId,
                            name: itemName,
                            price: currentPrice,
                            image_url: productImage || undefined
                        }, 1);
                        openCart();
                    }}
                    className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-[0_15px_35px_rgba(20,184,166,0.3)] border border-white/20 hover:scale-110 hover:shadow-[0_20px_45px_rgba(20,184,166,0.45)] transition-all duration-500 flex items-center justify-center gap-0.5 group overflow-hidden relative"
                    title="إضافة للسلة"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Plus className="h-2.5 w-2.5 transition-transform duration-500 group-hover:rotate-90" />
                    <ShoppingCart className="h-5.5 w-5.5" />
                </Button>
            </div>

            <ShareButtons catalogName={catalogName} />

            {/* Direct Order Dialog */}
            <Dialog open={showDirectOrderDialog} onOpenChange={setShowDirectOrderDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            بيانات التوصيل
                        </DialogTitle>
                    </DialogHeader>
                    <DirectOrderForm
                        onSubmit={handleDirectOrderSubmit}
                        onInquiry={handleInquiry}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
