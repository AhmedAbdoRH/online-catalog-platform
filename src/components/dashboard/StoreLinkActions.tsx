'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StoreLinkActionsProps {
  storeId: string;
}

export function StoreLinkActions({ storeId }: StoreLinkActionsProps) {
  const [copied, setCopied] = useState(false);
  const storeUrl = `https://online-catalog.net/${storeId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'متجري الإلكتروني',
          text: 'تصفح منتجاتنا واطلب الآن',
          url: storeUrl,
        });
      } else {
        // Fallback to copy if share is not supported
        handleCopy();
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs hover:bg-background transition-colors"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 ml-1" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground ml-1" />}
              <span className="hidden lg:inline-block">{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>نسخ رابط المتجر</TooltipContent>
        </Tooltip>

        <div className="w-[1px] h-4 bg-border/80" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs hover:bg-background transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5 text-brand-primary ml-1" />
              <span className="hidden lg:inline-block text-brand-primary">مشاركة</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>مشاركة رابط المتجر</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
