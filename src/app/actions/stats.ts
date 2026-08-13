'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

/**
 * Record a store visit.
 * Uses sessionStorage in client to debounce multiple views per session.
 */
export async function recordStoreVisit(catalogId: number, sessionId: string) {
  try {
    // Use admin client to bypass any RLS and run RPC atomically
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.rpc('increment_store_visit', {
      p_catalog_id: catalogId,
      p_session_id: sessionId
    });

    if (error) {
      console.error('Error recording store visit:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error recording store visit:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Fetch visitor statistics for a catalog (Today, Week, Month, Total)
 */
export async function getStoreVisitorStats(catalogId: number) {
  try {
    const supabase = await createClient();

    // 1. Get total views from catalog cache
    const { data: catalogData, error: catalogError } = await supabase
      .from('catalogs')
      .select('views_count')
      .eq('id', catalogId)
      .single();

    if (catalogError) {
      console.error('Error fetching total views:', catalogError);
    }
    const totalViews = catalogData?.views_count || 0;

    // Calculate dates
    const now = new Date();
    
    // Start of Today (00:00:00 local time)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    // Start of Week (Sunday)
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).toISOString();
    
    // Start of Month (1st day)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 2. Query Today's visits count
    const { count: todayCount, error: todayError } = await supabase
      .from('store_visits')
      .select('*', { count: 'exact', head: true })
      .eq('catalog_id', catalogId)
      .gte('visited_at', todayStart);

    if (todayError) {
      console.error('Error fetching today views:', todayError);
    }

    // 3. Query Week's visits count
    const { count: weekCount, error: weekError } = await supabase
      .from('store_visits')
      .select('*', { count: 'exact', head: true })
      .eq('catalog_id', catalogId)
      .gte('visited_at', weekStart);

    if (weekError) {
      console.error('Error fetching week views:', weekError);
    }

    // 4. Query Month's visits count
    const { count: monthCount, error: monthError } = await supabase
      .from('store_visits')
      .select('*', { count: 'exact', head: true })
      .eq('catalog_id', catalogId)
      .gte('visited_at', monthStart);

    if (monthError) {
      console.error('Error fetching month views:', monthError);
    }

    return {
      today: todayCount || 0,
      week: weekCount || 0,
      month: monthCount || 0,
      total: totalViews || 0
    };
  } catch (err) {
    console.error('Unexpected error fetching store visitor stats:', err);
    return {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    };
  }
}
