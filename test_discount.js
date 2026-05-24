const { createClient } = require("@supabase/supabase-js");

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Try to insert with discount_price
  const { data, error } = await supabase
    .from('menu_items')
    .insert([{
      name: 'Test Item',
      price: 10,
      discount_price: 8,
      category_id: 1,
      catalog_id: 1
    }])
    .select();

  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Success! Data:', data);
    
    // Clean up
    if (data && data[0]) {
      await supabase
        .from('menu_items')
        .delete()
        .eq('id', data[0].id);
    }
  }
}

test();
