/**
 * ECO Catalog Import Script
 *
 * Imports extracted product data from the ECO (Ausreson) catalog
 * into the Supabase database.
 *
 * Usage:
 * npx tsx scripts/import-eco-catalog.ts
 * npx tsx scripts/import-eco-catalog.ts --dry-run
 * npx tsx scripts/import-eco-catalog.ts --batch=1
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
config();

// ============================================
// CONFIGURATION
// ============================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const batchArg = args.find(a => a.startsWith('--batch='));
const specificBatch = batchArg ? parseInt(batchArg.split('=')[1]) : null;

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ExtractedIngredient {
  name: string;
  amount: string;
  unit: string;
  daily_value?: string;
  source_note?: string;
}

interface ExtractedProduct {
  sku: string;
  name: string;
  dosage_form: string;
  count: number;
  count_unit?: string;
  serving_size: string;
  servings_per_container: number;
  category: string;
  ingredients: ExtractedIngredient[];
  other_ingredients?: string;
  allergen_info?: string;
  notes?: string;
}

interface BatchData {
  batch: number;
  pages: string;
  extracted_at: string;
  products: ExtractedProduct[];
  skipped_products: any[];
  notes?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${icons[type]} ${message}`);
}

// ============================================
// DATABASE LOOKUPS
// ============================================

// Cache for category and dosage form IDs
const categoryCache = new Map<string, number>();
const dosageFormCache = new Map<string, number>();

async function getCategoryId(slug: string): Promise<number | null> {
  if (categoryCache.has(slug)) {
    return categoryCache.get(slug)!;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    log(`Category not found: ${slug}`, 'warn');
    return null;
  }

  categoryCache.set(slug, data.id);
  return data.id;
}

async function getDosageFormId(slug: string): Promise<number | null> {
  if (dosageFormCache.has(slug)) {
    return dosageFormCache.get(slug)!;
  }

  const { data, error } = await supabase
    .from('dosage_forms')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    log(`Dosage form not found: ${slug}`, 'warn');
    return null;
  }

  dosageFormCache.set(slug, data.id);
  return data.id;
}

// ============================================
// IMPORT FUNCTIONS
// ============================================

async function importProduct(product: ExtractedProduct): Promise<number | null> {
  const categoryId = await getCategoryId(product.category);
  const dosageFormId = await getDosageFormId(product.dosage_form);

  // Generate slug from product name
  const slug = slugify(product.name);
  const legacyId = slug;

  // Build key ingredients list
  const keyIngredients = product.ingredients
    .filter(ing => !['Calories', 'Total Carbohydrate', 'Total Carbohydrates', 'Dietary Fiber', 'Total Sugars', 'Protein', 'Sugar'].includes(ing.name))
    .slice(0, 5)
    .map(ing => ing.name);

  const productData = {
    legacy_id: legacyId,
    sku: product.sku,
    name: product.name,
    slug: slug,
    category_id: categoryId,
    dosage_form_id: dosageFormId,
    description: `${product.name} - ${product.count} ${product.dosage_form}`,
    serving_size: product.serving_size,
    servings_per_container: product.servings_per_container,
    key_ingredients: keyIngredients,
    other_ingredients: product.other_ingredients || null,
    is_active: true,
  };

  if (isDryRun) {
    console.log(`  Would insert product: ${product.sku} - ${product.name}`);
    return -1; // Dummy ID for dry run
  }

  // Check if product already exists
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('sku', product.sku)
    .single();

  if (existing) {
    log(`Product ${product.sku} already exists, updating...`, 'warn');
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('sku', product.sku);

    if (error) {
      log(`Failed to update product ${product.sku}: ${error.message}`, 'error');
      return null;
    }
    return existing.id;
  }

  // Insert new product
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select('id')
    .single();

  if (error) {
    log(`Failed to insert product ${product.sku}: ${error.message}`, 'error');
    return null;
  }

  return data.id;
}

async function importIngredients(productId: number, ingredients: ExtractedIngredient[]): Promise<void> {
  if (isDryRun) {
    console.log(`    Would insert ${ingredients.length} ingredients`);
    return;
  }

  // Delete existing ingredients for this product
  await supabase
    .from('product_ingredients')
    .delete()
    .eq('product_id', productId);

  // Prepare ingredient data
  const ingredientData = ingredients.map((ing, index) => ({
    product_id: productId,
    ingredient_name: ing.name,
    amount: ing.amount || null,
    unit: ing.unit || null,
    daily_value: ing.daily_value || null,
    source_note: ing.source_note || null,
    display_order: index + 1,
  }));

  // Batch insert ingredients
  const batchSize = 50;
  for (let i = 0; i < ingredientData.length; i += batchSize) {
    const batch = ingredientData.slice(i, i + batchSize);
    const { error } = await supabase
      .from('product_ingredients')
      .insert(batch);

    if (error) {
      log(`Failed to insert ingredients batch: ${error.message}`, 'error');
    }
  }
}

async function processBatch(batchNumber: number): Promise<{ imported: number; failed: number }> {
  const filePath = join(process.cwd(), `uploads/catalogs/eco_products_batch${batchNumber}.json`);

  if (!existsSync(filePath)) {
    log(`Batch file not found: ${filePath}`, 'error');
    return { imported: 0, failed: 0 };
  }

  const fileContent = readFileSync(filePath, 'utf-8');
  const batchData: BatchData = JSON.parse(fileContent);

  log(`Processing batch ${batchNumber}: ${batchData.products.length} products from pages ${batchData.pages}`, 'info');

  let imported = 0;
  let failed = 0;

  for (const product of batchData.products) {
    try {
      const productId = await importProduct(product);

      if (productId && productId !== -1) {
        await importIngredients(productId, product.ingredients);
        imported++;
        log(`  Imported: ${product.sku} - ${product.name}`, 'success');
      } else if (productId === -1) {
        // Dry run
        imported++;
      } else {
        failed++;
      }
    } catch (err) {
      log(`  Error processing ${product.sku}: ${err}`, 'error');
      failed++;
    }
  }

  return { imported, failed };
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n🏷️  ECO Catalog Import Script');
  console.log('================================\n');

  if (isDryRun) {
    log('DRY RUN MODE - No changes will be made\n', 'warn');
  }

  // Pre-load category and dosage form caches
  const { data: categories } = await supabase.from('categories').select('id, slug');
  categories?.forEach(c => categoryCache.set(c.slug, c.id));

  const { data: dosageForms } = await supabase.from('dosage_forms').select('id, slug');
  dosageForms?.forEach(d => dosageFormCache.set(d.slug, d.id));

  log(`Loaded ${categoryCache.size} categories and ${dosageFormCache.size} dosage forms\n`, 'info');

  let totalImported = 0;
  let totalFailed = 0;

  if (specificBatch) {
    // Process specific batch
    const result = await processBatch(specificBatch);
    totalImported = result.imported;
    totalFailed = result.failed;
  } else {
    // Process all available batches (1-4)
    for (let i = 1; i <= 4; i++) {
      const filePath = join(process.cwd(), `uploads/catalogs/eco_products_batch${i}.json`);
      if (existsSync(filePath)) {
        const result = await processBatch(i);
        totalImported += result.imported;
        totalFailed += result.failed;
      }
    }
  }

  console.log('\n================================');
  log(`Import complete: ${totalImported} imported, ${totalFailed} failed`, totalFailed > 0 ? 'warn' : 'success');
}

main().catch(console.error);
