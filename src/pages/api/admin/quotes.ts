/**
 * API Endpoint: GET /api/admin/quotes
 * Fetches quote requests from Twenty CRM
 */

import type { APIRoute } from 'astro';
import { fetchQuotesFromCRM } from '../../../utils/twentyCrmQuotes';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Fetch quotes from CRM
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
        headers: { 'Content-Type': 'application/json' },
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
