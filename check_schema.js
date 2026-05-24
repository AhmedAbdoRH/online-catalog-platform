const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('table_schema', {
    table_name: 'menu_items'
  });
  
  if (error) {
    console.log('Error fetching schema:', error);
    
    // Try direct query
    const { data: columns, error: colError } = await supabase
      .from('menu_items')
      .select()
      .limit(1);
    
    console.log('Direct query error:', colError);
  } else {
    console.log('Schema:', data);
  }
}

checkSchema();
