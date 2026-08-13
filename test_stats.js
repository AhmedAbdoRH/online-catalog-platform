const { createClient } = require("@supabase/supabase-js");
require('dotenv').config({ path: '.env' });

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  console.log("--- Testing Catalogs views_count ---");
  const { data: catalog, error: catErr } = await supabaseAdmin
    .from('catalogs')
    .select('id, views_count')
    .limit(1)
    .single();

  console.log("Catalog:", catalog, "CatErr:", catErr);

  if (catalog) {
    console.log("\n--- Testing RPC increment_store_visit ---");
    const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc('increment_store_visit', {
      p_catalog_id: catalog.id,
      p_session_id: 'test_session_123'
    });
    console.log("RPC Res:", rpcRes, "RPC Err:", rpcErr);

    console.log("\n--- Testing store_visits Table ---");
    const { data: visits, error: visitErr } = await supabaseAdmin
      .from('store_visits')
      .select('*')
      .limit(5);
    console.log("Visits:", visits, "VisitErr:", visitErr);
  }
}

test();
