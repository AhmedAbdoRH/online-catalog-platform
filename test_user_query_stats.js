const { createClient } = require("@supabase/supabase-js");
require('dotenv').config({ path: '.env' });

async function testUserQuery() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Anon client (like visitor)
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  // Service client (admin)
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  console.log("--- 1. Testing Anon Insert ---");
  const { data: rpcAnonRes, error: rpcAnonErr } = await supabaseAnon.rpc('increment_store_visit', {
    p_catalog_id: 181,
    p_session_id: 'anon_test_' + Date.now()
  });
  console.log("RPC Anon Err:", rpcAnonErr);

  console.log("\n--- 2. Testing Anon Select store_visits ---");
  const { data: anonVisits, error: anonSelectErr } = await supabaseAnon
    .from('store_visits')
    .select('*')
    .eq('catalog_id', 181);
  console.log("Anon Select visits count:", anonVisits?.length, "Err:", anonSelectErr);

  console.log("\n--- 3. Testing Admin Select store_visits ---");
  const { data: adminVisits, error: adminSelectErr } = await supabaseAdmin
    .from('store_visits')
    .select('*')
    .eq('catalog_id', 181);
  console.log("Admin Select visits count:", adminVisits?.length, "Err:", adminSelectErr);
}

testUserQuery();
