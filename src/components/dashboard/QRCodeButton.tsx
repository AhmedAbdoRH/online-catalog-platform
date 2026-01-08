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
import { QrCode, Download } from 'lucide-react';

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
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    try {
      // Create a blob from the canvas
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      // For mobile devices, we can try to use the Web Share API if available
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'qrcode.png', { type: 'image/png' })] })) {
        const file = new File([blob], `${storeName}-qrcode.png`, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'رمز QR للمتجر',
          text: `رمز QR لمتجر ${storeName}`,
        });
        return;
      }

      // Fallback for browsers that don't support sharing files or desktop
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.download = `${storeName}-qrcode.png`;
      downloadLink.href = url;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      // Final fallback to data URL
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${storeName}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    }
  };

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
          <div ref={canvasRef} className="bg-white p-4 rounded-lg">
            <QRCodeCanvas
              value={url}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            امسح هذا الرمز للوصول إلى متجرك
          </p>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            تحميل الرمز
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
