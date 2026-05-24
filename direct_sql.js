const { Pool } = require('pg');

// Supabase connection details (can be found in Supabase dashboard)
// Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
// Host format: db.[PROJECT_ID].supabase.co

const config = {
  user: 'postgres',
  host: 'db.ikelmblsikapgbxbpebz.supabase.co',
  database: 'postgres',
  // You would need the postgres password for direct connection
  // This is typically only available in Supabase dashboard
  port: 5432,
};

console.log('To apply this migration, you need to:');
console.log('1. Go to https://supabase.com/dashboard/project/ikelmblsikapgbxbpebz');
console.log('2. Go to SQL Editor');
console.log('3. Create a new query and paste this SQL:');
console.log('');
console.log(require('fs').readFileSync('./supabase/migrations/0007_add_discount_price_to_menu_items.sql', 'utf8'));
console.log('');
console.log('4. Click Run');
