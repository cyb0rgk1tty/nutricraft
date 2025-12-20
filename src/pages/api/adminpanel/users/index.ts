/**
 * API Endpoint: /api/adminpanel/users
 * User management for the admin panel
 * Requires userManagement permission (Super Admin only)
 *
 * GET - List all users
 * POST - Create new user
 */

import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { verifySession } from '../../../../utils/adminAuth';
import { getSupabaseServiceClient } from '../../../../utils/supabase';
import { hasPermission, isValidRole, type UserRole } from '../../../../utils/rbac';
import { logAuditAction } from '../../../../utils/auditLog';

// Validation constants
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 50;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const PASSWORD_MIN_LENGTH = 12;

/**
 * GET - List all users
 */
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

    // Check user management permission
    if (!hasPermission(authResult.user.role, 'userManagement', 'view')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Fetch all users (excluding password_hash)
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, username, role, created_at, last_login')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch users' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, users: users || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /adminpanel/users GET error:', error);
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
 * POST - Create new user
 */
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
    const { username, password, role } = body;

    // Validate username
    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Username is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < USERNAME_MIN_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Username must be at least ${USERNAME_MIN_LENGTH} characters` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (trimmedUsername.length > USERNAME_MAX_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Username must be at most ${USERNAME_MAX_LENGTH} characters` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username can only contain letters, numbers, and underscores' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Password is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    if (!role || !isValidRole(role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid role. Must be super_admin, staff, or manufacturer' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username_lower', trimmedUsername.toLowerCase())
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('admin_users')
      .insert({
        username: trimmedUsername,
        username_lower: trimmedUsername.toLowerCase(),
        password_hash: passwordHash,
        role: role as UserRole,
      })
      .select('id, username, role, created_at')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log audit action
    await logAuditAction(request, authResult.user, 'USER_CREATED', {
      resourceId: newUser.id,
      details: {
        targetUsername: newUser.username,
        targetRole: newUser.role,
      },
    });

    return new Response(
      JSON.stringify({ success: true, user: newUser }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /adminpanel/users POST error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
