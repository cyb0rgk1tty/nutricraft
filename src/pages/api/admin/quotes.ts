/**
 * API Endpoint: GET /api/admin/quotes
 * Fetches quote requests from Twenty CRM with pagination support
 * Protected by session authentication
 *
 * Query Parameters:
 *   - page: Page number (1-based, default: 1)
 *   - limit: Items per page (default: 50, max: 100)
 *   - status: Filter by status (optional)
 *   - search: Search by name (optional)
 *   - sortField: Field to sort by (createdAt, name, ourCost, orderQuantity)
 *   - sortDirection: Sort direction (asc, desc)
 */

import type { APIRoute } from 'astro';
import { fetchQuotesFromCRM, fetchQuotesPaginated } from '../../../utils/twentyCrmQuotes';
import type { FetchQuotesOptions } from '../../../utils/twentyCrmQuotes';
import { verifySession } from '../../../utils/adminAuth';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const sortField = (url.searchParams.get('sortField') || 'createdAt') as FetchQuotesOptions['sortField'];
    const sortDirection = (url.searchParams.get('sortDirection') || 'desc') as FetchQuotesOptions['sortDirection'];

    // Check if pagination is requested (any pagination param present)
    const usePagination = url.searchParams.has('page') ||
                          url.searchParams.has('limit') ||
                          url.searchParams.has('status') ||
                          url.searchParams.has('search') ||
                          url.searchParams.has('sortField');

    // Use paginated fetch if pagination params are present, otherwise use legacy fetch for backwards compatibility
    if (usePagination) {
      const result = await fetchQuotesPaginated({
        page,
        limit,
        status,
        search,
        sortField,
        sortDirection,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.error || 'Failed to fetch quotes',
            quotes: [],
            statusCounts: {},
            pagination: result.pagination,
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          quotes: result.quotes,
          statusCounts: result.statusCounts,
          pagination: result.pagination,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
          },
        }
      );
    }

    // Legacy non-paginated fetch for backwards compatibility
    const result = await fetchQuotesFromCRM();

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to fetch quotes',
          quotes: [],
          statusCounts: {},
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        quotes: result.quotes,
        statusCounts: result.statusCounts,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('API /admin/quotes error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        quotes: [],
        statusCounts: {},
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
