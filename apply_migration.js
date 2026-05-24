const { createClient } = require("@supabase/supabase-js");

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Read the migration file
  const fs = require('fs');
  const migration = fs.readFileSync('./supabase/migrations/0007_add_discount_price_to_menu_items.sql', 'utf8');

  const { data, error } = await supabase.rpc('exec', { sql: migration });

  if (error) {
    console.log('RPC Error:', error);
  } else {
    console.log('Migration applied!', data);
  }
}

test();
