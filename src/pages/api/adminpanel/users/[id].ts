/**
 * API Endpoint: /api/adminpanel/users/[id]
 * Individual user management
 * Requires userManagement permission (Super Admin only)
 *
 * GET - Get user details
 * PATCH - Update user (role)
 * DELETE - Delete user
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../../utils/supabase';
import { hasPermission, isValidRole, isSuperAdmin } from '../../../../utils/rbac';
import { logAuditAction } from '../../../../utils/auditLog';

/**
 * GET - Get user details
 */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify authentication
    const authResult = await verifySession(request);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check user management permission
    if (!hasPermission(authResult.user.role, 'userManagement', 'view')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Fetch user (excluding password_hash)
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, username, role, created_at, last_login')
      .eq('id', id)
      .single();

    if (error || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /adminpanel/users/[id] GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PATCH - Update user (role only)
 */
export const PATCH: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
    const { role } = body;

    // Validate role
    if (!role || !isValidRole(role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid role. Must be super_admin, staff, or manufacturer' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Fetch current user
    const { data: targetUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, username, role')
      .eq('id', id)
      .single();

    if (fetchError || !targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-demotion
    if (targetUser.id === authResult.user.id && role !== 'super_admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot demote yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent removing last super_admin if demoting a super_admin
    if (targetUser.role === 'super_admin' && role !== 'super_admin') {
      const { count } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin');

      if (count !== null && count <= 1) {
        return new Response(
          JSON.stringify({ success: false, error: 'Cannot demote the last Super Admin' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const previousRole = targetUser.role;

    // Update user role
    const { data: updatedUser, error: updateError } = await supabase
      .from('admin_users')
      .update({ role })
      .eq('id', id)
      .select('id, username, role, created_at, last_login')
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log audit action
    await logAuditAction(request, authResult.user, 'USER_ROLE_CHANGED', {
      resourceId: id,
      details: {
        targetUsername: targetUser.username,
        previousRole,
        newRole: role,
      },
    });

    return new Response(
      JSON.stringify({ success: true, user: updatedUser }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /adminpanel/users/[id] PATCH error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE - Delete user
 */
export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    const supabase = getSupabaseServiceClient();

    // Fetch target user
    const { data: targetUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, username, role')
      .eq('id', id)
      .single();

    if (fetchError || !targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-deletion
    if (targetUser.id === authResult.user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot delete yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent deleting last super_admin
    if (targetUser.role === 'super_admin') {
      const { count } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin');

      if (count !== null && count <= 1) {
        return new Response(
          JSON.stringify({ success: false, error: 'Cannot delete the last Super Admin' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete user's sessions first
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('user_id', id);

    // Delete user
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log audit action
    await logAuditAction(request, authResult.user, 'USER_DELETED', {
      resourceId: id,
      details: {
        targetUsername: targetUser.username,
        targetRole: targetUser.role,
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /adminpanel/users/[id] DELETE error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
