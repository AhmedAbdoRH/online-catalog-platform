const fs = require('fs');
const sql = fs.readFileSync('./supabase/migrations/0007_add_discount_price_to_menu_items.sql', 'utf8');
console.log(sql);
