"use client"

import * as React from 'react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from './CartContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Minus, Plus, MessageCircle, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Catalog } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DirectOrderForm } from '@/components/menu/DirectOrderForm'
import { saveCustomerData } from '@/app/actions/customer'

interface DirectOrderFormData {
  name: string;
  phone: string;
  address: string;
}

export function CartDrawer({ catalog }: { catalog: Catalog }) {
  const { items, total, isOpen, closeCart, removeItem, updateQuantity, clear } = useCart()

  const whatsappNumber = catalog.whatsapp_number || ''
  const canOrder = items.length > 0 && !!whatsappNumber
  const directOrderEnabled = catalog.direct_order_enabled ?? true

  const [showDirectOrderDialog, setShowDirectOrderDialog] = useState(false)
  const [customerData, setCustomerData] = useState<DirectOrderFormData | null>(null)

  const message = React.useMemo(() => {
    const lines = items.map((i) => `• ${i.name} × ${i.quantity} — ${formatPrice(i.price * i.quantity, catalog.country_code)}`)
    const totalLine = `\nالإجمالي: ${formatPrice(total, catalog.country_code)}`
    const header = `طلب جديد من كتالوج ${catalog.display_name || catalog.name}:\n\n`
    let fullMessage = `${header}${lines.join('\n')}${totalLine}`

    // Add customer data if available and has content
    if (customerData && (customerData.name || customerData.phone || customerData.address)) {
      fullMessage += `\n\n━━━━━━━━━━━━━━━━━━`
      fullMessage += `\n📋 بيانات العميل:`
      fullMessage += `\n━━━━━━━━━━━━━━━━━━`
      if (customerData.name) fullMessage += `\n👤 الاسم: ${customerData.name}`
      if (customerData.phone) fullMessage += `\n📱 رقم الهاتف: ${customerData.phone}`
      if (customerData.address) fullMessage += `\n📍 العنوان: ${customerData.address}`
      fullMessage += `\n━━━━━━━━━━━━━━━━━━`
    }

    return fullMessage
  }, [items, total, catalog.display_name, catalog.name, catalog.country_code, customerData])

  const orderHref = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`

  const handleDirectOrderSubmit = (data: DirectOrderFormData) => {
    setCustomerData(data)
    setShowDirectOrderDialog(false)

    // Save customer data to database
    if (catalog.id && data.name && data.phone) {
      saveCustomerData(catalog.id, data.name, data.phone, data.address || '')
    }

    // Open WhatsApp after form submission
    window.open(orderHref, '_blank')
  }

  const handleInquiry = () => {
    setShowDirectOrderDialog(false)
    // Open WhatsApp with inquiry message
    if (whatsappNumber) {
      const inquiryMessage = `استفسار بخصوص الطلب ..`
      const encodedMessage = encodeURIComponent(inquiryMessage)
      const cleanPhone = whatsappNumber.replace(/[^\d]/g, '')
      const link = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      window.open(link, '_blank')
    }
  }

  const handleOrderClick = () => {
    if (directOrderEnabled) {
      setShowDirectOrderDialog(true)
    } else {
      window.open(orderHref, '_blank')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent side="right" className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>سلة المشتريات</SheetTitle>
        </SheetHeader>
        <div className="mt-3">
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
              لا توجد منتجات في السلة حتى الآن.
            </div>
          ) : (
            <ScrollArea className="h-[50vh] pr-2">
              <div className="space-y-3">
                {items.map((i) => (
                  <div key={i.id} className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm pr-1">
                    {i.image_url && (
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-sm">
                        <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    
                    <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-xs sm:text-sm leading-tight line-clamp-2">{i.name}</span>
                        <span className="text-xs font-black text-brand-accent mt-0.5">{formatPrice(i.price, catalog.country_code)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/5 shadow-inner">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full hover:bg-white/20 text-white transition-all active:scale-90" 
                            onClick={() => updateQuantity(i.id, i.quantity - 1)} 
                            aria-label="تقليل الكمية"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center font-black text-[10px] text-white">{i.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full hover:bg-white/20 text-white transition-all active:scale-90" 
                            onClick={() => updateQuantity(i.id, i.quantity + 1)} 
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors ml-auto" 
                          onClick={() => removeItem(i.id)} 
                          aria-label="إزالة المنتج"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border bg-muted/20 p-3">
          <span className="text-sm text-muted-foreground font-bold italic">الإجمالي</span>
          <span className="text-xl font-black text-brand-accent drop-shadow-sm">{formatPrice(total, catalog.country_code)}</span>
        </div>
        <SheetFooter className="mt-3">
          <div className="flex w-full flex-col gap-2">
            <Button
              onClick={handleOrderClick}
              disabled={!canOrder}
              className="w-full rounded-full bg-[#25D366] text-white hover:bg-[#1fb55b]"
            >
              <MessageCircle className="ml-2 h-5 w-5" />
              اطلب الآن عبر واتساب
            </Button>
            <Button variant="ghost" className="w-full" onClick={clear} disabled={items.length === 0}>إفراغ السلة</Button>
          </div>
        </SheetFooter>
      </SheetContent>

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
    </Sheet>
  )
}

