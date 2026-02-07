/**
 * Supabase Client Configuration
 *
 * Provides singleton Supabase client for server-side operations.
 * Used by API endpoints and SSR pages to fetch product data.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Environment variables (set in .env and Vercel dashboard)
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}
if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Type definitions for database tables
export interface Category {
  id: number;
  legacy_id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DosageForm {
  id: number;
  legacy_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  short_description: string | null;
  meta_description: string | null;
  image: string | null;
  image_alt: string | null;
  best_for: string[] | null;
  benefits: string[] | null;
  considerations: string[] | null;
  specs: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  slug: string;
  aliases: string[] | null;
  benefits: string[] | null;
  typical_dosage: string | null;
  regulatory_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  legacy_id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: number | null;
  dosage_form_id: number | null;
  description: string | null;
  serving_size: string | null;
  servings_per_container: number | null;
  key_ingredients: string[] | null;
  other_ingredients: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductIngredient {
  id: number;
  product_id: number;
  ingredient_id: number | null;
  ingredient_name: string;
  amount: string | null;
  unit: string | null;
  daily_value: string | null;
  source_note: string | null;
  display_order: number;
  created_at: string;
}

export interface ChatSession {
  id: string;
  visitor_id: string | null;
  started_at: string;
  last_message_at: string | null;
  lead_captured: boolean;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  lead_company: string | null;
  project_notes: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  product_ids: number[] | null;
  created_at: string;
}

export interface QuoteDocument {
  id: string;
  crm_product_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      dosage_forms: {
        Row: DosageForm;
        Insert: Omit<DosageForm, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DosageForm, 'id'>>;
      };
      ingredients: {
        Row: Ingredient;
        Insert: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Ingredient, 'id'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id'>>;
      };
      product_ingredients: {
        Row: ProductIngredient;
        Insert: Omit<ProductIngredient, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductIngredient, 'id'>>;
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: Omit<ChatSession, 'id' | 'created_at' | 'started_at'>;
        Update: Partial<Omit<ChatSession, 'id'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatMessage, 'id'>>;
      };
      quote_documents: {
        Row: QuoteDocument;
        Insert: Omit<QuoteDocument, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<QuoteDocument, 'id'>>;
      };
    };
  };
}

// Singleton client instances
let anonClient: SupabaseClient<Database> | null = null;
let serviceClient: SupabaseClient<Database> | null = null;

/**
 * Get the anonymous Supabase client (for public read operations)
 * Uses RLS policies to restrict access
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!anonClient) {
    anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return anonClient;
}

/**
 * Get the service role Supabase client (for admin operations)
 * Bypasses RLS - use only on server side
 * Service key is read lazily inside this function to avoid module-level exposure
 */
export function getSupabaseServiceClient(): SupabaseClient<Database> {
  if (!serviceClient) {
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;
    if (!supabaseServiceKey) {
      throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
    }

    serviceClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serviceClient;
}

// Default export for convenience
export const supabase = getSupabaseClient;
