/**
 * Xero Integration Type Definitions
 *
 * TypeScript types for Xero API integration including OAuth tokens,
 * sync records, and configuration.
 */

// OAuth Token Types
export interface XeroTokenSet {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp
  token_type: string;
  scope: string;
}

export interface XeroTenant {
  id: string;
  tenantId: string;
  tenantType: string;
  tenantName: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}

export interface XeroTokenRecord {
  id: string;
  tenant_id: string;
  tenant_name: string | null;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Sync Types
export type SyncEntityType = 'invoice' | 'payment' | 'client';
export type SyncStatus = 'pending' | 'synced' | 'failed' | 'skipped';

export interface XeroSyncRecord {
  id: string;
  entity_type: SyncEntityType;
  ninja_id: string;
  xero_id: string | null;
  status: SyncStatus;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  synced_at: string | null;
}

export interface SyncResult {
  success: boolean;
  xeroId?: string;
  error?: string;
}

// Xero API Types (simplified for our use case)
export interface XeroContact {
  ContactID?: string;
  Name: string;
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  Phones?: Array<{
    PhoneType: string;
    PhoneNumber: string;
  }>;
  IsCustomer?: boolean;
}

export interface XeroLineItem {
  Description: string;
  Quantity: number;
  UnitAmount: number;
  AccountCode?: string;
  TaxType?: string;
}

export interface XeroInvoice {
  InvoiceID?: string;
  Type: 'ACCREC' | 'ACCPAY'; // ACCREC = Accounts Receivable (Sales)
  Contact: XeroContact;
  Date: string; // YYYY-MM-DD
  DueDate: string;
  LineItems: XeroLineItem[];
  Reference?: string;
  Status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  InvoiceNumber?: string;
  CurrencyCode?: string;
}

export interface XeroPayment {
  PaymentID?: string;
  Invoice: { InvoiceID: string };
  Account: { Code: string };
  Date: string;
  Amount: number;
  Reference?: string;
}

// Configuration Types
export interface XeroSyncConfig {
  defaultAccountCode: string;
  defaultTaxType: string;
  paymentAccountCode: string;
  autoSyncEnabled: boolean;
  lastReconciliationAt: string | null;
}

// Invoice Ninja to Xero Mapping
export interface InvoiceNinjaInvoice {
  id: string;
  number: string;
  client_id: string;
  amount: number;
  balance: number;
  status_id: string;
  date: string;
  due_date: string;
  line_items?: Array<{
    product_key?: string;
    notes?: string;
    cost: number;
    quantity: number;
  }>;
  client?: {
    id: string;
    name: string;
    display_name?: string;
    contacts?: Array<{
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    }>;
  };
}

export interface InvoiceNinjaPayment {
  id: string;
  number: string;
  client_id: string;
  amount: number;
  date: string;
  transaction_reference?: string;
  currency_id?: string; // "1" = USD, "2" = CAD (Invoice Ninja currency IDs)
  invoices?: Array<{
    invoice_id: string;
    amount: number;
  }>;
}

export interface InvoiceNinjaClient {
  id: string;
  name: string;
  display_name?: string;
  contacts?: Array<{
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }>;
}
