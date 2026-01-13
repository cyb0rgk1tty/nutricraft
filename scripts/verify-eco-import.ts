/**
 * Verify ECO catalog import
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('ECO Catalog Import Verification\n');
  console.log('================================\n');

  // Count total ECO products
  const { count: totalCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .like('sku', 'ECO-%');

  console.log(`Total ECO products: ${totalCount}\n`);

  // Count by dosage form
  const { data: products } = await supabase
    .from('products')
    .select('sku, name, category_id, dosage_form_id')
    .like('sku', 'ECO-%')
    .order('sku');

  // Get categories and dosage forms for lookup
  const { data: categories } = await supabase.from('categories').select('id, name');
  const { data: dosageForms } = await supabase.from('dosage_forms').select('id, name');

  const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);
  const dosageFormMap = new Map(dosageForms?.map(d => [d.id, d.name]) || []);

  // Count by format
  const formatCounts: Record<string, number> = {};
  products?.forEach(p => {
    const format = p.sku.charAt(4);
    formatCounts[format] = (formatCounts[format] || 0) + 1;
  });

  console.log('Products by format code:');
  Object.entries(formatCounts).forEach(([format, count]) => {
    console.log(`  ${format}: ${count}`);
  });

  // Count ingredients
  const { count: ingredientCount } = await supabase
    .from('product_ingredients')
    .select('*', { count: 'exact', head: true })
    .in('product_id', products?.map(p => p.sku) || []);

  // Get sample products
  console.log('\nSample products (first 10):');
  products?.slice(0, 10).forEach(p => {
    const category = categoryMap.get(p.category_id) || 'Unknown';
    const dosageForm = dosageFormMap.get(p.dosage_form_id) || 'Unknown';
    console.log(`  ${p.sku}: ${p.name} (${dosageForm}, ${category})`);
  });

  console.log('\nLast 5 products:');
  products?.slice(-5).forEach(p => {
    const category = categoryMap.get(p.category_id) || 'Unknown';
    const dosageForm = dosageFormMap.get(p.dosage_form_id) || 'Unknown';
    console.log(`  ${p.sku}: ${p.name} (${dosageForm}, ${category})`);
  });

  // Check a sample product's ingredients
  console.log('\nSample ingredient check (ECO-C001):');
  const { data: sampleIngredients } = await supabase
    .from('product_ingredients')
    .select('*')
    .eq('product_id', products?.find(p => p.sku === 'ECO-C001')?.sku || 0)
    .order('display_order');

  // Need to get product_id first
  const { data: sampleProduct } = await supabase
    .from('products')
    .select('id')
    .eq('sku', 'ECO-C001')
    .single();

  if (sampleProduct) {
    const { data: ingredients } = await supabase
      .from('product_ingredients')
      .select('*')
      .eq('product_id', sampleProduct.id)
      .order('display_order');

    ingredients?.forEach(ing => {
      console.log(`  - ${ing.ingredient_name}: ${ing.amount || ''} ${ing.unit || ''} ${ing.daily_value || ''}`);
    });
  }

  console.log('\n================================');
  console.log('Verification complete!');
}

main().catch(console.error);
