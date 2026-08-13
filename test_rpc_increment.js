const { createClient } = require("@supabase/supabase-js");
require('dotenv').config({ path: '.env' });

async function testRpc() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Get current views_count of catalog 181 (hamood)
  const { data: catBefore } = await supabaseAdmin
    .from('catalogs')
    .select('id, name, views_count')
    .eq('id', 181)
    .single();

  console.log("Before RPC - Catalog 181 views_count:", catBefore.views_count);

  // Run RPC
  const { error: rpcErr } = await supabaseAdmin.rpc('increment_store_visit', {
    p_catalog_id: 181,
    p_session_id: 'test_hamood_session_' + Date.now()
  });

  console.log("RPC Error:", rpcErr);

  // Get views_count after RPC
  const { data: catAfter } = await supabaseAdmin
    .from('catalogs')
    .select('id, name, views_count')
    .eq('id', 181)
    .single();

  console.log("After RPC - Catalog 181 views_count:", catAfter.views_count);
}

testRpc();
