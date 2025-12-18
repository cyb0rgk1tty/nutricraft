/**
 * API Endpoint: /api/admin/announcements
 * Manages site announcement settings
 * Protected by session authentication
 *
 * GET - Fetch current announcement settings
 * PATCH - Update announcement (is_active, message)
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../utils/adminAuth';
import { getAnnouncement, updateAnnouncement } from '../../../utils/announcements';

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

    // Fetch current announcement
    const announcement = await getAnnouncement();

    return new Response(
      JSON.stringify({ success: true, announcement }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch announcement' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { id, is_active, message } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing announcement ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build updates object
    const updates: { is_active?: boolean; message?: string } = {};
    if (typeof is_active === 'boolean') {
      updates.is_active = is_active;
    }
    if (typeof message === 'string' && message.trim()) {
      updates.message = message.trim();
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid updates provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update announcement
    const result = await updateAnnouncement(id, updates);

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch updated announcement to return
    const announcement = await getAnnouncement();

    return new Response(
      JSON.stringify({ success: true, announcement }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating announcement:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to update announcement' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
