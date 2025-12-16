/**
 * API Endpoint: POST /api/admin/login
 * Authenticates admin users for the manufacturer dashboard
 *
 * Security Features:
 * - IP-based rate limiting (10 attempts per 15 minutes)
 * - Account lockout after 5 failed attempts
 * - Progressive lockout durations (5min, 15min, 30min, 1hr, 2hr)
 * - CAPTCHA verification after 2 failed attempts
 * - Audit logging of all login attempts
 */

import type { APIRoute } from 'astro';
import {
  verifyCredentials,
  createSession,
  createSessionCookie,
} from '../../../utils/adminAuth';
import { logAuditAction } from '../../../utils/auditLog';
import {
  getClientIP,
  checkRateLimit,
  checkAccountLockout,
  recordLoginAttempt,
  getSecurityHeaders,
  getRecentFailedAttempts,
} from '../../../utils/loginSecurity';
import {
  verifyCaptcha,
  isCaptchaRequired,
  isCaptchaEnabled,
  getTurnstileSiteKey,
  CAPTCHA_THRESHOLD,
} from '../../../utils/captcha';

export const POST: APIRoute = async ({ request }) => {
  const ipAddress = getClientIP(request);

  try {
    // Step 1: Check IP-based rate limiting
    const rateLimitResult = await checkRateLimit(ipAddress);
    const securityHeaders = getSecurityHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      // Log rate limit hit
      logAuditAction(request, null, 'LOGIN_FAILED', {
        details: {
          reason: 'rate_limited',
          ip_address: ipAddress,
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: rateLimitResult.message,
          retryAfter: rateLimitResult.retryAfterSeconds,
        }),
        {
          status: 429, // Too Many Requests
          headers: {
            'Content-Type': 'application/json',
            ...securityHeaders,
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, password, captchaToken } = body;

    // Validate input
    if (!username || typeof username !== 'string') {
      await recordLoginAttempt(ipAddress, null, false);
      return new Response(
        JSON.stringify({ success: false, error: 'Username is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        }
      );
    }

    if (!password || typeof password !== 'string') {
      await recordLoginAttempt(ipAddress, username, false);
      return new Response(
        JSON.stringify({ success: false, error: 'Password is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...securityHeaders },
        }
      );
    }

    // Step 2: Check if CAPTCHA is required
    const recentFailedAttempts = await getRecentFailedAttempts(ipAddress);
    const captchaRequired = isCaptchaEnabled() && isCaptchaRequired(recentFailedAttempts);

    if (captchaRequired) {
      if (!captchaToken) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Please complete the CAPTCHA verification',
            captchaRequired: true,
            captchaSiteKey: getTurnstileSiteKey(),
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders },
          }
        );
      }

      // Verify CAPTCHA token
      const captchaResult = await verifyCaptcha(captchaToken, ipAddress);
      if (!captchaResult.success) {
        logAuditAction(request, null, 'LOGIN_FAILED', {
          details: {
            username: username.trim(),
            reason: 'captcha_failed',
          },
        });

        return new Response(
          JSON.stringify({
            success: false,
            error: captchaResult.error || 'CAPTCHA verification failed',
            captchaRequired: true,
            captchaSiteKey: getTurnstileSiteKey(),
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders },
          }
        );
      }
    }

    // Step 3: Check account lockout
    const lockoutResult = await checkAccountLockout(username);

    if (lockoutResult.locked) {
      // Log locked account attempt
      logAuditAction(request, null, 'LOGIN_FAILED', {
        details: {
          username: username.trim(),
          reason: 'account_locked',
          locked_until: lockoutResult.lockedUntil?.toISOString(),
        },
      });

      await recordLoginAttempt(ipAddress, username, false);

      return new Response(
        JSON.stringify({
          success: false,
          error: lockoutResult.message,
          retryAfter: lockoutResult.retryAfterSeconds,
          locked: true,
          captchaRequired: isCaptchaEnabled(),
          captchaSiteKey: getTurnstileSiteKey(),
        }),
        {
          status: 423, // Locked
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(lockoutResult.retryAfterSeconds || 300),
            ...securityHeaders,
          },
        }
      );
    }

    // Step 3: Verify credentials
    const user = await verifyCredentials(username, password);

    if (!user) {
      // Record failed attempt (this may trigger a lockout)
      await recordLoginAttempt(ipAddress, username, false);

      // Re-check lockout to get updated remaining attempts
      const updatedLockout = await checkAccountLockout(username);

      // Log failed login attempt
      logAuditAction(request, null, 'LOGIN_FAILED', {
        details: {
          username: username.trim(),
          reason: 'invalid_credentials',
          remaining_attempts: updatedLockout.remainingAttempts,
        },
      });

      // Construct error message
      let errorMessage = 'Invalid username or password.';
      if (updatedLockout.locked) {
        errorMessage = updatedLockout.message || 'Account has been locked due to too many failed attempts.';
      } else if (updatedLockout.remainingAttempts !== undefined && updatedLockout.remainingAttempts <= 3) {
        errorMessage += ` ${updatedLockout.remainingAttempts} attempt${updatedLockout.remainingAttempts === 1 ? '' : 's'} remaining before lockout.`;
      }

      // Check if CAPTCHA will be required on next attempt
      const updatedFailedAttempts = recentFailedAttempts + 1;
      const willRequireCaptcha = isCaptchaEnabled() && isCaptchaRequired(updatedFailedAttempts);

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          remainingAttempts: updatedLockout.remainingAttempts,
          locked: updatedLockout.locked,
          retryAfter: updatedLockout.retryAfterSeconds,
          captchaRequired: willRequireCaptcha,
          captchaSiteKey: willRequireCaptcha ? getTurnstileSiteKey() : null,
        }),
        {
          status: updatedLockout.locked ? 423 : 401,
          headers: {
            'Content-Type': 'application/json',
            ...(updatedLockout.retryAfterSeconds && { 'Retry-After': String(updatedLockout.retryAfterSeconds) }),
            ...securityHeaders,
          },
        }
      );
    }

    // Step 4: Successful login - create session
    await recordLoginAttempt(ipAddress, username, true);
    const token = await createSession(user.id);

    // Log successful login
    logAuditAction(request, user, 'LOGIN');

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
          ...securityHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);

    // Record the failed attempt if possible
    try {
      await recordLoginAttempt(ipAddress, null, false);
    } catch {
      // Ignore recording errors
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred during login. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
