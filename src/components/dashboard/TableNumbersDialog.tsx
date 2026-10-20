"use client";

import { useEffect, useState } from 'react';
import { UtensilsCrossed, Plus, X, Loader2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTableNumbers } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { sortTableNumbers, type TableNumbers } from '@/lib/tables';

interface TableNumbersDialogProps {
  catalogId: number;
  tableNumbers: TableNumbers | null | undefined;
  disabled?: boolean;
  restaurantEnabled?: boolean;
  onToggleEnabled?: (enabled: boolean) => void;
}

export function TableNumbersDialog({
  catalogId,
  tableNumbers,
  disabled = false,
  restaurantEnabled = false,
  onToggleEnabled,
}: TableNumbersDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftTables, setDraftTables] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const tables = Array.isArray(tableNumbers) && tableNumbers.length > 0
        ? [...tableNumbers]
        : [''];
      setDraftTables(tables);
    }
  }, [open, tableNumbers]);

  const tableCount = Array.isArray(tableNumbers) ? tableNumbers.length : 0;

  const handleAddTable = () => {
    setDraftTables([...draftTables, '']);
  };

  const handleRemoveTable = (index: number) => {
    setDraftTables(draftTables.filter((_, i) => i !== index));
  };

  const handleTableChange = (index: number, value: string) => {
    const newTables = [...draftTables];
    newTables[index] = value;
    setDraftTables(newTables);
  };

  const handleSave = async () => {
    // Filter out empty entries
    const cleanedTables = draftTables
      .map((t) => t.trim())
      .filter((t) => t !== '');

    setIsSaving(true);
    try {
      const result = await updateTableNumbers(catalogId, cleanedTables);
      if (!result.success) {
        toast({
          title: 'تعذر الحفظ',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'تم الحفظ',
        description: result.message,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error saving table numbers:', error);
      toast({
        title: 'حدث خطأ',
        description: 'فشل حفظ أرقام الطاولات',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sortedCurrentTables = Array.isArray(tableNumbers)
    ? sortTableNumbers(tableNumbers)
    : [];

  return (
    <div className="pt-6 border-t">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-col">
            <Label className="text-base font-semibold">أرقام الطاولات (نظام المطاعم/الكافيهات)</Label>
            <p className="text-[11px] leading-tight text-muted-foreground">
              أضف أرقام أو أسماء الطاولات المتاحة. سيختار العميل رقم الطاولة عند الطلب.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={restaurantEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleEnabled?.(!restaurantEnabled)}
              disabled={disabled}
              className={`gap-2 ${restaurantEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              <Power className="h-3.5 w-3.5" />
              {restaurantEnabled ? 'مفعّل' : 'معطّل'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(true)}
              disabled={disabled || !restaurantEnabled}
              className="gap-2"
            >
              <UtensilsCrossed className="h-4 w-4" />
              إدارة الطاولات
            </Button>
          </div>
        </div>
      </div>

      {restaurantEnabled && (
        <>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <UtensilsCrossed className="h-4 w-4 text-brand-primary" />
            <span>
              {tableCount === 0 ? 'لم يتم إضافة طاولات بعد' : `${tableCount} طاولة متاحة`}
            </span>
          </div>

          {tableCount > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sortedCurrentTables.map((table) => (
                <span
                  key={table}
                  className="inline-flex items-center rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary"
                >
                  {table}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg p-0">
          <DialogHeader className="px-5 pt-5 text-right">
            <DialogTitle className="flex items-center justify-end gap-2">
              إدارة أرقام الطاولات
              <UtensilsCrossed className="h-5 w-5 text-brand-primary" />
            </DialogTitle>
            <DialogDescription>
              أضف أرقام أو أسماء الطاولات (مثل: 1، 2، A1، VIP-1). يمكنك ترتيبها كما تشاء.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            <div className="space-y-2">
              {draftTables.map((table, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={table}
                    onChange={(e) => handleTableChange(index, e.target.value)}
                    placeholder={`طاولة ${index + 1}`}
                    disabled={isSaving}
                    className="text-right"
                  />
                  {draftTables.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTable(index)}
                      disabled={isSaving}
                      className="h-10 w-10 shrink-0 text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddTable}
              disabled={isSaving}
              className="mt-3 w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة طاولة جديدة
            </Button>
          </div>

          <div className="flex items-center gap-2 border-t px-5 py-4">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            >
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ أرقام الطاولات
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
