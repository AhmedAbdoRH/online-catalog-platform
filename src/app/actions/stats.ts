'use server';

import { createClient } from '@/lib/supabase/server';

export async function getStoreCount() {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('catalogs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching store count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Unexpected error fetching store count:', err);
    return 0;
  }
}
