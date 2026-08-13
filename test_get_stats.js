const { createClient } = require("@supabase/supabase-js");
require('dotenv').config({ path: '.env' });

async function testStats() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const catalogId = 88;

  // 1. Get total views from catalog cache
  const { data: catalogData, error: catalogError } = await supabaseAdmin
    .from('catalogs')
    .select('views_count')
    .eq('id', catalogId)
    .single();

  console.log("Catalog 88 data:", catalogData, "Err:", catalogError);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  console.log("Dates -> Today:", todayStart, "Week:", weekStart, "Month:", monthStart);

  const { count: todayCount, error: todayError } = await supabaseAdmin
    .from('store_visits')
    .select('*', { count: 'exact', head: true })
    .eq('catalog_id', catalogId)
    .gte('visited_at', todayStart);

  console.log("Today count:", todayCount, "Err:", todayError);

  const { count: weekCount, error: weekError } = await supabaseAdmin
    .from('store_visits')
    .select('*', { count: 'exact', head: true })
    .eq('catalog_id', catalogId)
    .gte('visited_at', weekStart);

  console.log("Week count:", weekCount, "Err:", weekError);

  const { count: monthCount, error: monthError } = await supabaseAdmin
    .from('store_visits')
    .select('*', { count: 'exact', head: true })
    .eq('catalog_id', catalogId)
    .gte('visited_at', monthStart);

  console.log("Month count:", monthCount, "Err:", monthError);
}

testStats();
