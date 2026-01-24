/**
 * Xero Integration Index
 *
 * Central export for all Xero-related utilities.
 */

// Auth and token management
export {
  isXeroConfigured,
  getXeroConfig,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  storeTokens,
  getStoredTokens,
  getValidTokens,
  deleteTokens,
  isTokenExpired,
  refreshAccessToken,
  encrypt,
  decrypt,
} from './auth';

// API client
export { XeroClient, isXeroConnected, testXeroConnection } from './client';

// Type exports
export type {
  XeroTokenSet,
  XeroTenant,
  XeroTokenRecord,
  SyncEntityType,
  SyncStatus,
  XeroSyncRecord,
  SyncResult,
  XeroContact,
  XeroLineItem,
  XeroInvoice,
  XeroPayment,
  XeroSyncConfig,
  InvoiceNinjaInvoice,
  InvoiceNinjaPayment,
  InvoiceNinjaClient,
} from './types';
