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
            decoding="async"
            fetchPriority={priority ? 'high' : 'low'}
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

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const [dragDeltaX, setDragDeltaX] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

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

    // Open lightbox
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setIsClosing(false);
        setDragDeltaX(0);
        setLightboxOpen(true);
    };

    // Close lightbox with animation
    const closeLightbox = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setLightboxOpen(false);
            setIsClosing(false);
            setDragDeltaX(0);
        }, 250);
    }, []);

    // Keyboard support
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') setLightboxIndex(i => (i + 1) % normalizedImages.length);
            if (e.key === 'ArrowRight') setLightboxIndex(i => (i - 1 + normalizedImages.length) % normalizedImages.length);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxOpen, normalizedImages.length, closeLightbox]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (lightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [lightboxOpen]);

    // Drag/swipe to navigate handlers
    const handleDragStart = (clientX: number) => {
        setDragStartX(clientX);
        setDragDeltaX(0);
    };
    const handleDragMove = (clientX: number) => {
        if (dragStartX === null) return;
        setDragDeltaX(clientX - dragStartX);
    };
    const handleDragEnd = () => {
        if (Math.abs(dragDeltaX) > 50) {
            // Swiped right (positive delta) = go to previous image
            if (dragDeltaX > 0) {
                setLightboxIndex(i => (i - 1 + normalizedImages.length) % normalizedImages.length);
            }
            // Swiped left (negative delta) = go to next image
            else {
                setLightboxIndex(i => (i + 1) % normalizedImages.length);
            }
        }
        setDragDeltaX(0);
        setDragStartX(null);
    };

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
            <>
                <div
                    className={cn("relative h-full w-full overflow-hidden cursor-zoom-in", className)}
                    onClick={() => openLightbox(0)}
                    title="اضغط لعرض الصورة بحجم كامل"
                >
                    <SlideImage src={normalizedImages[0]} alt={productName} priority />
                    {/* Zoom hint icon */}
                    <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/40 p-1.5 backdrop-blur-sm pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                    </div>
                </div>
                <ImageLightbox
                    images={normalizedImages}
                    productName={productName}
                    open={lightboxOpen}
                    isClosing={isClosing}
                    currentIndex={lightboxIndex}
                    dragDeltaX={dragDeltaX}
                    onClose={closeLightbox}
                    onChangeIndex={setLightboxIndex}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                />
            </>
        );
    }

    return (
        <>
            <div className={cn("relative h-full w-full flex flex-col", className)}>
                {/* Main Carousel */}
                <div className="overflow-hidden h-full w-full flex-1 relative" ref={emblaRef}>
                    <div className="flex h-full touch-pan-y">
                        {normalizedImages.map((src, index) => (
                            <div
                                className="relative flex-[0_0_100%] min-w-0 h-full cursor-zoom-in"
                                key={index}
                                onClick={() => openLightbox(index)}
                                title="اضغط لعرض الصورة بحجم كامل"
                            >
                                <SlideImage src={src} alt={`${productName} - ${index + 1}`} priority={index === 0} />
                                {/* Zoom hint icon on first slide */}
                                {index === 0 && (
                                    <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/40 p-1.5 backdrop-blur-sm pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none z-10">
                        {normalizedImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
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
            <ImageLightbox
                images={normalizedImages}
                productName={productName}
                open={lightboxOpen}
                isClosing={isClosing}
                currentIndex={lightboxIndex}
                dragDeltaX={dragDeltaX}
                onClose={closeLightbox}
                onChangeIndex={setLightboxIndex}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            />
        </>
    );
}

// ─── Lightbox Component ────────────────────────────────────────────────────────
interface LightboxProps {
    images: string[];
    productName: string;
    open: boolean;
    isClosing: boolean;
    currentIndex: number;
    dragDeltaX: number;
    onClose: () => void;
    onChangeIndex: (i: number) => void;
    onDragStart: (x: number) => void;
    onDragMove: (x: number) => void;
    onDragEnd: () => void;
}

function ImageLightbox({
    images, productName, open, isClosing, currentIndex, dragDeltaX,
    onClose, onChangeIndex, onDragStart, onDragMove, onDragEnd,
}: LightboxProps) {
    if (!open && !isClosing) return null;

    const opacity = 1;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
                animation: isClosing
                    ? 'lightbox-fade-out 250ms ease forwards'
                    : 'lightbox-fade-in 250ms ease forwards',
            }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black"
                style={{ opacity: opacity * 0.95 }}
                onClick={onClose}
            />

            {/* Image container */}
            <div
                className="relative z-10 flex h-full w-full items-center justify-center select-none"
                style={{
                    transform: `translateX(${dragDeltaX}px)`,
                    transition: dragDeltaX === 0 ? 'transform 0.2s ease' : 'none',
                }}
                onMouseDown={(e) => onDragStart(e.clientX)}
                onMouseMove={(e) => { if (e.buttons > 0) onDragMove(e.clientX); }}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
                onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
                onTouchEnd={onDragEnd}
            >
                <img
                    src={images[currentIndex]}
                    alt={`${productName} - ${currentIndex + 1}`}
                    className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
                    draggable={false}
                />
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                aria-label="إغلاق"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>

            {/* Navigation dots */}
            {images.length > 1 && (
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2 pointer-events-none">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeIndex(index);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto backdrop-blur-sm ${
                                index === currentIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/40 w-1.5 hover:bg-white/60'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            <style>{`
                @keyframes lightbox-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes lightbox-fade-out {
                    from { opacity: 1; }
                    to   { opacity: 0; }
                }
            `}</style>
        </div>
    );
}
