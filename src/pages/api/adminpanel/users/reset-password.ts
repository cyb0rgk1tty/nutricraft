/**
 * API Endpoint: POST /api/adminpanel/users/reset-password
 * Reset a user's password
 * Requires userManagement:edit permission (Super Admin only)
 *
 * Generates a random temporary password and returns it once
 */

import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { verifySession } from '../../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../../utils/supabase';
import { hasPermission } from '../../../../utils/rbac';
import { logAuditAction } from '../../../../utils/auditLog';

/**
 * Generate a secure random password
 */
function generateTempPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join('');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check user management permission
    if (!hasPermission(authResult.user.role, 'userManagement', 'edit')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Fetch target user
    const { data: targetUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, username, role')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword(12);

    // Hash password
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Update user's password
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);

    if (updateError) {
      console.error('Error resetting password:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to reset password' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Invalidate all existing sessions for this user
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('user_id', userId);

    // Log audit action
    await logAuditAction(request, authResult.user, 'PASSWORD_RESET', {
      resourceId: userId,
      details: {
        targetUsername: targetUser.username,
      },
    });

    // Return the temporary password (shown once to admin)
    return new Response(
      JSON.stringify({
        success: true,
        tempPassword,
        message: 'Password reset successfully. Please share this temporary password securely with the user.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /adminpanel/users/reset-password POST error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
