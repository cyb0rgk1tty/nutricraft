/**
 * API Endpoint: POST /api/admin/logout
 * Logs out admin users from the manufacturer dashboard
 */

import type { APIRoute } from 'astro';
import {
  getSessionToken,
  deleteSession,
  clearSessionCookie,
} from '../../../utils/adminAuth';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get session token from cookie
    const token = getSessionToken(request);

    if (token) {
      // Delete session from database
      await deleteSession(token);
    }

    // Return success with cleared cookie
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearSessionCookie(),
        },
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear the cookie even if there's an error
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearSessionCookie(),
        },
      }
    );
  }
};
