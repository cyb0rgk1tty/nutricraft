/**
 * Xero API Client
 *
 * Wrapper around Xero API for invoice, contact, and payment operations.
 * Uses direct HTTP calls instead of the xero-node SDK for simpler integration.
 */

import { getValidTokens } from './auth';
import type {
  XeroContact,
  XeroInvoice,
  XeroPayment,
  SyncResult,
} from './types';

const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0';

/**
 * Make an authenticated request to Xero API
 */
async function xeroRequest<T>(
  endpoint: string,
  tenantId: string,
  accessToken: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT';
    body?: unknown;
  } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { method = 'GET', body } = options;

  try {
    const response = await fetch(`${XERO_API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'xero-tenant-id': tenantId,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Xero API error (${response.status}):`, errorText);

      // Parse Xero error response if possible
      try {
        const errorJson = JSON.parse(errorText);
        const errorMessage =
          errorJson.Message ||
          errorJson.message ||
          errorJson.Elements?.[0]?.ValidationErrors?.[0]?.Message ||
          `HTTP ${response.status}`;
        return { success: false, error: errorMessage };
      } catch {
        return { success: false, error: `HTTP ${response.status}: ${errorText.slice(0, 200)}` };
      }
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Xero request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Xero API Client Class
 */
export class XeroClient {
  private tenantId: string;
  private accessToken: string;

  constructor(tenantId: string, accessToken: string) {
    this.tenantId = tenantId;
    this.accessToken = accessToken;
  }

  /**
   * Create an authenticated client instance
   */
  static async create(): Promise<XeroClient | null> {
    const tokens = await getValidTokens();
    if (!tokens) {
      console.error('No valid Xero tokens available');
      return null;
    }
    return new XeroClient(tokens.tenantId, tokens.tokenSet.access_token);
  }

  /**
   * Find a contact by name or email
   */
  async findContact(searchTerm: string): Promise<XeroContact | null> {
    const result = await xeroRequest<{ Contacts: XeroContact[] }>(
      `/Contacts?where=Name.Contains("${encodeURIComponent(searchTerm)}") OR EmailAddress="${encodeURIComponent(searchTerm)}"`,
      this.tenantId,
      this.accessToken
    );

    if (result.success && result.data?.Contacts?.length) {
      return result.data.Contacts[0];
    }
    return null;
  }

  /**
   * Create a new contact
   */
  async createContact(contact: XeroContact): Promise<SyncResult> {
    const result = await xeroRequest<{ Contacts: XeroContact[] }>(
      '/Contacts',
      this.tenantId,
      this.accessToken,
      {
        method: 'POST',
        body: { Contacts: [contact] },
      }
    );

    if (result.success && result.data?.Contacts?.[0]?.ContactID) {
      return { success: true, xeroId: result.data.Contacts[0].ContactID };
    }
    return { success: false, error: result.error || 'Failed to create contact' };
  }

  /**
   * Get or create a contact
   */
  async getOrCreateContact(contact: XeroContact): Promise<SyncResult> {
    // Try to find existing contact by name first
    const existing = await this.findContact(contact.Name);
    if (existing?.ContactID) {
      return { success: true, xeroId: existing.ContactID };
    }

    // Create new contact
    return this.createContact(contact);
  }

  /**
   * Find invoice by reference (Invoice Ninja invoice number)
   */
  async findInvoiceByReference(reference: string): Promise<XeroInvoice | null> {
    const result = await xeroRequest<{ Invoices: XeroInvoice[] }>(
      `/Invoices?where=Reference="${encodeURIComponent(reference)}"`,
      this.tenantId,
      this.accessToken
    );

    if (result.success && result.data?.Invoices?.length) {
      return result.data.Invoices[0];
    }
    return null;
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: XeroInvoice): Promise<SyncResult> {
    const result = await xeroRequest<{ Invoices: XeroInvoice[] }>(
      '/Invoices',
      this.tenantId,
      this.accessToken,
      {
        method: 'POST',
        body: { Invoices: [invoice] },
      }
    );

    if (result.success && result.data?.Invoices?.[0]?.InvoiceID) {
      return { success: true, xeroId: result.data.Invoices[0].InvoiceID };
    }
    return { success: false, error: result.error || 'Failed to create invoice' };
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(invoiceId: string, invoice: Partial<XeroInvoice>): Promise<SyncResult> {
    const result = await xeroRequest<{ Invoices: XeroInvoice[] }>(
      `/Invoices/${invoiceId}`,
      this.tenantId,
      this.accessToken,
      {
        method: 'POST',
        body: { Invoices: [{ ...invoice, InvoiceID: invoiceId }] },
      }
    );

    if (result.success) {
      return { success: true, xeroId: invoiceId };
    }
    return { success: false, error: result.error || 'Failed to update invoice' };
  }

  /**
   * Void an invoice in Xero
   */
  async voidInvoice(invoiceId: string): Promise<SyncResult> {
    const result = await xeroRequest<{ Invoices: XeroInvoice[] }>(
      `/Invoices/${invoiceId}`,
      this.tenantId,
      this.accessToken,
      {
        method: 'POST',
        body: { Invoices: [{ InvoiceID: invoiceId, Status: 'VOIDED' }] },
      }
    );

    if (result.success) {
      return { success: true, xeroId: invoiceId };
    }
    return { success: false, error: result.error || 'Failed to void invoice' };
  }

  /**
   * Create a payment against an invoice
   */
  async createPayment(payment: XeroPayment): Promise<SyncResult> {
    const result = await xeroRequest<{ Payments: XeroPayment[] }>(
      '/Payments',
      this.tenantId,
      this.accessToken,
      {
        method: 'PUT',
        body: { Payments: [payment] },
      }
    );

    if (result.success && result.data?.Payments?.[0]?.PaymentID) {
      return { success: true, xeroId: result.data.Payments[0].PaymentID };
    }
    return { success: false, error: result.error || 'Failed to create payment' };
  }

  /**
   * Get organization details (for testing connection)
   */
  async getOrganisation(): Promise<{ success: boolean; name?: string; error?: string }> {
    const result = await xeroRequest<{ Organisations: Array<{ Name: string }> }>(
      '/Organisation',
      this.tenantId,
      this.accessToken
    );

    if (result.success && result.data?.Organisations?.[0]) {
      return { success: true, name: result.data.Organisations[0].Name };
    }
    return { success: false, error: result.error || 'Failed to get organization' };
  }

  /**
   * Get all accounts (for finding payment account codes)
   */
  async getAccounts(): Promise<Array<{ Code: string; Name: string; Type: string }>> {
    const result = await xeroRequest<{
      Accounts: Array<{ Code: string; Name: string; Type: string }>;
    }>('/Accounts', this.tenantId, this.accessToken);

    if (result.success && result.data?.Accounts) {
      return result.data.Accounts;
    }
    return [];
  }
}

/**
 * Check if Xero is connected and tokens are valid
 */
export async function isXeroConnected(): Promise<boolean> {
  const tokens = await getValidTokens();
  return tokens !== null;
}

/**
 * Test the Xero connection
 */
export async function testXeroConnection(): Promise<{
  connected: boolean;
  organizationName?: string;
  error?: string;
}> {
  const client = await XeroClient.create();
  if (!client) {
    return { connected: false, error: 'No valid tokens' };
  }

  const result = await client.getOrganisation();
  if (result.success) {
    return { connected: true, organizationName: result.name };
  }
  return { connected: false, error: result.error };
}
