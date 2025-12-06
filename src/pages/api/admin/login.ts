/**
 * API Endpoint: POST /api/admin/login
 * Authenticates admin users for the manufacturer dashboard
 */

import type { APIRoute } from 'astro';
import {
  verifyCredentials,
  createSession,
  createSessionCookie,
} from '../../../utils/adminAuth';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Username is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Password is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify credentials
    const user = await verifyCredentials(username, password);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid username or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    const token = await createSession(user.id);

    // Return success with session cookie
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': createSessionCookie(token),
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred during login',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
