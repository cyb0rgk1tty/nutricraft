/**
 * Product Search API Endpoint
 *
 * Provides full-text search with fuzzy matching, category/dosage form filters.
 *
 * GET /api/search?q=melatonin&category=sleep-relaxation&dosageForm=capsules&limit=20
 *
 * Query Parameters:
 * - q: Search query (required, min 2 characters)
 * - category: Filter by category slug (optional)
 * - dosageForm: Filter by dosage form slug (optional)
 * - limit: Max results (default: 20, max: 50)
 *
 * Returns:
 * - results: Array of matching products with rank
 * - count: Total number of results
 * - query: Original search query
 */

import type { APIRoute } from 'astro';
import { searchProducts, searchProductsSimple, type SearchResult } from '../../utils/db';
import { getSupabaseClient } from '../../utils/supabase';

// Log search to analytics table (non-blocking, fire-and-forget)
function logSearchAnalytics(
  searchTerm: string,
  resultCount: number,
  filters: { category?: string; dosageForm?: string }
): void {
  const supabase = getSupabaseClient();

  // Fire and forget - don't await, don't block the response
  supabase
    .from('search_analytics')
    .insert({
      search_term: searchTerm.toLowerCase(),
      result_count: resultCount,
      search_type: 'full',
      filters: JSON.stringify(filters),
    })
    .then(() => {
      // Successfully logged
    })
    .catch((error) => {
      // Log error but don't fail the request
      console.warn('Failed to log search analytics:', error);
    });
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim() || '';
  const category = url.searchParams.get('category') || undefined;
  const dosageForm = url.searchParams.get('dosageForm') || undefined;
  const limitParam = url.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '20', 10) || 20, 1), 50);

  // Validate query
  if (!query || query.length < 2) {
    return new Response(
      JSON.stringify({
        error: 'Search query must be at least 2 characters',
        results: [],
        count: 0,
        query: query,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }

  try {
    let results: SearchResult[];

    // Try full-text search first
    try {
      results = await searchProducts(query, {
        categorySlug: category,
        dosageFormSlug: dosageForm,
        limit,
      });
    } catch (searchError) {
      // Fallback to simple ILIKE search if RPC fails
      console.warn('Full-text search failed, using simple search:', searchError);
      const simpleResults = await searchProductsSimple(query, {
        categorySlug: category,
        dosageFormSlug: dosageForm,
        limit,
      });

      // Transform to SearchResult format
      results = simpleResults.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        description: p.description,
        category_name: p.category?.name || null,
        dosage_form_name: p.dosage_form?.name || null,
        rank: 1, // No ranking for simple search
      }));
    }

    // Log search to analytics (non-blocking)
    logSearchAnalytics(query, results.length, { category, dosageForm });

    return new Response(
      JSON.stringify({
        results,
        count: results.length,
        query,
        filters: {
          category: category || null,
          dosageForm: dosageForm || null,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({
        error: 'Search failed',
        results: [],
        count: 0,
        query,
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
