/**
 * Xero OAuth2 Connect Endpoint
 *
 * Initiates the Xero OAuth2 authorization flow.
 * Redirects to Xero login page for user authorization.
 *
 * GET /api/xero/connect
 *
 * Query Parameters:
 * - return_url (optional): URL to redirect to after completion
 *
 * Security:
 * - Generates and stores CSRF state token
 * - State includes optional return URL for post-auth redirect
 */

import type { APIRoute } from 'astro';
import * as crypto from 'crypto';
import { getAuthorizationUrl, isXeroConfigured } from '../../../utils/xero/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  // Check if Xero is configured
  if (!isXeroConfigured()) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Xero OAuth not configured. Please set environment variables.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Get optional return URL from query params
    const url = new URL(request.url);
    const returnUrl = url.searchParams.get('return_url') || '/adminpanel';

    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString('hex');

    // Store state and return URL in a cookie (for validation in callback)
    const stateData = JSON.stringify({ state, returnUrl });
    cookies.set('xero_oauth_state', stateData, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    // Get authorization URL and redirect
    const authUrl = getAuthorizationUrl(state);

    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl,
      },
    });
  } catch (error) {
    console.error('Xero connect error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate OAuth',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
