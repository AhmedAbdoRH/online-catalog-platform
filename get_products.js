const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ikelmblsikapgbxbpebz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWxtYmxzaWthcGdieGJwZWJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzNDg4MiwiZXhwIjoyMDc4OTEwODgyfQ.0zTJzPRsBvYzwNQeP6ZgpwVkzvG11yz1tD6upX35zSQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getProducts() {
  try {
    const { data: items, error } = await supabase
      .from('items')
      .select('id, name, description, catalog_id, catalogs(display_name)')
      .order('id', { ascending: true });

    if (error) {
      console.error('خطأ في الاستعلام:', error);
      return;
    }

    console.log(`\n✅ عدد المنتجات الكلي: ${items.length}`);
    console.log('\n═══════════════════════════════════════════════════════════');
    
    // تجميع المنتجات حسب المتجر
    const productsByStore = {};
    
    items.forEach((item, index) => {
      const storeName = item.catalogs?.display_name || 'متجر غير معروف';
      if (!productsByStore[storeName]) {
        productsByStore[storeName] = [];
      }
      productsByStore[storeName].push(item);
    });

    // عرض المنتجات حسب المتجر
    for (const [storeName, storeItems] of Object.entries(productsByStore)) {
      console.log(`\n📦 متجر: ${storeName} (${storeItems.length} منتج)`);
      console.log('───────────────────────────────────────────────────────');
      storeItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        if (item.description) {
          console.log(`   📝 الوصف: ${item.description.substring(0, 80)}${item.description.length > 80 ? '...' : ''}`);
        }
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

getProducts();
