export interface MenuItem {
  id: string | number;
  name: string;
  description?: string;
  price: number | string | null;
  image_url?: string | null;
  created_at?: string;
  is_featured?: boolean;
  is_popular?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  menu_items: MenuItem[];
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

export interface Catalog {
  id: string | number;
  name: string;
  description?: string | null;
  cover_url?: string | null;
  status?: string | null;
  is_open?: boolean | null;
}
