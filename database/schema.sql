-- ====================================================================
-- ActeSimple — Schema Bazei de Date Relaționale (PostgreSQL)
-- Compatibil cu Supabase, Neon și PostgreSQL pe Vercel
-- Include constrângeri, chei străine, indexuri și politici RLS
-- ====================================================================

-- Activare extensie UUID dacă este necesar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL: CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Layers',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL: PROCEDURES
CREATE TABLE IF NOT EXISTS procedures (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    full_description TEXT,
    competent_authority VARCHAR(255) NOT NULL,
    authority_city_note TEXT,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'usor' CHECK (difficulty IN ('usor', 'mediu', 'complex')),
    estimated_time VARCHAR(100) NOT NULL DEFAULT '3 - 7 zile lucrătoare',
    total_fee VARCHAR(100) NOT NULL DEFAULT 'Gratuit',
    is_online_available BOOLEAN NOT NULL DEFAULT FALSE,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'needs_review')),
    last_verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'needs_review', 'unverified')),
    verified_by VARCHAR(150),
    verification_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABEL: DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(100) PRIMARY KEY,
    procedure_id VARCHAR(100) NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(30) NOT NULL DEFAULT 'original' CHECK (document_type IN ('original', 'copie', 'legalizat', 'formular', 'dovada_plata')),
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    where_to_get TEXT,
    download_url TEXT,
    download_label VARCHAR(150),
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL: STEPS
CREATE TABLE IF NOT EXISTS steps (
    id VARCHAR(100) PRIMARY KEY,
    procedure_id VARCHAR(100) NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location_or_tool VARCHAR(255),
    tip TEXT,
    external_url TEXT,
    external_label VARCHAR(150),
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL: SOURCES
CREATE TABLE IF NOT EXISTS sources (
    id VARCHAR(100) PRIMARY KEY,
    procedure_id VARCHAR(100) NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    last_verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    verified_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL: PROCEDURE_KEYWORDS & SYNONYMS
CREATE TABLE IF NOT EXISTS procedure_keywords (
    id SERIAL PRIMARY KEY,
    procedure_id VARCHAR(100) NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    is_synonym BOOLEAN DEFAULT FALSE
);

-- 7. TABEL: AUDIT_LOGS (Securitate & Trasabilitate modificări)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    user_identity VARCHAR(150) NOT NULL,
    details TEXT
);

-- ====================================================================
-- INDEXURI PENTRU PERFORMANȚĂ & CĂUTARE RAPIDĂ
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_procedures_category ON procedures(category_id);
CREATE INDEX IF NOT EXISTS idx_procedures_status ON procedures(status);
CREATE INDEX IF NOT EXISTS idx_procedures_slug ON procedures(slug);
CREATE INDEX IF NOT EXISTS idx_procedures_verified ON procedures(last_verified_at);
CREATE INDEX IF NOT EXISTS idx_documents_procedure ON documents(procedure_id);
CREATE INDEX IF NOT EXISTS idx_steps_procedure ON steps(procedure_id);
CREATE INDEX IF NOT EXISTS idx_sources_procedure ON sources(procedure_id);
CREATE INDEX IF NOT EXISTS idx_keywords_procedure ON procedure_keywords(procedure_id);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON procedure_keywords(keyword);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) - Pentru Supabase
-- ====================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Permite citirea publică a datelor publicate (read-only anonym)
CREATE POLICY IF NOT EXISTS "Allow public read-only on categories"
ON categories FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read-only on published procedures"
ON procedures FOR SELECT USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Allow public read-only on documents"
ON documents FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read-only on steps"
ON steps FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read-only on sources"
ON sources FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read-only on keywords"
ON procedure_keywords FOR SELECT USING (true);
