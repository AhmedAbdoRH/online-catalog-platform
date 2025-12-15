'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface ProductGalleryProps {
    images: string[];
    productName: string;
    className?: string;
    placeholder?: React.ReactNode;
}

function SlideImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white/80">
                فشل تحميل الصورة
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            onError={() => {
                console.error('ProductGallery image failed to load:', src);
                setHasError(true);
            }}
            onLoad={() => {
                console.debug('ProductGallery image loaded:', src);
            }}
        />
    );
}

export function ProductGallery({ images, productName, className, placeholder }: ProductGalleryProps) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');

    const normalizeImageUrl = (url: string) => {
        if (!url) return '';
        const trimmed = url.trim();
        if (trimmed.startsWith('http')) return trimmed;
        if (supabaseUrl) {
            const cleanPath = trimmed.replace(/^\/+/, '');
            return `${supabaseUrl}/storage/v1/object/public/menu_images/${cleanPath}`;
        }
        return trimmed;
    };

    const normalizedImages = images
        .map((url) => normalizeImageUrl(url))
        .filter((url) => url.length > 0);

    console.log('[ProductGallery] Received images:', images);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: 'rtl' }, [
        Autoplay({ delay: 4000, stopOnInteraction: true })
    ]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    if (normalizedImages.length === 0) {
        return (
            <div className={cn("relative h-full w-full", className)}>
                {placeholder || (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                        <Sparkles className="h-10 w-10 text-white/50" />
                        <p className="text-sm text-white/70">صورة المنتج غير متوفرة</p>
                    </div>
                )}
            </div>
        )
    }

    if (normalizedImages.length === 1) {
        return (
            <div className={cn("relative h-full w-full overflow-hidden", className)}>
                <SlideImage src={normalizedImages[0]} alt={productName} priority />
            </div>
        );
    }

    return (
        <div className={cn("relative h-full w-full flex flex-col", className)}>
            {/* Main Carousel */}
            <div className="overflow-hidden h-full w-full flex-1 relative" ref={emblaRef}>
                <div className="flex h-full touch-pan-y">
                    {normalizedImages.map((src, index) => (
                        <div className="relative flex-[0_0_100%] min-w-0 h-full" key={index}>
                            <SlideImage src={src} alt={`${productName} - ${index + 1}`} priority={index === 0} />

                            <div className="absolute left-2 top-2 z-20 text-xs text-white/80 pointer-events-none">
                                <span className="truncate max-w-[60%]">{src}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10">
                    {normalizedImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                // Enable pointer events for buttons
                                e.stopPropagation();
                                scrollTo(index);
                            }}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300 pointer-events-auto shadow-sm backdrop-blur-sm",
                                index === selectedIndex ? "bg-white w-6" : "bg-white/40 w-1.5 hover:bg-white/60"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
