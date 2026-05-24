const { createClient } = require("@supabase/supabase-js");

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('schema_migrations')
    .select('*');

  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Applied migrations:', data);
  }
}

test();
