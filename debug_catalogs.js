const { createClient } = require("@supabase/supabase-js");
require('dotenv').config({ path: '.env' });

async function debug() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { data: catalogs } = await supabaseAdmin
    .from('catalogs')
    .select('id, name, display_name, user_id, views_count')
    .order('id', { ascending: false })
    .limit(10);

  console.log("Catalogs:", catalogs);

  const { data: visits } = await supabaseAdmin
    .from('store_visits')
    .select('id, catalog_id, visited_at, session_id')
    .order('id', { ascending: false })
    .limit(10);

  console.log("Latest Visits:", visits);
}

debug();
