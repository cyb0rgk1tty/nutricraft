/**
 * Product Autocomplete API Endpoint
 *
 * Provides fast prefix/fuzzy matching for search-as-you-type functionality.
 *
 * GET /api/autocomplete?q=vita&limit=8
 *
 * Query Parameters:
 * - q: Search term (required, min 2 characters)
 * - limit: Max suggestions (default: 8, max: 15)
 *
 * Returns:
 * - suggestions: Array of {id, name, slug, similarity}
 * - count: Number of suggestions
 */

import type { APIRoute } from 'astro';
import { autocompleteProducts, type AutocompleteResult } from '../../utils/db';
import { getSupabaseClient } from '../../utils/supabase';

/**
 * Sanitize search term to prevent injection attacks
 */
function sanitizeSearchTerm(term: string): string {
  return term
    .replace(/[%_\\]/g, '\\$&')  // Escape LIKE wildcards
    .replace(/['";\x00-\x1f]/g, '') // Remove dangerous characters
    .trim()
    .slice(0, 100); // Limit length
}

// Helper to get total count of matching products (without limit)
async function getTotalMatchCount(term: string): Promise<number> {
  const supabase = getSupabaseClient();
  const sanitizedTerm = sanitizeSearchTerm(term);

  if (!sanitizedTerm) return 0;

  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .or(`name.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%,sku.ilike.%${sanitizedTerm}%`);

  if (error) {
    console.warn('Count query failed:', error);
    return 0;
  }
  return count || 0;
}

// Helper to find spell correction suggestions using trigram similarity
async function findSpellCorrection(term: string): Promise<string | null> {
  const supabase = getSupabaseClient();

  // Use raw SQL to leverage pg_trgm similarity function
  const { data, error } = await supabase.rpc('find_similar_term', {
    search_term: term,
    min_similarity: 0.3,
  });

  if (error) {
    // Function might not exist, try fallback approach
    console.warn('Spell correction RPC failed:', error);
    return await findSpellCorrectionFallback(term);
  }

  return data?.[0]?.suggestion || null;
}

// Fallback spell correction using simple pattern matching
async function findSpellCorrectionFallback(term: string): Promise<string | null> {
  const supabase = getSupabaseClient();

  // Common misspellings map
  const commonFixes: Record<string, string> = {
    melatonen: 'melatonin',
    melatonon: 'melatonin',
    vitamine: 'vitamin',
    vitamn: 'vitamin',
    magnesim: 'magnesium',
    magnezium: 'magnesium',
    calicum: 'calcium',
    calcuim: 'calcium',
    ashwaganda: 'ashwagandha',
    ashwagandah: 'ashwagandha',
    tumeric: 'turmeric',
    tumric: 'turmeric',
    colegen: 'collagen',
    colagan: 'collagen',
    probiotc: 'probiotic',
    probioitc: 'probiotic',
    gummie: 'gummies',
    gummys: 'gummies',
    capsuls: 'capsules',
    capusle: 'capsules',
    softgel: 'softgels',
    sofgel: 'softgels',
    immunty: 'immunity',
    imunity: 'immunity',
    enrgy: 'energy',
    energey: 'energy',
    slep: 'sleep',
    sleap: 'sleep',
  };

  const lowerTerm = term.toLowerCase();

  // Check common misspellings first
  if (commonFixes[lowerTerm]) {
    return commonFixes[lowerTerm];
  }

  // Try to find a similar product name using ILIKE with wildcards
  const { data } = await supabase
    .from('products')
    .select('name')
    .eq('is_active', true)
    .limit(100);

  if (!data || data.length === 0) return null;

  // Find the closest match using simple string distance
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const product of data) {
    const words = product.name.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length >= 3) {
        const score = calculateSimilarity(lowerTerm, word);
        if (score > bestScore && score >= 0.4 && word !== lowerTerm) {
          bestScore = score;
          bestMatch = word;
        }
      }
    }
  }

  return bestMatch;
}

// Simple string similarity calculation (Dice coefficient)
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;

  const bigrams1 = new Set<string>();
  for (let i = 0; i < str1.length - 1; i++) {
    bigrams1.add(str1.substring(i, i + 2));
  }

  let matches = 0;
  for (let i = 0; i < str2.length - 1; i++) {
    if (bigrams1.has(str2.substring(i, i + 2))) {
      matches++;
    }
  }

  return (2.0 * matches) / (str1.length - 1 + str2.length - 1);
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const term = url.searchParams.get('q')?.trim() || '';
  const limitParam = url.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '8', 10) || 8, 1), 15);

  // Validate term
  if (!term || term.length < 2) {
    return new Response(
      JSON.stringify({
        suggestions: [],
        count: 0,
        term: term,
      }),
      {
        status: 200, // Return empty, not error, for short terms
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );
  }

  try {
    let suggestions: AutocompleteResult[];

    // Try the database autocomplete function
    try {
      suggestions = await autocompleteProducts(term, limit);
    } catch (rpcError) {
      // Fallback to simple ILIKE prefix search
      console.warn('Autocomplete RPC failed, using fallback:', rpcError);
      const supabase = getSupabaseClient();

      // Sanitize the term before using in query
      const sanitizedTerm = sanitizeSearchTerm(term);
      if (!sanitizedTerm) {
        suggestions = [];
      } else {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug')
          .eq('is_active', true)
          .or(`name.ilike.${sanitizedTerm}%,name.ilike.%${sanitizedTerm}%`)
          .order('name', { ascending: true })
          .limit(limit);

        if (error) throw error;

        suggestions = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          similarity: p.name.toLowerCase().startsWith(term.toLowerCase()) ? 1 : 0.5,
        }));
      }
    }

    // Also search for ingredient matches (sanitize term here too)
    const supabase = getSupabaseClient();
    const sanitizedIngredientTerm = sanitizeSearchTerm(term);
    const { data: ingredientMatches } = sanitizedIngredientTerm
      ? await supabase
          .from('product_ingredients')
          .select('ingredient_name')
          .ilike('ingredient_name', `${sanitizedIngredientTerm}%`)
          .limit(5)
      : { data: null };

    const ingredientSuggestions = ingredientMatches
      ? [...new Set(ingredientMatches.map((i) => i.ingredient_name))].slice(0, 3)
      : [];

    // Get total count of matching products (for "Showing X of Y" UI)
    const totalCount = await getTotalMatchCount(term);

    // If no results, try to find spell correction
    let didYouMean: string | null = null;
    if (suggestions.length === 0 && ingredientSuggestions.length === 0) {
      didYouMean = await findSpellCorrection(term);
    }

    return new Response(
      JSON.stringify({
        suggestions: suggestions.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          type: 'product',
        })),
        ingredients: ingredientSuggestions.map((name) => ({
          name,
          type: 'ingredient',
        })),
        count: suggestions.length,
        totalCount,
        didYouMean,
        term,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    console.error('Autocomplete error:', error);
    return new Response(
      JSON.stringify({
        suggestions: [],
        ingredients: [],
        count: 0,
        term,
        error: 'Autocomplete failed',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
};
