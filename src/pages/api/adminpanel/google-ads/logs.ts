/**
 * Google Ads Sync Logs API
 * Returns recent sync history for the Google Ads integration
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../../utils/supabase';

export const GET: APIRoute = async ({ request }) => {
  // Verify admin session
  const authResult = await verifySession(request);
  if (!authResult) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only nutricraftadmin can access
  if (authResult.user.username !== 'nutricraftadmin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch recent sync logs
    const { data: logs, error } = await getSupabaseServiceClient()
      .from('google_ads_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching sync logs:', error);
      return new Response(JSON.stringify({ logs: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ logs: logs || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Sync logs error:', error);
    return new Response(JSON.stringify({ logs: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
