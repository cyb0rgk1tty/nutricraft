/**
 * API Endpoint: POST /api/admin/logout
 * Logs out admin users from the manufacturer dashboard
 */

import type { APIRoute } from 'astro';
import {
  getSessionToken,
  deleteSession,
  clearSessionCookie,
  verifySession,
} from '../../../utils/adminAuth';
import { logAuditAction } from '../../../utils/auditLog';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get user info before logging out (for audit log)
    const authResult = await verifySession(request);

    // Get session token from cookie
    const token = getSessionToken(request);

    if (token) {
      // Delete session from database
      await deleteSession(token);
    }

    // Log logout action
    if (authResult?.user) {
      logAuditAction(request, authResult.user, 'LOGOUT');
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
