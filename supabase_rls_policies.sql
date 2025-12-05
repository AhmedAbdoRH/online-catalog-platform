-- =====================================================
-- SQL Policies للسماح بقراءة الكتالوجات للعامة
-- قم بتشغيل هذه الأوامر في Supabase SQL Editor
-- =====================================================

-- 1. تفعيل RLS على الجداول (إذا لم يكن مفعلاً)
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- 2. إنشاء سياسات القراءة للعامة (Public Read)
-- هذه السياسات تسمح لأي شخص بقراءة البيانات

-- سياسة قراءة الكتالوجات للعامة
DROP POLICY IF EXISTS "Allow public read access on catalogs" ON catalogs;
CREATE POLICY "Allow public read access on catalogs" 
ON catalogs FOR SELECT 
TO public 
USING (true);

-- سياسة قراءة الفئات للعامة
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
CREATE POLICY "Allow public read access on categories" 
ON categories FOR SELECT 
TO public 
USING (true);

-- سياسة قراءة المنتجات للعامة
DROP POLICY IF EXISTS "Allow public read access on menu_items" ON menu_items;
CREATE POLICY "Allow public read access on menu_items" 
ON menu_items FOR SELECT 
TO public 
USING (true);

-- 3. سياسات الكتابة للمستخدمين المصادق عليهم (للـ Dashboard)

-- سياسة إضافة كتالوج (المستخدم يضيف كتالوج خاص به فقط)
DROP POLICY IF EXISTS "Users can insert their own catalogs" ON catalogs;
CREATE POLICY "Users can insert their own catalogs" 
ON catalogs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- سياسة تعديل الكتالوج (المستخدم يعدل كتالوجه فقط)
DROP POLICY IF EXISTS "Users can update their own catalogs" ON catalogs;
CREATE POLICY "Users can update their own catalogs" 
ON catalogs FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- سياسة حذف الكتالوج (المستخدم يحذف كتالوجه فقط)
DROP POLICY IF EXISTS "Users can delete their own catalogs" ON catalogs;
CREATE POLICY "Users can delete their own catalogs" 
ON catalogs FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- سياسات الفئات (المستخدم يدير فئات كتالوجه فقط)
DROP POLICY IF EXISTS "Users can manage their catalog categories" ON categories;
CREATE POLICY "Users can manage their catalog categories" 
ON categories FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM catalogs 
    WHERE catalogs.id = categories.catalog_id 
    AND catalogs.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM catalogs 
    WHERE catalogs.id = categories.catalog_id 
    AND catalogs.user_id = auth.uid()
  )
);

-- سياسات المنتجات (المستخدم يدير منتجات كتالوجه فقط)
DROP POLICY IF EXISTS "Users can manage their catalog items" ON menu_items;
CREATE POLICY "Users can manage their catalog items" 
ON menu_items FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM catalogs 
    WHERE catalogs.id = menu_items.catalog_id 
    AND catalogs.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM catalogs 
    WHERE catalogs.id = menu_items.catalog_id 
    AND catalogs.user_id = auth.uid()
  )
);

-- =====================================================
-- تأكد من تشغيل كل الأوامر أعلاه في Supabase SQL Editor
-- بعد ذلك، صفحات الكتالوج ستعمل بشكل صحيح
-- =====================================================
