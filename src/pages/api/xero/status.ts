/**
 * Xero Connection Status Endpoint
 *
 * Returns the current Xero connection status.
 * Used by the admin panel to show connection state.
 *
 * GET /api/xero/status
 *
 * Response:
 * - connected: boolean
 * - organizationName: string (if connected)
 * - tenantId: string (if connected)
 * - error: string (if not connected)
 */

import type { APIRoute } from 'astro';
import { isXeroConfigured, getValidTokens } from '../../../utils/xero/auth';
import { testXeroConnection } from '../../../utils/xero/client';
import { getSyncConfig, getLastReconciliation } from '../../../utils/sync/config';

export const GET: APIRoute = async () => {
  // Check if Xero is configured
  if (!isXeroConfigured()) {
    return new Response(
      JSON.stringify({
        configured: false,
        connected: false,
        error: 'Xero OAuth not configured',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Check for valid tokens
    const tokens = await getValidTokens();

    if (!tokens) {
      return new Response(
        JSON.stringify({
          configured: true,
          connected: false,
          error: 'Not connected to Xero',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Test the connection
    const connectionTest = await testXeroConnection();

    if (!connectionTest.connected) {
      return new Response(
        JSON.stringify({
          configured: true,
          connected: false,
          error: connectionTest.error || 'Connection test failed',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get sync config and last reconciliation
    const config = await getSyncConfig();
    const lastReconciliation = await getLastReconciliation();

    return new Response(
      JSON.stringify({
        configured: true,
        connected: true,
        organizationName: connectionTest.organizationName,
        tenantId: tokens.tenantId,
        tenantName: tokens.tenantName,
        autoSyncEnabled: config.autoSyncEnabled,
        lastReconciliation: lastReconciliation?.toISOString() || null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Xero status check error:', error);
    return new Response(
      JSON.stringify({
        configured: true,
        connected: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
