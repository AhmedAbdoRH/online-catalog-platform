'use client';

import { useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import { MessageCircle, Package, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ItemVariant } from '@/lib/types';
import { hasConfiguredShippingRates, type ShippingRates } from '@/lib/shipping';
import { ShareButtons } from './ShareButtons';
import { DirectOrderForm, type DirectOrderFormData } from './DirectOrderForm';
import { saveCustomerData } from '@/app/actions/customer';
import { useCart } from '@/components/cart/CartContext';

interface ProductActionsProps {
    basePrice: number;
    baseDiscountPrice?: number | null;
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
    shippingRates?: ShippingRates | null;
}

export function ProductActions({
    basePrice,
    baseDiscountPrice,
    variants = [],
    productName,
    catalogName,
    catalogPhone,
    productUrl,
    countryCode,
    directOrderEnabled = true,
    catalogId,
    productId,
    productImage,
    shippingRates,
}: ProductActionsProps) {
    const { addItem, openCart } = useCart();
    const sortedVariants = [...variants].sort((a, b) => a.price - b.price);

    const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(
        sortedVariants.length > 0 ? sortedVariants[0] : null
    );
    const [showDirectOrderDialog, setShowDirectOrderDialog] = useState(false);
    const [customerData, setCustomerData] = useState<DirectOrderFormData | null>(null);

    const hasBaseDiscount =
        !selectedVariant &&
        typeof baseDiscountPrice === 'number' &&
        baseDiscountPrice >= 0 &&
        baseDiscountPrice < basePrice;
    const currentPrice = selectedVariant ? selectedVariant.price : hasBaseDiscount ? Number(baseDiscountPrice) : basePrice;
    const shippingEnabled = hasConfiguredShippingRates(shippingRates);

    const getWhatsAppLink = (orderData?: DirectOrderFormData | null) => {
        if (!catalogPhone) return null;

        let message = `أرغب في طلب ${productName}`;
        if (selectedVariant) {
            message += ` (${selectedVariant.name})`;
        }
        message += ` من ${catalogName}`;
        message += `.\nالسعر: ${formatPrice(currentPrice, countryCode)}`;

        if (orderData?.governorateName && typeof orderData.shippingPrice === 'number') {
            message += `\nالشحن (${orderData.governorateName}): ${formatPrice(orderData.shippingPrice, countryCode)}`;
            message += `\nالإجمالي: ${formatPrice(orderData.orderTotal ?? currentPrice + orderData.shippingPrice, countryCode)}`;
        }

        message += `\nالتفاصيل: ${productUrl}`;

        if (orderData && (orderData.name || orderData.phone || orderData.address)) {
            message += `\n\nبيانات العميل:`;
            if (orderData.name) message += `\nالاسم: ${orderData.name}`;
            if (orderData.phone) message += `\nرقم الهاتف: ${orderData.phone}`;
            if (orderData.address) message += `\nالعنوان: ${orderData.address}`;
            if (orderData.governorateName) message += `\nالمحافظة: ${orderData.governorateName}`;
        }

        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = catalogPhone.replace(/[^\d]/g, '');

        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    };

    const handleDirectOrderSubmit = (data: DirectOrderFormData) => {
        setCustomerData(data);
        setShowDirectOrderDialog(false);

        if (catalogId && data.name && data.phone) {
            saveCustomerData(catalogId, data.name, data.phone, data.address || '');
        }

        const link = getWhatsAppLink(data);
        if (link) {
            window.open(link, '_blank');
        }
    };

    const handleInquiry = () => {
        setShowDirectOrderDialog(false);
        if (catalogPhone) {
            const message = 'استفسار بخصوص الطلب ..';
            const encodedMessage = encodeURIComponent(message);
            const cleanPhone = catalogPhone.replace(/[^\d]/g, '');
            const link = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
            window.open(link, '_blank');
        }
    };

    const whatsappLink = getWhatsAppLink(customerData);

    const renderPriceDisplay = () => (
        <div className="flex items-center justify-between text-sm">
            <span className="font-bold italic text-muted-foreground">السعر</span>
            <span className="flex flex-col items-end gap-0.5">
                {hasBaseDiscount && (
                    <span className="text-xs font-bold text-muted-foreground line-through">
                        {formatPrice(basePrice, countryCode)}
                    </span>
                )}
                <span className="text-2xl font-black text-brand-accent drop-shadow-sm">
                    {formatPrice(currentPrice, countryCode)}
                </span>
            </span>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {sortedVariants.length > 0 && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">اختر الحجم / النوع:</label>
                    <div className="flex flex-wrap gap-2">
                        {sortedVariants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={cn(
                                    'rounded-xl border px-4 py-2 text-sm transition-all duration-200',
                                    selectedVariant?.id === variant.id
                                        ? 'border-brand-primary bg-brand-primary font-semibold text-primary-foreground shadow-md'
                                        : 'border-transparent bg-white/50 text-foreground hover:border-brand-primary/30 hover:bg-white/80'
                                )}
                            >
                                {variant.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-3 rounded-2xl border border-dashed border-white/40 bg-white/60 p-4 shadow-inner backdrop-blur dark:bg-slate-950/50">
                {renderPriceDisplay()}
            </div>

            <div className="flex flex-wrap gap-3">
                {whatsappLink ? (
                    directOrderEnabled ? (
                        <Button
                            onClick={() => setShowDirectOrderDialog(true)}
                            className="h-12 flex-1 rounded-full bg-[#25D366] text-sm font-semibold shadow-[0_18px_40px_rgba(37,211,102,0.35)] hover:bg-[#1fb55b]"
                        >
                            <MessageCircle className="ml-2 h-5 w-5" />
                            {sortedVariants.length > 0 ? `اطلب (${selectedVariant?.name || 'الآن'})` : 'اطلب عبر واتساب'}
                        </Button>
                    ) : (
                        <Button
                            asChild
                            className="h-12 flex-1 rounded-full bg-[#25D366] text-sm font-semibold shadow-[0_18px_40px_rgba(37,211,102,0.35)] hover:bg-[#1fb55b]"
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

                <Button
                    onClick={() => {
                        const itemName = selectedVariant
                            ? `${productName} (${selectedVariant.name})`
                            : productName;
                        addItem({
                            id: selectedVariant ? Number(`${productId}${selectedVariant.id}`) : productId,
                            name: itemName,
                            price: currentPrice,
                            image_url: productImage || undefined,
                        }, 1);
                        openCart();
                    }}
                    className="group relative flex h-12 w-12 items-center justify-center gap-0.5 overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-[0_15px_35px_rgba(20,184,166,0.3)] transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_45px_rgba(20,184,166,0.45)]"
                    title="إضافة للسلة"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <Plus className="h-2.5 w-2.5 transition-transform duration-500 group-hover:rotate-90" />
                    <ShoppingCart className="h-5.5 w-5.5" />
                </Button>
            </div>

            <ShareButtons catalogName={catalogName} />

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
                        subtotal={shippingEnabled ? currentPrice : undefined}
                        shippingRates={shippingEnabled ? shippingRates : undefined}
                        countryCode={countryCode}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
