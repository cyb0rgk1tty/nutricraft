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

      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug')
        .eq('is_active', true)
        .or(`name.ilike.${term}%,name.ilike.%${term}%`)
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

    // Also search for ingredient matches
    const supabase = getSupabaseClient();
    const { data: ingredientMatches } = await supabase
      .from('product_ingredients')
      .select('ingredient_name')
      .ilike('ingredient_name', `${term}%`)
      .limit(5);

    const ingredientSuggestions = ingredientMatches
      ? [...new Set(ingredientMatches.map((i) => i.ingredient_name))].slice(0, 3)
      : [];

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
