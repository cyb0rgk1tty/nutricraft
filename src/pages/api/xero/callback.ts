/**
 * Xero OAuth2 Callback Endpoint
 *
 * Handles the OAuth2 callback from Xero after user authorization.
 * Exchanges authorization code for tokens and stores them securely.
 *
 * GET /api/xero/callback
 *
 * Query Parameters (from Xero):
 * - code: Authorization code to exchange for tokens
 * - state: CSRF state token for validation
 *
 * Security:
 * - Validates CSRF state token
 * - Encrypts tokens before storage
 * - Clears OAuth state cookie after use
 */

import type { APIRoute } from 'astro';
import { exchangeCodeForTokens, storeTokens } from '../../../utils/xero/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Get stored state from cookie
  const storedStateData = cookies.get('xero_oauth_state')?.value;

  // Clear the OAuth state cookie
  cookies.delete('xero_oauth_state', { path: '/' });

  // Default return URL
  let returnUrl = '/adminpanel';

  // Parse stored state
  if (storedStateData) {
    try {
      const parsed = JSON.parse(storedStateData);
      returnUrl = parsed.returnUrl || returnUrl;

      // Validate state parameter (CSRF protection)
      if (state !== parsed.state) {
        console.error('Xero callback: State mismatch');
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${returnUrl}?xero_error=invalid_state`,
          },
        });
      }
    } catch {
      console.error('Xero callback: Failed to parse state cookie');
    }
  }

  // Check for errors from Xero
  if (error) {
    console.error('Xero OAuth error:', error, errorDescription);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${returnUrl}?xero_error=${encodeURIComponent(error)}&xero_error_description=${encodeURIComponent(errorDescription || '')}`,
      },
    });
  }

  // Validate code
  if (!code) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${returnUrl}?xero_error=missing_code`,
      },
    });
  }

  try {
    // Exchange code for tokens
    const result = await exchangeCodeForTokens(code);

    if (!result) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${returnUrl}?xero_error=token_exchange_failed`,
        },
      });
    }

    const { tokenSet, tenants } = result;

    // Store tokens for each tenant (typically just one for single-org setup)
    if (tenants.length === 0) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${returnUrl}?xero_error=no_tenants`,
        },
      });
    }

    // Store tokens for the first (or only) tenant
    const tenant = tenants[0];
    await storeTokens(tenant.tenantId, tenant.tenantName, tokenSet);

    console.log(`Xero connected: ${tenant.tenantName} (${tenant.tenantId})`);

    // Redirect to return URL with success
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${returnUrl}?xero_connected=true&xero_tenant=${encodeURIComponent(tenant.tenantName)}`,
      },
    });
  } catch (err) {
    console.error('Xero callback error:', err);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${returnUrl}?xero_error=callback_error`,
      },
    });
  }
};
