import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getSupabaseServiceClient } from '../../utils/supabase';

// In-memory rate limiting for catalog auth
const catalogAuthAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

/**
 * Get client IP from request headers
 */
function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    'unknown'
  );
}

/**
 * Check and record rate limit for an IP
 * Returns true if the request is allowed
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = catalogAuthAttempts.get(ip);

  if (!record || now > record.resetAt) {
    catalogAuthAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  record.count++;
  return record.count <= MAX_ATTEMPTS;
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const clientIP = getClientIP(request);

  // Check rate limit
  if (!checkRateLimit(clientIP)) {
    return redirect('/catalog?error=rate_limited', 302);
  }

  const formData = await request.formData();
  const password = formData.get('password')?.toString() || '';

  let authenticated = false;

  // Fetch active password hashes from database
  try {
    const supabase = getSupabaseServiceClient();
    const { data: passwords, error } = await supabase
      .from('catalog_passwords')
      .select('password_hash')
      .eq('is_active', true);

    if (error) {
      console.error('Catalog auth: failed to fetch passwords from database:', error);
      return redirect('/catalog?error=server', 302);
    }

    if (passwords && passwords.length > 0) {
      for (const row of passwords) {
        try {
          if (await bcrypt.compare(password, row.password_hash)) {
            authenticated = true;
            break;
          }
        } catch {
          // Invalid hash format, skip
        }
      }
    }
  } catch (error) {
    console.error('Catalog auth: database error:', error);
    return redirect('/catalog?error=server', 302);
  }

  if (authenticated) {
    // Set secure HTTP-only cookie (expires in 24 hours)
    cookies.set('catalog_auth', 'authenticated', {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return redirect('/catalog', 302);
  }

  // Invalid password - redirect back with error
  return redirect('/catalog?error=invalid', 302);
};

// Handle logout
export const DELETE: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('catalog_auth', { path: '/' });
  return redirect('/catalog', 302);
};
