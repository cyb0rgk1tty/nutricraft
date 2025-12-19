/**
 * API Endpoint: GET /api/adminpanel/airwallex/debug
 *
 * Diagnostic endpoint to test Airwallex API credentials.
 * Shows detailed configuration and authentication results.
 *
 * Protected by admin authentication (nutricraftadmin only).
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../../utils/adminAuth';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verify admin authentication
    const authResult = await verifySession(request);
    if (!authResult || authResult.user.username !== 'nutricraftadmin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    const clientId = import.meta.env.AIRWALLEX_CLIENT_ID || process.env.AIRWALLEX_CLIENT_ID || '';
    const apiKey = import.meta.env.AIRWALLEX_API_KEY || process.env.AIRWALLEX_API_KEY || '';
    const env = import.meta.env.AIRWALLEX_ENV || process.env.AIRWALLEX_ENV || 'production';

    const baseUrl = env === 'sandbox'
      ? 'https://api-demo.airwallex.com'
      : 'https://api.airwallex.com';

    // Configuration info (safe to show)
    const config = {
      environment: env,
      baseUrl,
      clientIdSet: !!clientId,
      clientIdLength: clientId.length,
      clientIdPreview: clientId ? `${clientId.substring(0, 12)}...${clientId.substring(clientId.length - 4)}` : 'NOT SET',
      apiKeySet: !!apiKey,
      apiKeyLength: apiKey.length,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET',
    };

    // Try to authenticate
    let authResult2: any = { attempted: false };

    if (clientId && apiKey) {
      try {
        const authUrl = `${baseUrl}/api/v1/authentication/login`;

        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': clientId,
            'x-api-key': apiKey,
          },
        });

        const responseText = await response.text();
        let responseJson: any = null;
        try {
          responseJson = JSON.parse(responseText);
        } catch {
          // Not JSON
        }

        authResult2 = {
          attempted: true,
          url: authUrl,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseBody: responseJson || responseText.substring(0, 1000),
          tokenReceived: responseJson?.token ? true : false,
          tokenExpiry: responseJson?.expires_at,
        };
      } catch (error) {
        authResult2 = {
          attempted: true,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        };
      }
    } else {
      authResult2 = {
        attempted: false,
        reason: 'Missing credentials - clientId or apiKey not set',
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        config,
        authentication: authResult2,
      }, null, 2),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run diagnostic',
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
