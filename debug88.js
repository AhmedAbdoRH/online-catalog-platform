const { createClient } = require("@supabase/supabase-js");
require('dotenv').config({ path: '.env' });

async function debug88() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { data: cat88 } = await supabaseAdmin
    .from('catalogs')
    .select('id, name, display_name, views_count')
    .eq('id', 88)
    .single();

  console.log("Cat 88:", cat88);

  const { data: cat66 } = await supabaseAdmin
    .from('catalogs')
    .select('id, name, display_name, views_count')
    .eq('id', 66)
    .single();

  console.log("Cat 66:", cat66);
}

debug88();
