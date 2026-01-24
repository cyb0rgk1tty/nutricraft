/**
 * Xero OAuth Token Management
 *
 * Handles secure storage and retrieval of Xero OAuth2 tokens.
 * Tokens are encrypted at rest using AES-256-GCM encryption.
 *
 * Environment Variables Required:
 * - XERO_CLIENT_ID: Xero app client ID
 * - XERO_CLIENT_SECRET: Xero app client secret
 * - XERO_REDIRECT_URI: OAuth callback URL
 * - XERO_TOKEN_ENCRYPTION_KEY: 256-bit hex key for token encryption
 */

import crypto from 'crypto';
import { getSupabaseServiceClient } from '../supabase';
import type { XeroTokenSet, XeroTokenRecord, XeroTenant } from './types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get the encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = import.meta.env.XERO_TOKEN_ENCRYPTION_KEY || process.env.XERO_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('XERO_TOKEN_ENCRYPTION_KEY not configured');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string using AES-256-GCM
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string using AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Get Xero OAuth configuration
 */
export function getXeroConfig() {
  const clientId = import.meta.env.XERO_CLIENT_ID || process.env.XERO_CLIENT_ID;
  const clientSecret = import.meta.env.XERO_CLIENT_SECRET || process.env.XERO_CLIENT_SECRET;
  const redirectUri = import.meta.env.XERO_REDIRECT_URI || process.env.XERO_REDIRECT_URI;

  return { clientId, clientSecret, redirectUri };
}

/**
 * Check if Xero is configured
 */
export function isXeroConfigured(): boolean {
  const { clientId, clientSecret, redirectUri } = getXeroConfig();
  const encryptionKey = import.meta.env.XERO_TOKEN_ENCRYPTION_KEY || process.env.XERO_TOKEN_ENCRYPTION_KEY;
  return !!(clientId && clientSecret && redirectUri && encryptionKey);
}

/**
 * Store OAuth tokens securely in the database
 */
export async function storeTokens(
  tenantId: string,
  tenantName: string | null,
  tokenSet: XeroTokenSet
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  const encryptedAccessToken = encrypt(tokenSet.access_token);
  const encryptedRefreshToken = encrypt(tokenSet.refresh_token);
  const expiresAt = new Date(tokenSet.expires_at * 1000).toISOString();

  const { error } = await supabase.from('xero_tokens').upsert(
    {
      tenant_id: tenantId,
      tenant_name: tenantName,
      access_token_encrypted: encryptedAccessToken,
      refresh_token_encrypted: encryptedRefreshToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'tenant_id' }
  );

  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`);
  }
}

/**
 * Retrieve and decrypt stored tokens
 */
export async function getStoredTokens(tenantId?: string): Promise<{
  tenantId: string;
  tenantName: string | null;
  tokenSet: XeroTokenSet;
} | null> {
  const supabase = getSupabaseServiceClient();

  let query = supabase.from('xero_tokens').select('*');

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).single();

  if (error || !data) {
    return null;
  }

  const record = data as XeroTokenRecord;

  try {
    const accessToken = decrypt(record.access_token_encrypted);
    const refreshToken = decrypt(record.refresh_token_encrypted);

    return {
      tenantId: record.tenant_id,
      tenantName: record.tenant_name,
      tokenSet: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Math.floor(new Date(record.expires_at).getTime() / 1000),
        token_type: 'Bearer',
        scope: 'accounting.transactions accounting.contacts offline_access',
      },
    };
  } catch (decryptError) {
    console.error('Failed to decrypt tokens:', decryptError);
    return null;
  }
}

/**
 * Check if tokens are expired (with 5 minute buffer)
 */
export function isTokenExpired(tokenSet: XeroTokenSet): boolean {
  const bufferSeconds = 300; // 5 minutes
  const now = Math.floor(Date.now() / 1000);
  return tokenSet.expires_at <= now + bufferSeconds;
}

/**
 * Refresh tokens using the refresh token
 */
export async function refreshAccessToken(
  tenantId: string,
  refreshToken: string
): Promise<XeroTokenSet | null> {
  const { clientId, clientSecret } = getXeroConfig();

  if (!clientId || !clientSecret) {
    throw new Error('Xero OAuth not configured');
  }

  try {
    const response = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', errorText);
      return null;
    }

    const data = await response.json();

    const newTokenSet: XeroTokenSet = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
    };

    // Get existing tenant name
    const existing = await getStoredTokens(tenantId);
    const tenantName = existing?.tenantName || null;

    // Store the new tokens
    await storeTokens(tenantId, tenantName, newTokenSet);

    return newTokenSet;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Get valid tokens, refreshing if necessary
 */
export async function getValidTokens(tenantId?: string): Promise<{
  tenantId: string;
  tenantName: string | null;
  tokenSet: XeroTokenSet;
} | null> {
  const stored = await getStoredTokens(tenantId);

  if (!stored) {
    return null;
  }

  // Check if token needs refresh
  if (isTokenExpired(stored.tokenSet)) {
    const refreshed = await refreshAccessToken(stored.tenantId, stored.tokenSet.refresh_token);
    if (!refreshed) {
      return null;
    }
    return {
      tenantId: stored.tenantId,
      tenantName: stored.tenantName,
      tokenSet: refreshed,
    };
  }

  return stored;
}

/**
 * Delete stored tokens (for disconnecting)
 */
export async function deleteTokens(tenantId: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  await supabase.from('xero_tokens').delete().eq('tenant_id', tenantId);
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthorizationUrl(state: string): string {
  const { clientId, redirectUri } = getXeroConfig();

  if (!clientId || !redirectUri) {
    throw new Error('Xero OAuth not configured');
  }

  const scopes = [
    'openid',
    'profile',
    'email',
    'accounting.transactions',
    'accounting.contacts',
    'offline_access',
  ];

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state,
  });

  return `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<{ tokenSet: XeroTokenSet; tenants: XeroTenant[] } | null> {
  const { clientId, clientSecret, redirectUri } = getXeroConfig();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Xero OAuth not configured');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return null;
    }

    const tokenData = await tokenResponse.json();

    const tokenSet: XeroTokenSet = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    };

    // Get connected tenants
    const tenantsResponse = await fetch('https://api.xero.com/connections', {
      headers: {
        Authorization: `Bearer ${tokenSet.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!tenantsResponse.ok) {
      console.error('Failed to get tenants');
      return null;
    }

    const tenants: XeroTenant[] = await tenantsResponse.json();

    return { tokenSet, tenants };
  } catch (error) {
    console.error('Code exchange error:', error);
    return null;
  }
}
