'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CornerDownRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';
import { useState, useMemo } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { deleteCategory } from '@/app/actions/categories';
import { toast } from '@/hooks/use-toast';

interface CategoriesTableProps {
    categories: Category[];
    catalogId: number;
    enableSubcategories: boolean;
}

export function CategoriesTable({ categories, catalogId, enableSubcategories }: CategoriesTableProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const categoryTree = useMemo(() => {
    const categoryMap = new Map(categories.map(cat => [cat.id, { ...cat, children: [] as Category[] }]));
    const tree: (Category & { children: Category[] })[] = [];

    categories.forEach(cat => {
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id)!.children.push(categoryMap.get(cat.id)!);
      } else {
        tree.push(categoryMap.get(cat.id)!);
      }
    });
    return tree;
  }, [categories]);

  const mainCategories = categories.filter(c => c.parent_id === null);

  const handleDelete = async (categoryId: number) => {
    const result = await deleteCategory(categoryId);
    if (result.error) {
        toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
    } else {
        toast({ title: 'نجاح', description: 'تم حذف الفئة.' });
    }
  }
  
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  }

  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingCategory(null);
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        لم تقم بإضافة أي فئات بعد.
      </div>
    );
  }
  
  const renderCategoryRow = (category: Category & { children: Category[] }, isSub: boolean) => (
    <React.Fragment key={category.id}>
        <TableRow>
            <TableCell className="font-medium">
                {isSub && <CornerDownRight className="inline-block ml-4 h-4 w-4 text-muted-foreground" />}
                {category.name}
            </TableCell>
            <TableCell>{new Date(category.created_at).toLocaleDateString('ar-SA')}</TableCell>
            <TableCell>
              <AlertDialog>
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => handleEditClick(category)}>تعديل</DropdownMenuItem>
                      <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>حذف</DropdownMenuItem>
                      </AlertDialogTrigger>
                  </DropdownMenuContent>
                  </DropdownMenu>

                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                          <AlertDialogDescription>
                          سيتم حذف هذه الفئة وجميع المنتجات والفئات الفرعية المرتبطة بها بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-destructive hover:bg-destructive/90">
                              نعم، احذف الفئة
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </TableCell>
        </TableRow>
        {category.children.map(child => renderCategoryRow(child, true))}
    </React.Fragment>
  );

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead>تاريخ الإنشاء</TableHead>
          <TableHead>
            <span className="sr-only">الإجراءات</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categoryTree.map((category) => renderCategoryRow(category, false))}
      </TableBody>
    </Table>
    <Dialog open={isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>تعديل الفئة</DialogTitle>
                <DialogDescription>
                    قم بتحديث اسم الفئة.
                </DialogDescription>
            </DialogHeader>
            {editingCategory && (
                <CategoryForm 
                    catalogId={catalogId} 
                    category={editingCategory} 
                    onSuccess={handleDialogClose} 
                    mainCategories={mainCategories.filter(c => c.id !== editingCategory.id)}
                    enableSubcategories={enableSubcategories}
                />
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}
