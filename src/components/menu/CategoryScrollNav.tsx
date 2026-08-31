"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryWithSubcategories } from "@/lib/types";

interface CategoryScrollNavProps {
  categories: CategoryWithSubcategories[];
  selectedCategoryId: number | null;
  selectedSubcategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onSelectSubcategory: (id: number | null) => void;
  flattenMenuItems: (categories: CategoryWithSubcategories[]) => any[];
}

export function CategoryScrollNav({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectCategory,
  onSelectSubcategory,
  flattenMenuItems,
}: CategoryScrollNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const introAnimationRef = useRef(false);
  const animationTimeoutRef = useRef<number | null>(null);
  const returnTimeoutRef = useRef<number | null>(null);
  const introFrameRef = useRef<number | null>(null);
  const returnFrameRef = useRef<number | null>(null);

  // Check scroll state and overflow
  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 6) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    // In RTL browsers:
    // Chrome/Firefox: scrollLeft is 0 at start (right), and negative as you scroll left.
    // Webkit/Safari: may use positive 0 to maxScroll, or inverted.
    const scrollAbs = Math.abs(el.scrollLeft);
    setCanScrollLeft(scrollAbs < maxScroll - 6);
    setCanScrollRight(scrollAbs > 6);
  }, []);

  // Update on resize & categories change
  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [categories, updateScrollState]);

  // Teaser intro animation: move to the far end once, then ease back to the natural start.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasInteracted || introAnimationRef.current) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 15) return;

    introAnimationRef.current = true;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateTo = (
      from: number,
      to: number,
      duration: number,
      onComplete?: () => void,
      frameRef?: { current: number | null }
    ) => {
      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = easeOutCubic(progress);
        const next = from + (to - from) * eased;

        if (containerRef.current) {
          containerRef.current.scrollLeft = next;
        }

        if (progress < 1) {
          frameRef!.current = window.requestAnimationFrame(tick);
        } else {
          onComplete?.();
        }
      };

      frameRef!.current = window.requestAnimationFrame(tick);
    };

    animationTimeoutRef.current = window.setTimeout(() => {
      if (!containerRef.current || hasInteracted) return;

      const container = containerRef.current;
      const startScroll = container.scrollLeft;
      const endScroll = Math.max(container.scrollWidth - container.clientWidth, 0);

      animateTo(startScroll, endScroll, 900, () => {
        returnTimeoutRef.current = window.setTimeout(() => {
          if (!containerRef.current || hasInteracted) return;

          const returnStart = containerRef.current.scrollLeft;
          animateTo(returnStart, 0, 700, undefined, returnFrameRef);
        }, 220);
      }, introFrameRef);
    }, 800);

    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      if (returnTimeoutRef.current) {
        window.clearTimeout(returnTimeoutRef.current);
      }
      if (introFrameRef.current) {
        window.cancelAnimationFrame(introFrameRef.current);
      }
      if (returnFrameRef.current) {
        window.cancelAnimationFrame(returnFrameRef.current);
      }
    };
  }, [categories, hasInteracted]);

  // Scroll manually via buttons
  const handleScrollBy = (distance: number) => {
    setHasInteracted(true);
    const el = containerRef.current;
    if (!el) return;

    el.scrollBy({ left: distance, behavior: "smooth" });
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    setHasInteracted(true);
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    startScrollLeftRef.current = el.scrollLeft;
    hasMovedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;

    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }

    el.scrollLeft = startScrollLeftRef.current - walk;
    updateScrollState();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Prevent item click if user was dragging
  const handleCategoryClick = (catId: number | null, element?: HTMLElement | null) => {
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }
    setHasInteracted(true);
    onSelectCategory(catId);
    onSelectSubcategory(null);

    // Scroll selected category into view smoothly
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const selectedMainCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)
    : null;

  return (
    <div className="mx-auto w-full mt-6 select-none">
      {/* Categories Toolbar Container with Relative Controls */}
      <div className="relative group/catnav">
        {/* Right Arrow Navigation & Fade Mask (Scroll back to start) */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pr-1 pl-6 bg-gradient-to-l from-background/90 via-background/60 to-transparent pointer-events-none rounded-r-2xl">
            <button
              type="button"
              onClick={() => handleScrollBy(240)}
              className="pointer-events-auto flex items-center justify-center h-8 w-8 rounded-full bg-white/20 dark:bg-black/40 hover:bg-white/30 backdrop-blur-md border border-white/20 text-foreground shadow-md transition-all active:scale-95"
              aria-label="التمرير للبداية"
              title="التمرير للبداية"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Horizontal Scrollable Categories */}
        <div
          ref={containerRef}
          onScroll={updateScrollState}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={() => setHasInteracted(true)}
          className="flex items-center gap-2.5 overflow-x-auto pb-3 px-2 scrollbar-none no-scrollbar cursor-grab active:cursor-grabbing scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* "الكل" (All) Button */}
          <button
            onClick={(e) => handleCategoryClick(null, e.currentTarget)}
            aria-pressed={!selectedCategoryId}
            className={cn(
              "flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
              !selectedCategoryId
                ? "bg-gradient-to-r from-[#FFC800] to-[#61ffd0] text-white shadow-lg scale-[1.03]"
                : "bg-white/15 text-foreground/80 hover:bg-white/20 hover:text-foreground"
            )}
          >
            الكل
          </button>

          {/* Categories List */}
          {categories.map((cat) => {
            const catItemCount = flattenMenuItems([cat]).length;
            if (catItemCount === 0) return null;

            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={(e) => handleCategoryClick(cat.id, e.currentTarget)}
                aria-pressed={isSelected}
                className={cn(
                  "flex items-center gap-2 flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                  isSelected
                    ? "bg-gradient-to-r from-[#FFC800] to-[#61ffd0] text-white shadow-lg scale-[1.03]"
                    : "bg-white/15 text-foreground/80 hover:bg-white/20 hover:text-foreground"
                )}
              >
                <span>{cat.name}</span>
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isSelected
                      ? "bg-black/20 text-white"
                      : "bg-white/10 text-muted-foreground opacity-80"
                  )}
                >
                  {catItemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Left Arrow Navigation & Fade Mask (Scroll forward to view more categories) */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-1 pr-6 bg-gradient-to-r from-background/90 via-background/60 to-transparent pointer-events-none rounded-l-2xl">
            <button
              type="button"
              onClick={() => handleScrollBy(-240)}
              className="pointer-events-auto relative flex items-center justify-center h-8 w-8 rounded-full bg-white/20 dark:bg-black/40 hover:bg-white/30 backdrop-blur-md border border-white/20 text-foreground shadow-md transition-all active:scale-95 animate-pulse"
              aria-label="عرض باقي التصنيفات"
              title="عرض باقي التصنيفات"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Subcategory strip (if a main category with subcategories is selected) */}
      {selectedMainCategory &&
        selectedMainCategory.subcategories &&
        selectedMainCategory.subcategories.length > 0 && (
          <div className="mt-2 flex items-center gap-2 overflow-x-auto px-2 scrollbar-none no-scrollbar pb-1">
            <button
              onClick={() => {
                setHasInteracted(true);
                onSelectSubcategory(null);
              }}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition",
                selectedSubcategoryId === null
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-white/15 text-foreground/80 hover:bg-white/20 hover:text-foreground"
              )}
            >
              الكل
            </button>

            {selectedMainCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setHasInteracted(true);
                  onSelectSubcategory(sub.id);
                }}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition",
                  selectedSubcategoryId === sub.id
                    ? "bg-brand-primary text-white shadow-sm"
                    : "bg-white/15 text-foreground/80 hover:bg-white/20 hover:text-foreground"
                )}
              >
                <span>{sub.name}</span>
                <span className="mr-1.5 inline-flex items-center justify-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium">
                  {sub.menu_items.length}
                </span>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}
