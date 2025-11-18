'use client';

import { useMemo, useState, useTransition } from 'react';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { deleteCategory } from '@/app/actions/categories';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

type CategoryGroup = {
  parent: Category | null;
  children: Category[];
};

function buildHierarchy(categories: Category[]): CategoryGroup[] {
  const roots = categories.filter((cat) => !cat.parent_category_id);
  const childrenMap = new Map<number, Category[]>();

  categories.forEach((cat) => {
    if (!cat.parent_category_id) return;
    const bucket = childrenMap.get(cat.parent_category_id) ?? [];
    bucket.push(cat);
    childrenMap.set(cat.parent_category_id, bucket);
  });

  const groups = roots.map((parent) => ({
    parent,
    children: (childrenMap.get(parent.id) ?? []).sort((a, b) => a.name.localeCompare(b.name, 'ar')),
  }));

  const orphanChildren = categories.filter(
    (cat) => cat.parent_category_id && !categories.find((parent) => parent.id === cat.parent_category_id)
  );

  if (orphanChildren.length) {
    groups.push({
      parent: null,
      children: orphanChildren,
    });
  }

  return groups.sort((a, b) => {
    const nameA = a.parent?.name ?? 'فئات إضافية';
    const nameB = b.parent?.name ?? 'فئات إضافية';
    return nameA.localeCompare(nameB, 'ar');
  });
}

type CategoryActionsMenuProps = {
  category: Category;
  catalogId: number;
  categories: Category[];
  size?: 'icon' | 'default';
};

function CategoryActionsMenu({ category, catalogId, categories, size = 'default' }: CategoryActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.error) {
        toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'تم الحذف', description: 'تم حذف الفئة بنجاح.' });
        setDeleteOpen(false);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-haspopup="true"
            size={size === 'icon' ? 'icon' : 'sm'}
            variant={size === 'icon' ? 'ghost' : 'outline'}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">القائمة</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setEditOpen(true);
            }}
          >
            تعديل
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الفئة</DialogTitle>
            <DialogDescription>قم بتحديث اسم الفئة أو ربطها بفئة رئيسية.</DialogDescription>
          </DialogHeader>
          <CategoryForm
            catalogId={catalogId}
            category={category}
            categories={categories}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذه الفئة وجميع الفئات الفرعية والمنتجات المرتبطة بها بشكل دائم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              نعم، احذف الفئة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function CategoriesTable({ categories, catalogId }: { categories: Category[]; catalogId: number }) {
  const hierarchy = useMemo(() => buildHierarchy(categories), [categories]);

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 py-10 text-center text-muted-foreground">
        لم تقم بإضافة أي فئات بعد. استخدم زر “إضافة فئة” لبدء تنظيم قائمتك.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {hierarchy.map(({ parent, children }) => {
        const hasParent = Boolean(parent);
        const title = parent?.name ?? 'فئات فرعية غير مرتبطة';
        const createdLabel =
          parent?.created_at &&
          `أنشئت بتاريخ ${format(new Date(parent.created_at), 'd MMM yyyy', { locale: arSA })}`;

        return (
          <div
            key={parent?.id ?? `orphan-${children.length}`}
            className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">
                  {hasParent
                    ? children.length > 0
                      ? `${children.length} فئات فرعية`
                      : 'لا توجد فئات فرعية'
                    : 'هذه الفئات لم تُربط بعد بفئة رئيسية، يمكنك ربطها من خلال تعديلها.'}
                  {createdLabel && (
                    <span className="ml-2 text-xs text-muted-foreground/80">• {createdLabel}</span>
                  )}
                </p>
              </div>
              {hasParent && parent && (
                <CategoryActionsMenu category={parent} catalogId={catalogId} categories={categories} />
              )}
            </div>

            {children.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="group inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-foreground"
                  >
                    <span>{child.name}</span>
                    <Badge variant="secondary" className="bg-white/70 text-xs text-muted-foreground">
                      فئة فرعية
                    </Badge>
                    <CategoryActionsMenu
                      category={child}
                      catalogId={catalogId}
                      categories={categories}
                      size="icon"
                    />
                  </div>
                ))}
              </div>
            )}

            {hasParent && children.length === 0 && (
              <p className="mt-3 rounded-xl border border-dashed border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                لم تُضف فئات فرعية لهذه الفئة بعد. يمكنك إنشاؤها من خلال اختيار هذه الفئة كفئة أم أثناء الحفظ.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
