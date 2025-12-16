/**
 * CAPTCHA Verification Utilities
 *
 * Uses Cloudflare Turnstile for bot protection.
 * Turnstile is free, privacy-friendly, and often invisible to users.
 *
 * Setup:
 * 1. Create account at https://dash.cloudflare.com/
 * 2. Go to Turnstile and create a widget
 * 3. Add TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY to .env
 *
 * The CAPTCHA is triggered after failed login attempts to prevent
 * brute force attacks while not inconveniencing legitimate users.
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Number of failed attempts before CAPTCHA is required
export const CAPTCHA_THRESHOLD = 2;

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Get Turnstile configuration from environment
 */
export function getTurnstileConfig(): { siteKey: string; secretKey: string } | null {
  const siteKey = process.env.TURNSTILE_SITE_KEY || import.meta.env.TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;

  if (!siteKey || !secretKey) {
    return null;
  }

  return { siteKey, secretKey };
}

/**
 * Check if CAPTCHA is enabled
 */
export function isCaptchaEnabled(): boolean {
  return getTurnstileConfig() !== null;
}

/**
 * Verify a Turnstile CAPTCHA token
 *
 * @param token - The token from the client-side widget
 * @param remoteip - Optional client IP for additional verification
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function verifyCaptcha(
  token: string,
  remoteip?: string
): Promise<{ success: boolean; error?: string }> {
  const config = getTurnstileConfig();

  if (!config) {
    // CAPTCHA not configured - allow the request
    console.warn('CAPTCHA verification skipped: Turnstile not configured');
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'CAPTCHA verification required' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', config.secretKey);
    formData.append('response', token);
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error('Turnstile API error:', response.status, response.statusText);
      // On API error, allow the request but log it
      return { success: true };
    }

    const data: TurnstileResponse = await response.json();

    if (data.success) {
      return { success: true };
    }

    // Map error codes to user-friendly messages
    const errorCodes = data['error-codes'] || [];
    let errorMessage = 'CAPTCHA verification failed. Please try again.';

    if (errorCodes.includes('timeout-or-duplicate')) {
      errorMessage = 'CAPTCHA expired. Please complete the verification again.';
    } else if (errorCodes.includes('invalid-input-response')) {
      errorMessage = 'Invalid CAPTCHA response. Please try again.';
    }

    console.error('Turnstile verification failed:', errorCodes);
    return { success: false, error: errorMessage };
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    // On network error, allow the request but log it
    return { success: true };
  }
}

/**
 * Check if CAPTCHA is required based on failed attempts
 */
export function isCaptchaRequired(failedAttempts: number): boolean {
  return failedAttempts >= CAPTCHA_THRESHOLD;
}

/**
 * Get the Turnstile site key for client-side use
 * Returns null if not configured
 */
export function getTurnstileSiteKey(): string | null {
  const config = getTurnstileConfig();
  return config?.siteKey || null;
}
