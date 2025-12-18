'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export function WelcomePopup() {
  // Always return null to disable the welcome popup
  return null;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="relative w-full max-w-md bg-[#1a3a4a] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 flex gap-4">
          {/* Character illustration */}
          <div className="flex-shrink-0 w-32 relative flex items-center justify-center">
            <Image
              src="/caracter.png"
              alt="Welcome Character"
              width={140}
              height={140}
              className="object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 text-right pt-2">
            <h2 className="text-2xl font-bold text-white leading-tight mb-1">
              لحظة من فضلك!
            </h2>
            <h3 className="text-xl font-bold text-white leading-tight mb-4">
              متجرك جاهز للانطلاق.
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              بدل فوضى الواتساب، امتلك كتالوج احترافي وابدأ استقبال الطلبات في 3 دقائق.
              <br />
              <span className="text-[#4ade80] font-bold">مجاناً!</span>
            </p>
            
            <Link href="/signup" onClick={handleClose}>
              <Button className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-[#1a3a4a] font-bold text-lg h-12 rounded-xl transition-all hover:scale-105">
                أنشئ متجري الآن
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}