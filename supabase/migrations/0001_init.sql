-- Migration 0001: Init tables
-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table agence_settings (configuration globale du site)
CREATE TABLE IF NOT EXISTS agence_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insérer les settings par défaut
INSERT INTO agence_settings (key, value) VALUES
  ('site_title', '"JuraBreak Immobilier"'::jsonb),
  ('contact_email', '"contact@jurabreak.fr"'::jsonb),
  ('contact_phone', '"06 XX XX XX XX"'::jsonb),
  ('about_photo_url', 'null'::jsonb),
  ('about_biography', '""'::jsonb),
  ('footer_text', '""'::jsonb),
  ('honoraires', '{}'::jsonb),
  ('home_hero_title', '"Bienvenue chez JuraBreak Immobilier"'::jsonb),
  ('home_hero_subtitle', '"Votre agence immobilière de confiance dans le Jura"'::jsonb),
  ('home_services', '[{"title": "Achat & Vente", "description": "Accompagnement personnalisé pour tous vos projets immobiliers"}, {"title": "Estimation Gratuite", "description": "Obtenez une estimation de votre bien en quelques clics"}, {"title": "Expertise Locale", "description": "Une connaissance approfondie du marché jurassien"}]'::jsonb),
  ('home_about_text', '"JuraBreak Immobilier est votre partenaire de confiance pour tous vos projets immobiliers dans le Jura."'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Table annonces
CREATE TABLE IF NOT EXISTS annonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  description TEXT,
  type_bien TEXT NOT NULL CHECK (type_bien IN ('maison', 'appartement', 'terrain', 'local_commercial', 'autre')),
  prix DECIMAL(12,2) NOT NULL,
  surface DECIMAL(10,2),
  nb_pieces INTEGER,
  nb_chambres INTEGER,
  ville TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  adresse TEXT,
  statut TEXT NOT NULL DEFAULT 'EN_VENTE' CHECK (statut IN ('EN_VENTE', 'SOUS_OFFRE', 'COMPROMIS', 'VENDU', 'RETIRE')),
  commission_type TEXT CHECK (commission_type IN ('pourcentage', 'fixe')),
  commission_value DECIMAL(10,2),
  published_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_annonces_slug ON annonces(slug);
CREATE INDEX idx_annonces_statut ON annonces(statut) WHERE is_deleted = false;
CREATE INDEX idx_annonces_published ON annonces(published_at) WHERE is_deleted = false AND published_at IS NOT NULL;

-- Table annonce_photos
CREATE TABLE IF NOT EXISTS annonce_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annonce_id UUID NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0 AND position <= 7),
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(annonce_id, position)
);

-- Index pour récupérer les photos d'une annonce
CREATE INDEX idx_annonce_photos_annonce_id ON annonce_photos(annonce_id);

-- Table events (événements)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  description TEXT,
  date_event TIMESTAMPTZ NOT NULL,
  lieu TEXT,
  photo_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table leads (demandes de contact / visite)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  message TEXT,
  annonce_id UUID REFERENCES annonces(id) ON DELETE SET NULL,
  type_demande TEXT NOT NULL DEFAULT 'contact' CHECK (type_demande IN ('contact', 'visite', 'information')),
  statut TEXT NOT NULL DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'traite', 'archive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour gérer les leads
CREATE INDEX idx_leads_statut ON leads(statut);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Table analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour analytics
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Table estimations
CREATE TABLE IF NOT EXISTS estimations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formule TEXT NOT NULL CHECK (formule IN ('formule_0', 'formule_1', 'formule_2')),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  adresse_bien TEXT NOT NULL,
  type_bien TEXT NOT NULL,
  surface DECIMAL(10,2),
  nb_pieces INTEGER,
  annee_construction INTEGER,
  etat_general TEXT,
  travaux TEXT,
  environnement TEXT,
  statut TEXT NOT NULL DEFAULT 'DRAFT' CHECK (statut IN ('DRAFT', 'PAID', 'COMPLETED', 'CANCELLED')),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  prix_paye DECIMAL(10,2),
  pdf_path TEXT,
  estimation_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour estimations
CREATE INDEX idx_estimations_statut ON estimations(statut);
CREATE INDEX idx_estimations_email ON estimations(email);
CREATE INDEX idx_estimations_stripe_payment_intent ON estimations(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
