'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';

interface QRCodeButtonProps {
  url: string;
  storeName: string;
}

// Create a wrapper component for QRCode
const QRCodeCanvas = dynamic(
  () => import('qrcode.react').then((mod) => {
    // Return a wrapper component
    return ({ value, size, level, includeMargin }: any) => {
      const QR = mod.QRCodeCanvas;
      return <QR value={value} size={size} level={level} includeMargin={includeMargin} />;
    };
  }),
  { 
    ssr: false,
    loading: () => <div className="w-[200px] h-[200px] bg-gray-100 animate-pulse rounded" />
  }
);

export function QRCodeButton({ url, storeName }: QRCodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Effect to capture the canvas as a data URL whenever it renders or dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the canvas has rendered
      const timer = setTimeout(() => {
        const canvas = canvasRef.current?.querySelector('canvas');
        if (canvas) {
          setQrDataUrl(canvas.toDataURL('image/png'));
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, url]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">رمز QR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">رمز QR للمتجر</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative group">
            <div ref={canvasRef} className="bg-white p-4 rounded-lg shadow-inner">
              <QRCodeCanvas
                value={url}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            {/* Overlay instructions for mobile */}
            <p className="sm:hidden text-[10px] text-muted-foreground text-center mt-2">
              اضغط مطولاً على الرمز لحفظه (من المتصفح فقط)
            </p>
          </div>

          <p className="text-sm text-muted-foreground text-center px-4">
            امسح هذا الرمز للوصول إلى متجرك أو شاركه مع عملائك
          </p>
          
          {/* Hidden image for mobile long-press - always present but invisible except for system context menu */}
          {qrDataUrl && (
            <div className="absolute opacity-0 pointer-events-auto w-[200px] h-[200px] top-[100px] z-20">
              <img 
                src={qrDataUrl} 
                alt={storeName} 
                className="w-full h-full"
                style={{ WebkitTouchCallout: 'default' }} 
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
