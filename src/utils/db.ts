/**
 * Database Access Layer
 *
 * Provides typed functions for querying the Supabase product catalog.
 * Replaces direct imports from JS data files.
 */

import { getSupabaseClient, type Product, type Category, type DosageForm, type ProductIngredient } from './supabase';

// Extended product type with joined data
export interface ProductWithRelations extends Product {
  category?: Category | null;
  dosage_form?: DosageForm | null;
  ingredients?: ProductIngredient[];
}

// Search result type (matches database function return)
export interface SearchResult {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  category_name: string | null;
  dosage_form_name: string | null;
  rank: number;
}

// Autocomplete result type
export interface AutocompleteResult {
  id: number;
  name: string;
  slug: string;
  similarity: number;
}

// ============================================
// CATEGORIES
// ============================================

/**
 * Get all categories ordered by display_order
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return (data || []) as Category[];
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching category:', error);
    throw error;
  }

  return data as Category | null;
}

/**
 * Get a single category by legacy ID (for migration compatibility)
 */
export async function getCategoryByLegacyId(legacyId: string): Promise<Category | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('legacy_id', legacyId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching category:', error);
    throw error;
  }

  return data as Category | null;
}

// ============================================
// DOSAGE FORMS
// ============================================

/**
 * Get all dosage forms
 */
export async function getDosageForms(): Promise<DosageForm[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('dosage_forms')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching dosage forms:', error);
    throw error;
  }

  return (data || []) as DosageForm[];
}

/**
 * Get a single dosage form by slug
 */
export async function getDosageFormBySlug(slug: string): Promise<DosageForm | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('dosage_forms')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching dosage form:', error);
    throw error;
  }

  return data as DosageForm | null;
}

// ============================================
// PRODUCTS
// ============================================

/**
 * Get all active products with optional category/dosage form filter
 */
export async function getProducts(options?: {
  categorySlug?: string;
  dosageFormSlug?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductWithRelations[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      dosage_form:dosage_forms(*)
    `)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  // Filter by category/dosage form after fetch (joined queries need this approach)
  let products = (data || []) as ProductWithRelations[];

  if (options?.categorySlug) {
    products = products.filter((p) => p.category?.slug === options.categorySlug);
  }

  if (options?.dosageFormSlug) {
    products = products.filter((p) => p.dosage_form?.slug === options.dosageFormSlug);
  }

  return products;
}

/**
 * Get all active products grouped by category
 */
export async function getProductsByCategory(): Promise<Map<string, ProductWithRelations[]>> {
  const products = await getProducts();
  const grouped = new Map<string, ProductWithRelations[]>();

  for (const product of products) {
    const categorySlug = product.category?.slug || 'uncategorized';
    if (!grouped.has(categorySlug)) {
      grouped.set(categorySlug, []);
    }
    grouped.get(categorySlug)!.push(product);
  }

  return grouped;
}

/**
 * Get a single product by slug with full details
 */
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = getSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      dosage_form:dosage_forms(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching product:', error);
    throw error;
  }

  if (!product) return null;

  const typedProduct = product as ProductWithRelations;

  // Fetch ingredients separately
  const { data: ingredients } = await supabase
    .from('product_ingredients')
    .select('*')
    .eq('product_id', typedProduct.id)
    .order('display_order', { ascending: true });

  return {
    ...typedProduct,
    ingredients: (ingredients || []) as ProductIngredient[],
  };
}

/**
 * Get a single product by SKU
 */
export async function getProductBySku(sku: string): Promise<ProductWithRelations | null> {
  const supabase = getSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      dosage_form:dosage_forms(*)
    `)
    .eq('sku', sku)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching product:', error);
    throw error;
  }

  if (!product) return null;

  const typedProduct = product as ProductWithRelations;

  // Fetch ingredients separately
  const { data: ingredients } = await supabase
    .from('product_ingredients')
    .select('*')
    .eq('product_id', typedProduct.id)
    .order('display_order', { ascending: true });

  return {
    ...typedProduct,
    ingredients: (ingredients || []) as ProductIngredient[],
  };
}

/**
 * Get a single product by legacy ID (for migration compatibility)
 */
export async function getProductByLegacyId(legacyId: string): Promise<ProductWithRelations | null> {
  const supabase = getSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      dosage_form:dosage_forms(*)
    `)
    .eq('legacy_id', legacyId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching product:', error);
    throw error;
  }

  return product as ProductWithRelations | null;
}

/**
 * Get total count of active products
 */
export async function getProductCount(): Promise<number> {
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching product count:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Get product count by category
 */
export async function getProductCountByCategory(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('category:categories(slug)')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching product counts:', error);
    throw error;
  }

  const counts: Record<string, number> = {};
  for (const row of (data || []) as Array<{ category: { slug: string } | null }>) {
    const slug = row.category?.slug || 'uncategorized';
    counts[slug] = (counts[slug] || 0) + 1;
  }

  return counts;
}

/**
 * Get product count by dosage form
 */
export async function getProductCountByDosageForm(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('dosage_form:dosage_forms(slug)')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching product counts:', error);
    throw error;
  }

  const counts: Record<string, number> = {};
  for (const row of (data || []) as Array<{ dosage_form: { slug: string } | null }>) {
    const slug = row.dosage_form?.slug || 'unknown';
    counts[slug] = (counts[slug] || 0) + 1;
  }

  return counts;
}

// ============================================
// SEARCH
// ============================================

/**
 * Full-text search products using database function
 */
export async function searchProducts(
  query: string,
  options?: {
    categorySlug?: string;
    dosageFormSlug?: string;
    limit?: number;
  }
): Promise<SearchResult[]> {
  const supabase = getSupabaseClient();

  // Use type assertion for RPC call since types aren't auto-generated
  const { data, error } = await (supabase.rpc as Function)('search_products', {
    search_query: query,
    category_filter: options?.categorySlug || null,
    dosage_form_filter: options?.dosageFormSlug || null,
    limit_count: options?.limit || 20,
  });

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  return (data || []) as SearchResult[];
}

/**
 * Autocomplete search for product names
 */
export async function autocompleteProducts(
  term: string,
  limit: number = 10
): Promise<AutocompleteResult[]> {
  const supabase = getSupabaseClient();

  // Use type assertion for RPC call
  const { data, error } = await (supabase.rpc as Function)('autocomplete_products', {
    search_term: term,
    limit_count: limit,
  });

  if (error) {
    console.error('Error autocompleting products:', error);
    throw error;
  }

  return (data || []) as AutocompleteResult[];
}

/**
 * Sanitize search query to prevent injection attacks
 * Escapes special characters used in LIKE patterns and SQL
 */
function sanitizeSearchQuery(query: string): string {
  // Remove or escape characters that could be used for injection
  return query
    .replace(/[%_\\]/g, '\\$&')  // Escape LIKE wildcards and backslash
    .replace(/['";\x00-\x1f]/g, '') // Remove quotes, semicolons, and control chars
    .trim()
    .slice(0, 100); // Limit length to prevent DoS
}

/**
 * Simple text search (fallback if RPC functions not available)
 */
export async function searchProductsSimple(
  query: string,
  options?: {
    categorySlug?: string;
    dosageFormSlug?: string;
    limit?: number;
  }
): Promise<ProductWithRelations[]> {
  const supabase = getSupabaseClient();

  // Sanitize query to prevent SQL injection
  const sanitizedQuery = sanitizeSearchQuery(query);

  // If sanitization results in empty string, return empty results
  if (!sanitizedQuery) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      dosage_form:dosage_forms(*)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%,sku.ilike.%${sanitizedQuery}%`)
    .limit(options?.limit || 20);

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  // Filter by category/dosage form after fetch
  let products = (data || []) as ProductWithRelations[];

  if (options?.categorySlug) {
    products = products.filter((p) => p.category?.slug === options.categorySlug);
  }

  if (options?.dosageFormSlug) {
    products = products.filter((p) => p.dosage_form?.slug === options.dosageFormSlug);
  }

  return products;
}

// ============================================
// PRODUCT INGREDIENTS
// ============================================

/**
 * Get ingredients for a product
 */
export async function getProductIngredients(productId: number): Promise<ProductIngredient[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('product_ingredients')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching product ingredients:', error);
    throw error;
  }

  return (data || []) as ProductIngredient[];
}

/**
 * Get unique ingredient names across all products (for filters)
 */
export async function getUniqueIngredients(): Promise<string[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('product_ingredients')
    .select('ingredient_name')
    .order('ingredient_name', { ascending: true });

  if (error) {
    console.error('Error fetching unique ingredients:', error);
    throw error;
  }

  const rows = (data || []) as Array<{ ingredient_name: string }>;
  const unique = Array.from(new Set(rows.map((row) => row.ingredient_name)));
  return unique;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if database is accessible
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('categories').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// ============================================
// ADAPTER FUNCTIONS (for existing component compatibility)
// ============================================

/**
 * Component-compatible product interface (matches src/data/products.js structure)
 */
export interface ComponentProduct {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  description: string;
  servingSize: string;
  servingsPerContainer: number | string;
  keyIngredients?: string[];
  ingredients?: Array<{
    name: string;
    amount: string;
    unit: string;
    dailyValue?: string;
    source?: string;
  }>;
  otherIngredients?: string;
  allergenInfo?: string;
  dosageForm?: string;
}

/**
 * Component-compatible category interface
 */
export interface ComponentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Transform a database product to the format expected by existing components
 */
export function transformProductForComponent(product: ProductWithRelations): ComponentProduct {
  return {
    id: product.legacy_id || product.slug,
    sku: product.sku,
    name: product.name,
    categoryId: product.category?.legacy_id || product.category?.slug || '',
    description: product.description || '',
    servingSize: product.serving_size || '',
    servingsPerContainer: product.servings_per_container || 0,
    keyIngredients: product.key_ingredients || undefined,
    ingredients: product.ingredients?.map(ing => ({
      name: ing.ingredient_name,
      amount: ing.amount || '',
      unit: ing.unit || '',
      dailyValue: ing.daily_value || undefined,
      source: ing.source_note || undefined,
    })),
    otherIngredients: product.other_ingredients || undefined,
    dosageForm: product.dosage_form?.legacy_id || product.dosage_form?.slug || 'capsules',
  };
}

/**
 * Transform a database category to the format expected by existing components
 */
export function transformCategoryForComponent(category: Category): ComponentCategory {
  return {
    id: category.legacy_id || category.slug,
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
  };
}

/**
 * Get ingredient names from a component-format product (for data attributes)
 */
export function getProductIngredientNamesFromComponent(product: ComponentProduct): string[] {
  if (product.ingredients && product.ingredients.length > 0) {
    return product.ingredients.map(ing => ing.name);
  }
  if (product.keyIngredients && product.keyIngredients.length > 0) {
    return product.keyIngredients;
  }
  return [];
}

// ============================================
// COMBINED DATA FETCHERS (for catalog page)
// ============================================

/**
 * Get all products with ingredients, transformed for components
 */
export async function getProductsForCatalog(): Promise<ComponentProduct[]> {
  const supabase = getSupabaseClient();

  // Fetch all active products with their relations
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      dosage_form:dosage_forms(*)
    `)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  // Fetch all ingredients
  const { data: allIngredients, error: ingError } = await supabase
    .from('product_ingredients')
    .select('*')
    .order('display_order', { ascending: true });

  if (ingError) {
    console.error('Error fetching ingredients:', ingError);
    throw ingError;
  }

  // Group ingredients by product_id
  const ingredientsByProduct = new Map<number, ProductIngredient[]>();
  for (const ing of (allIngredients || []) as ProductIngredient[]) {
    if (!ingredientsByProduct.has(ing.product_id)) {
      ingredientsByProduct.set(ing.product_id, []);
    }
    ingredientsByProduct.get(ing.product_id)!.push(ing);
  }

  // Transform products with their ingredients
  return ((products || []) as ProductWithRelations[]).map(product => {
    const productWithIngredients: ProductWithRelations = {
      ...product,
      ingredients: ingredientsByProduct.get(product.id) || [],
    };
    return transformProductForComponent(productWithIngredients);
  });
}

/**
 * Get all categories, transformed for components
 */
export async function getCategoriesForCatalog(): Promise<ComponentCategory[]> {
  const categories = await getCategories();
  return categories.map(transformCategoryForComponent);
}

/**
 * Get products organized by category for catalog display
 */
export async function getProductsByCategoryForCatalog(): Promise<Array<ComponentCategory & { products: ComponentProduct[] }>> {
  const [categories, products] = await Promise.all([
    getCategoriesForCatalog(),
    getProductsForCatalog(),
  ]);

  // Group products by categoryId
  const productsByCategory = new Map<string, ComponentProduct[]>();
  for (const product of products) {
    const catId = product.categoryId;
    if (!productsByCategory.has(catId)) {
      productsByCategory.set(catId, []);
    }
    productsByCategory.get(catId)!.push(product);
  }

  // Combine categories with their products
  return categories
    .map(category => ({
      ...category,
      products: productsByCategory.get(category.id) || [],
    }))
    .filter(cat => cat.products.length > 0);
}

/**
 * Get dosage form counts for filter display
 */
export async function getDosageFormCountsForCatalog(): Promise<Array<{ id: string; name: string; count: number }>> {
  const counts = await getProductCountByDosageForm();
  const dosageForms = await getDosageForms();

  return dosageForms
    .map(df => ({
      id: df.legacy_id || df.slug,
      name: df.name,
      count: counts[df.slug] || 0,
    }))
    .filter(df => df.count > 0)
    .sort((a, b) => b.count - a.count);
}
