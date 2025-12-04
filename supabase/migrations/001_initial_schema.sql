-- Nutricraft Labs Database Schema
-- Phase 1: Product Catalog Foundation
-- Run this in Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS vector;        -- pgvector for AI embeddings

-- ============================================
-- CORE LOOKUP TABLES
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  legacy_id TEXT UNIQUE NOT NULL,  -- Maps to old JS id like 'sleep-relaxation'
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dosage Forms
CREATE TABLE IF NOT EXISTS dosage_forms (
  id SERIAL PRIMARY KEY,
  legacy_id TEXT UNIQUE NOT NULL,  -- Maps to old JS id like 'tablets'
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  short_description TEXT,
  meta_description TEXT,
  image TEXT,
  image_alt TEXT,
  best_for TEXT[],
  benefits TEXT[],
  considerations TEXT[],
  specs JSONB,              -- manufacturingDetails, technicalSpecs, targetDemographics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredients Master List (for linking and search)
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  typical_dosage TEXT,
  regulatory_notes TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT CATALOG
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  legacy_id TEXT UNIQUE NOT NULL,     -- Maps to old JS id like 'calm-focus-blend'
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id INT REFERENCES categories(id),
  dosage_form_id INT REFERENCES dosage_forms(id),
  description TEXT,
  serving_size TEXT,
  servings_per_container INT,
  key_ingredients TEXT[],             -- Quick display list
  other_ingredients TEXT,
  is_active BOOLEAN DEFAULT true,
  search_vector TSVECTOR,             -- Full-text search (populated by trigger)
  embedding VECTOR(1536),              -- AI semantic search (Phase 3)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Ingredients Junction Table
CREATE TABLE IF NOT EXISTS product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id INT REFERENCES ingredients(id),  -- Optional link to master ingredient
  ingredient_name TEXT NOT NULL,                  -- Denormalized for display
  amount TEXT,
  unit TEXT,
  daily_value TEXT,
  source_note TEXT,                              -- e.g., "(as Magnesium Citrate)"
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT & LEAD CAPTURE (Phase 3 - Create now for schema completeness)
-- ============================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT,                    -- Anonymous tracking cookie
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  lead_captured BOOLEAN DEFAULT false,
  lead_name TEXT,
  lead_email TEXT,
  lead_phone TEXT,
  lead_company TEXT,
  project_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  product_ids INT[],                  -- Products referenced in response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Product lookups
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_dosage_form ON products(dosage_form_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Full-text search indexes (GIN for tsvector)
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_ingredients_search ON ingredients USING GIN(search_vector);

-- Trigram indexes for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ingredients_name_trgm ON ingredients USING GIN(name gin_trgm_ops);

-- Product ingredients lookup
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product ON product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient ON product_ingredients(ingredient_id);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- Vector index for semantic search (Phase 3 - created but empty until embeddings added)
-- Note: ivfflat requires at least 1 row to build, so we create after data migration
-- CREATE INDEX idx_products_embedding ON products USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- TRIGGERS FOR SEARCH VECTORS
-- ============================================

-- Update product search vector on insert/update
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.key_ingredients, ' '), '')), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_products_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- Update ingredient search vector on insert/update
CREATE OR REPLACE FUNCTION update_ingredient_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.aliases, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.benefits, ' '), '')), 'C');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_ingredients_search_vector
  BEFORE INSERT OR UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_ingredient_search_vector();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosage_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog data (anon role)
CREATE POLICY "Allow public read on categories"
  ON categories FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read on dosage_forms"
  ON dosage_forms FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read on ingredients"
  ON ingredients FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read on active products"
  ON products FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Allow public read on product_ingredients"
  ON product_ingredients FOR SELECT TO anon, authenticated USING (true);

-- Chat: Public can create and read own sessions
CREATE POLICY "Allow public to create chat sessions"
  ON chat_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public to read own chat sessions"
  ON chat_sessions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public to update own chat sessions"
  ON chat_sessions FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow public to create chat messages"
  ON chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public to read chat messages"
  ON chat_messages FOR SELECT TO anon, authenticated USING (true);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access categories"
  ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access dosage_forms"
  ON dosage_forms FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access ingredients"
  ON ingredients FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access products"
  ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access product_ingredients"
  ON product_ingredients FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access chat_sessions"
  ON chat_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access chat_messages"
  ON chat_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS FOR SEARCH
-- ============================================

-- Full-text search with ranking
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  dosage_form_filter TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20
)
RETURNS TABLE(
  id INT,
  sku TEXT,
  name TEXT,
  slug TEXT,
  description TEXT,
  category_name TEXT,
  dosage_form_name TEXT,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.sku,
    p.name,
    p.slug,
    p.description,
    c.name AS category_name,
    df.name AS dosage_form_name,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN dosage_forms df ON p.dosage_form_id = df.id
  WHERE
    p.is_active = true
    AND (search_query IS NULL OR search_query = '' OR p.search_vector @@ plainto_tsquery('english', search_query))
    AND (category_filter IS NULL OR c.slug = category_filter)
    AND (dosage_form_filter IS NULL OR df.slug = dosage_form_filter)
  ORDER BY rank DESC, p.name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Fuzzy search for autocomplete (uses trigram similarity)
CREATE OR REPLACE FUNCTION autocomplete_products(
  search_term TEXT,
  limit_count INT DEFAULT 10
)
RETURNS TABLE(
  id INT,
  name TEXT,
  slug TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    similarity(p.name, search_term) AS similarity
  FROM products p
  WHERE
    p.is_active = true
    AND (p.name % search_term OR p.name ILIKE search_term || '%')
  ORDER BY similarity DESC, p.name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get products by category with ingredients
CREATE OR REPLACE FUNCTION get_products_by_category(category_slug TEXT)
RETURNS TABLE(
  id INT,
  sku TEXT,
  name TEXT,
  slug TEXT,
  description TEXT,
  serving_size TEXT,
  servings_per_container INT,
  key_ingredients TEXT[],
  other_ingredients TEXT,
  dosage_form_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.sku,
    p.name,
    p.slug,
    p.description,
    p.serving_size,
    p.servings_per_container,
    p.key_ingredients,
    p.other_ingredients,
    df.name AS dosage_form_name
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN dosage_forms df ON p.dosage_form_id = df.id
  WHERE p.is_active = true AND c.slug = category_slug
  ORDER BY p.name ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE categories IS 'Product categories like Sleep & Relaxation, Energy & Performance';
COMMENT ON TABLE dosage_forms IS 'Supplement formats: tablets, capsules, gummies, powders, etc.';
COMMENT ON TABLE ingredients IS 'Master list of supplement ingredients with search aliases';
COMMENT ON TABLE products IS 'Main product catalog with 200+ stock formulations';
COMMENT ON TABLE product_ingredients IS 'Ingredients in each product with amounts and daily values';
COMMENT ON TABLE chat_sessions IS 'AI chatbot conversation sessions for lead capture';
COMMENT ON TABLE chat_messages IS 'Individual messages in chatbot conversations';

COMMENT ON COLUMN products.legacy_id IS 'Maps to original JS data id for migration compatibility';
COMMENT ON COLUMN products.search_vector IS 'Auto-populated tsvector for full-text search';
COMMENT ON COLUMN products.embedding IS 'Vector embedding for AI semantic search (Phase 3)';
