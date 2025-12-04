/**
 * Migration Script: JS Data → Supabase
 *
 * Transforms product catalog data from JavaScript files to Supabase database.
 *
 * Prerequisites:
 * 1. Run the SQL schema in supabase/migrations/001_initial_schema.sql
 * 2. Set environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY
 *
 * Usage:
 * npx tsx scripts/migrate-to-supabase.ts
 *
 * Options:
 * --dry-run     Preview SQL without executing
 * --categories  Migrate only categories
 * --dosage-forms Migrate only dosage forms
 * --products    Migrate only products
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
import { config } from 'dotenv';
config();

// Import source data
import { products, productCategories } from '../src/data/products.js';
import { formulations } from '../src/data/formulations.js';

// ============================================
// CONFIGURATION
// ============================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_KEY');
  console.error('\nPlease add these to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const migrateOnlyCategories = args.includes('--categories');
const migrateOnlyDosageForms = args.includes('--dosage-forms');
const migrateOnlyProducts = args.includes('--products');
const migrateAll = !migrateOnlyCategories && !migrateOnlyDosageForms && !migrateOnlyProducts;

// ============================================
// HELPER FUNCTIONS
// ============================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${icons[type]} ${message}`);
}

// ============================================
// MIGRATE CATEGORIES
// ============================================

async function migrateCategories() {
  log('Migrating categories...', 'info');

  const categoryData = productCategories.map((cat, index) => ({
    legacy_id: cat.id,
    name: cat.name,
    slug: cat.slug || slugify(cat.name),
    description: cat.description || null,
    display_order: index,
  }));

  if (isDryRun) {
    log(`Would insert ${categoryData.length} categories:`, 'info');
    categoryData.forEach((c) => console.log(`  - ${c.name} (${c.legacy_id})`));
    return new Map();
  }

  // Clear existing data
  const { error: deleteError } = await supabase.from('categories').delete().neq('id', 0);
  if (deleteError) {
    log(`Failed to clear categories: ${deleteError.message}`, 'error');
  }

  // Insert new data
  const { data, error } = await supabase.from('categories').insert(categoryData).select();

  if (error) {
    log(`Failed to insert categories: ${error.message}`, 'error');
    throw error;
  }

  log(`Inserted ${data.length} categories`, 'success');

  // Return map of legacy_id -> id for product migration
  const categoryMap = new Map<string, number>();
  data.forEach((cat) => categoryMap.set(cat.legacy_id, cat.id));
  return categoryMap;
}

// ============================================
// MIGRATE DOSAGE FORMS
// ============================================

async function migrateDosageForms() {
  log('Migrating dosage forms...', 'info');

  const dosageFormData = formulations.map((form) => ({
    legacy_id: form.id,
    name: form.name,
    slug: form.slug || slugify(form.name),
    tagline: form.tagline || null,
    short_description: form.shortDescription || null,
    meta_description: form.metaDescription || null,
    image: form.image || null,
    image_alt: form.imageAlt || null,
    best_for: form.bestFor || null,
    benefits: form.benefits || null,
    considerations: form.considerations || null,
    specs: {
      manufacturingDetails: form.manufacturingDetails || null,
      technicalSpecs: form.technicalSpecs || null,
      targetDemographics: form.targetDemographics || null,
      responsiveImages: form.responsiveImages || null,
      articleImage: form.articleImage || null,
    },
  }));

  if (isDryRun) {
    log(`Would insert ${dosageFormData.length} dosage forms:`, 'info');
    dosageFormData.forEach((df) => console.log(`  - ${df.name} (${df.legacy_id})`));
    return new Map();
  }

  // Clear existing data
  const { error: deleteError } = await supabase.from('dosage_forms').delete().neq('id', 0);
  if (deleteError) {
    log(`Failed to clear dosage forms: ${deleteError.message}`, 'error');
  }

  // Insert new data
  const { data, error } = await supabase.from('dosage_forms').insert(dosageFormData).select();

  if (error) {
    log(`Failed to insert dosage forms: ${error.message}`, 'error');
    throw error;
  }

  log(`Inserted ${data.length} dosage forms`, 'success');

  // Return map of legacy_id -> id for product migration
  const dosageFormMap = new Map<string, number>();
  data.forEach((df) => dosageFormMap.set(df.legacy_id, df.id));
  return dosageFormMap;
}

// ============================================
// MIGRATE PRODUCTS
// ============================================

async function migrateProducts(
  categoryMap: Map<string, number>,
  dosageFormMap: Map<string, number>
) {
  log('Migrating products...', 'info');

  // If maps are empty (from dry run or separate migration), fetch from DB
  if (categoryMap.size === 0) {
    const { data } = await supabase.from('categories').select('id, legacy_id');
    data?.forEach((c) => categoryMap.set(c.legacy_id, c.id));
  }
  if (dosageFormMap.size === 0) {
    const { data } = await supabase.from('dosage_forms').select('id, legacy_id');
    data?.forEach((df) => dosageFormMap.set(df.legacy_id, df.id));
  }

  const productData = products.map((product) => ({
    legacy_id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.id, // Use legacy_id as slug for URL compatibility
    category_id: categoryMap.get(product.categoryId) || null,
    dosage_form_id: dosageFormMap.get(product.dosageForm) || null,
    description: product.description || null,
    serving_size: product.servingSize || null,
    servings_per_container: product.servingsPerContainer || null,
    key_ingredients: product.keyIngredients || null,
    other_ingredients: product.otherIngredients || null,
    is_active: true,
  }));

  if (isDryRun) {
    log(`Would insert ${productData.length} products:`, 'info');
    productData.slice(0, 10).forEach((p) => console.log(`  - ${p.name} (${p.sku})`));
    if (productData.length > 10) {
      console.log(`  ... and ${productData.length - 10} more`);
    }
    return new Map();
  }

  // Clear existing data (ingredients first due to FK constraint)
  await supabase.from('product_ingredients').delete().neq('id', 0);
  await supabase.from('products').delete().neq('id', 0);

  // Insert products in batches (Supabase has limits)
  const batchSize = 50;
  const productMap = new Map<string, number>();

  for (let i = 0; i < productData.length; i += batchSize) {
    const batch = productData.slice(i, i + batchSize);
    const { data, error } = await supabase.from('products').insert(batch).select();

    if (error) {
      log(`Failed to insert products batch ${i / batchSize + 1}: ${error.message}`, 'error');
      throw error;
    }

    data.forEach((p) => productMap.set(p.legacy_id, p.id));
    log(`Inserted products ${i + 1}-${Math.min(i + batchSize, productData.length)}`, 'info');
  }

  log(`Inserted ${productData.length} products`, 'success');
  return productMap;
}

// ============================================
// MIGRATE PRODUCT INGREDIENTS
// ============================================

async function migrateProductIngredients(productMap: Map<string, number>) {
  log('Migrating product ingredients...', 'info');

  // If map is empty, fetch from DB
  if (productMap.size === 0) {
    const { data } = await supabase.from('products').select('id, legacy_id');
    data?.forEach((p) => productMap.set(p.legacy_id, p.id));
  }

  const ingredientData: Array<{
    product_id: number;
    ingredient_name: string;
    amount: string | null;
    unit: string | null;
    daily_value: string | null;
    source_note: string | null;
    display_order: number;
  }> = [];

  for (const product of products) {
    const productId = productMap.get(product.id);
    if (!productId) {
      log(`Product not found: ${product.id}`, 'warn');
      continue;
    }

    if (product.ingredients) {
      product.ingredients.forEach((ing, index) => {
        ingredientData.push({
          product_id: productId,
          ingredient_name: ing.name,
          amount: ing.amount || null,
          unit: ing.unit || null,
          daily_value: ing.dailyValue || null,
          source_note: ing.source || null,
          display_order: index,
        });
      });
    }
  }

  if (isDryRun) {
    log(`Would insert ${ingredientData.length} product ingredients`, 'info');
    return;
  }

  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < ingredientData.length; i += batchSize) {
    const batch = ingredientData.slice(i, i + batchSize);
    const { error } = await supabase.from('product_ingredients').insert(batch);

    if (error) {
      log(`Failed to insert ingredients batch ${i / batchSize + 1}: ${error.message}`, 'error');
      throw error;
    }
  }

  log(`Inserted ${ingredientData.length} product ingredients`, 'success');
}

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================

async function runMigration() {
  console.log('\n🚀 Nutricraft Labs - Data Migration to Supabase\n');

  if (isDryRun) {
    log('DRY RUN MODE - No data will be modified\n', 'warn');
  }

  try {
    // Test connection
    const { error: testError } = await supabase.from('categories').select('id').limit(1);
    if (testError && testError.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    log('Database connection successful', 'success');

    let categoryMap = new Map<string, number>();
    let dosageFormMap = new Map<string, number>();
    let productMap = new Map<string, number>();

    // Run migrations
    if (migrateAll || migrateOnlyCategories) {
      categoryMap = await migrateCategories();
    }

    if (migrateAll || migrateOnlyDosageForms) {
      dosageFormMap = await migrateDosageForms();
    }

    if (migrateAll || migrateOnlyProducts) {
      productMap = await migrateProducts(categoryMap, dosageFormMap);
      await migrateProductIngredients(productMap);
    }

    console.log('\n' + '='.repeat(50));
    log('Migration completed successfully!', 'success');

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Categories:    ${productCategories.length}`);
    console.log(`  Dosage Forms:  ${formulations.length}`);
    console.log(`  Products:      ${products.length}`);
    console.log(`  Ingredients:   ${products.reduce((sum, p) => sum + (p.ingredients?.length || 0), 0)}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
