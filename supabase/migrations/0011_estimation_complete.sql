-- Migration 0011: Module d'estimation complet selon docs/estimation.md
-- =====================================================================

-- =====================================================================
-- 1. TABLE COMMUNES & ZONES
-- =====================================================================

CREATE TABLE IF NOT EXISTS estimation_communes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL UNIQUE,
  code_postal TEXT NOT NULL,
  zone_id UUID,
  prix_m2_reference DECIMAL(10,2),
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estimation_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  prix_m2_reference DECIMAL(10,2),
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ajouter la contrainte de clé étrangère (idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_commune_zone' 
    AND conrelid = 'estimation_communes'::regclass
  ) THEN
    ALTER TABLE estimation_communes
    ADD CONSTRAINT fk_commune_zone 
    FOREIGN KEY (zone_id) REFERENCES estimation_zones(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_communes_zone ON estimation_communes(zone_id);
CREATE INDEX IF NOT EXISTS idx_communes_actif ON estimation_communes(actif);

-- =====================================================================
-- 2. TABLE COEFFICIENTS
-- =====================================================================

CREATE TABLE IF NOT EXISTS estimation_coefficients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categorie TEXT NOT NULL CHECK (categorie IN ('etat_bien', 'type_bien', 'localisation')),
  code TEXT NOT NULL,
  libelle TEXT NOT NULL,
  coefficient DECIMAL(5,3) NOT NULL DEFAULT 1.000,
  actif BOOLEAN NOT NULL DEFAULT true,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(categorie, code)
);

CREATE INDEX IF NOT EXISTS idx_coefficients_categorie ON estimation_coefficients(categorie);
CREATE INDEX IF NOT EXISTS idx_coefficients_actif ON estimation_coefficients(actif);

-- =====================================================================
-- 3. TABLE OPTIONS / PLUS-VALUES
-- =====================================================================

CREATE TABLE IF NOT EXISTS estimation_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  libelle TEXT NOT NULL,
  type_valeur TEXT NOT NULL CHECK (type_valeur IN ('fixe', 'pourcentage')),
  valeur DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  actif BOOLEAN NOT NULL DEFAULT true,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_options_actif ON estimation_options(actif);

-- =====================================================================
-- 4. TABLE MARGES FOURCHETTE (par niveau de fiabilité)
-- =====================================================================

CREATE TABLE IF NOT EXISTS estimation_marges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niveau_fiabilite TEXT NOT NULL UNIQUE CHECK (niveau_fiabilite IN ('minimal', 'complet', 'tres_complet')),
  marge_basse DECIMAL(5,3) NOT NULL, -- ex: 0.200 pour -20%
  marge_haute DECIMAL(5,3) NOT NULL, -- ex: 0.200 pour +20%
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 5. TABLE MENTIONS LÉGALES (versionnées par motif)
-- =====================================================================

CREATE TABLE IF NOT EXISTS estimation_mentions_legales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  motif TEXT NOT NULL CHECK (motif IN ('curiosite', 'vente', 'divorce', 'succession', 'notaire', 'autre')),
  version INTEGER NOT NULL DEFAULT 1,
  texte_court TEXT NOT NULL,
  texte_long TEXT NOT NULL,
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  UNIQUE(motif, version)
);

CREATE INDEX IF NOT EXISTS idx_mentions_motif ON estimation_mentions_legales(motif);
CREATE INDEX IF NOT EXISTS idx_mentions_actif ON estimation_mentions_legales(actif);

-- =====================================================================
-- 6. TABLE VERSION RÈGLES (versioning des paramètres)
-- =====================================================================

CREATE TABLE IF NOT EXISTS estimation_versions_regles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_number INTEGER NOT NULL UNIQUE,
  description TEXT,
  snapshot JSONB NOT NULL, -- Snapshot complet de tous les paramètres
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_versions_created_at ON estimation_versions_regles(created_at DESC);

-- =====================================================================
-- 7. REFONTE TABLE ESTIMATIONS (selon spécifications)
-- =====================================================================

-- Renommer l'ancienne table en estimations_legacy
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estimations') THEN
    ALTER TABLE estimations RENAME TO estimations_legacy;
  END IF;
END $$;

CREATE TABLE estimations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Compte utilisateur (obligatoire)
  user_id UUID,
  
  -- Informations client
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  
  -- Étape 2: Motif (obligatoire)
  motif TEXT NOT NULL CHECK (motif IN ('curiosite', 'vente', 'divorce', 'succession', 'notaire', 'autre')),
  motif_autre_detail TEXT, -- Si motif = 'autre'
  
  -- Étape 3: Données du bien
  type_bien TEXT NOT NULL CHECK (type_bien IN ('maison', 'appartement', 'autre')),
  surface_habitable DECIMAL(10,2) NOT NULL,
  surface_terrain DECIMAL(10,2),
  commune_id UUID REFERENCES estimation_communes(id),
  commune_nom TEXT NOT NULL, -- Dénormalisé pour historique
  code_postal TEXT NOT NULL,
  annee_construction INTEGER,
  etat_bien TEXT NOT NULL CHECK (etat_bien IN ('a_renover', 'correct', 'bon', 'tres_bon')),
  
  -- Étape 4: Options / Plus-values (JSON array des codes)
  options_selectionnees JSONB DEFAULT '[]'::jsonb,
  
  -- Étape 5: Consentement légal
  consentement_accepte BOOLEAN NOT NULL DEFAULT false,
  consentement_ip TEXT,
  consentement_at TIMESTAMPTZ,
  
  -- Étape 6: Paiement (si formule payante)
  formule TEXT CHECK (formule IN ('gratuite', 'standard', 'premium')),
  prix_paye DECIMAL(10,2),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  statut_paiement TEXT NOT NULL DEFAULT 'PENDING' CHECK (statut_paiement IN ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED')),
  paiement_at TIMESTAMPTZ,
  
  -- Calcul & Résultat
  version_regles_id UUID REFERENCES estimation_versions_regles(id),
  calcul_inputs JSONB, -- Sauvegarde complète des inputs
  calcul_detail JSONB, -- Détail du calcul (coefficients, options appliquées)
  valeur_basse DECIMAL(12,2),
  valeur_mediane DECIMAL(12,2),
  valeur_haute DECIMAL(12,2),
  niveau_fiabilite TEXT CHECK (niveau_fiabilite IN ('minimal', 'complet', 'tres_complet')),
  calcule_at TIMESTAMPTZ,
  
  -- PDF
  pdf_path TEXT,
  pdf_generated_at TIMESTAMPTZ,
  download_token TEXT UNIQUE,
  
  -- Statut global
  statut TEXT NOT NULL DEFAULT 'DRAFT' CHECK (statut IN ('DRAFT', 'CALCULATED', 'PAID', 'COMPLETED', 'CANCELLED')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index (idempotents)
CREATE INDEX IF NOT EXISTS idx_estimations_user_id ON estimations(user_id);
CREATE INDEX IF NOT EXISTS idx_estimations_email ON estimations(email);
CREATE INDEX IF NOT EXISTS idx_estimations_statut ON estimations(statut);
CREATE INDEX IF NOT EXISTS idx_estimations_motif ON estimations(motif);
CREATE INDEX IF NOT EXISTS idx_estimations_commune ON estimations(commune_id);
CREATE INDEX IF NOT EXISTS idx_estimations_version_regles ON estimations(version_regles_id);
CREATE INDEX IF NOT EXISTS idx_estimations_created_at ON estimations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimations_download_token ON estimations(download_token) WHERE download_token IS NOT NULL;

-- =====================================================================
-- 8. TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION update_estimation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les triggers existants avant de les créer (idempotent)
DROP TRIGGER IF EXISTS set_estimations_updated_at ON estimations;
CREATE TRIGGER set_estimations_updated_at
  BEFORE UPDATE ON estimations
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

DROP TRIGGER IF EXISTS set_communes_updated_at ON estimation_communes;
CREATE TRIGGER set_communes_updated_at
  BEFORE UPDATE ON estimation_communes
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

DROP TRIGGER IF EXISTS set_zones_updated_at ON estimation_zones;
CREATE TRIGGER set_zones_updated_at
  BEFORE UPDATE ON estimation_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

DROP TRIGGER IF EXISTS set_coefficients_updated_at ON estimation_coefficients;
CREATE TRIGGER set_coefficients_updated_at
  BEFORE UPDATE ON estimation_coefficients
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

DROP TRIGGER IF EXISTS set_options_updated_at ON estimation_options;
CREATE TRIGGER set_options_updated_at
  BEFORE UPDATE ON estimation_options
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

DROP TRIGGER IF EXISTS set_marges_updated_at ON estimation_marges;
CREATE TRIGGER set_marges_updated_at
  BEFORE UPDATE ON estimation_marges
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

DROP TRIGGER IF EXISTS set_mentions_updated_at ON estimation_mentions_legales;
CREATE TRIGGER set_mentions_updated_at
  BEFORE UPDATE ON estimation_mentions_legales
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

-- =====================================================================
-- 9. DONNÉES INITIALES
-- =====================================================================

-- Zones géographiques du Jura
INSERT INTO estimation_zones (nom, description, prix_m2_reference) VALUES
  ('Zone A - Dole et périphérie', 'Ville principale, forte demande', 2400.00),
  ('Zone B - Lons-le-Saunier', 'Préfecture, marché stable', 2200.00),
  ('Zone C - Villages attractifs', 'Cadre de vie recherché', 2000.00),
  ('Zone D - Secteurs ruraux', 'Campagne, prix modérés', 1600.00)
ON CONFLICT DO NOTHING;

-- Coefficients état du bien
INSERT INTO estimation_coefficients (categorie, code, libelle, coefficient, ordre) VALUES
  ('etat_bien', 'a_renover', 'À rénover', 0.750, 1),
  ('etat_bien', 'correct', 'Correct', 0.950, 2),
  ('etat_bien', 'bon', 'Bon', 1.000, 3),
  ('etat_bien', 'tres_bon', 'Très bon / Récent', 1.150, 4)
ON CONFLICT (categorie, code) DO NOTHING;

-- Coefficients type de bien
INSERT INTO estimation_coefficients (categorie, code, libelle, coefficient, ordre) VALUES
  ('type_bien', 'maison', 'Maison', 1.000, 1),
  ('type_bien', 'appartement', 'Appartement', 0.950, 2),
  ('type_bien', 'autre', 'Autre', 0.900, 3)
ON CONFLICT (categorie, code) DO NOTHING;

-- Options / Plus-values
INSERT INTO estimation_options (code, libelle, type_valeur, valeur, ordre) VALUES
  ('garage', 'Garage', 'fixe', 15000.00, 1),
  ('piscine', 'Piscine', 'fixe', 30000.00, 2),
  ('terrasse', 'Terrasse / Balcon', 'fixe', 5000.00, 3),
  ('dependance', 'Dépendance', 'fixe', 20000.00, 4),
  ('vue', 'Vue exceptionnelle', 'pourcentage', 10.00, 5),
  ('sous_sol', 'Sous-sol', 'fixe', 10000.00, 6),
  ('travaux_recents', 'Travaux récents', 'pourcentage', 5.00, 7)
ON CONFLICT (code) DO NOTHING;

-- Marges de fourchette
INSERT INTO estimation_marges (niveau_fiabilite, marge_basse, marge_haute, description) VALUES
  ('minimal', 0.200, 0.200, 'Données minimales : ±20%'),
  ('complet', 0.100, 0.100, 'Données complètes : ±10%'),
  ('tres_complet', 0.050, 0.050, 'Données très complètes : ±5%')
ON CONFLICT (niveau_fiabilite) DO NOTHING;

-- Mentions légales par motif (version 1)
INSERT INTO estimation_mentions_legales (motif, version, texte_court, texte_long) VALUES
  ('curiosite', 1, 'Estimation indicative', 'Cette estimation est purement indicative et constitue une aide à la décision. Elle ne remplace pas une expertise professionnelle.'),
  ('vente', 1, 'Estimation indicative - Projet de vente', 'Cette estimation constitue un document préparatoire pour votre projet de vente. Elle ne remplace pas une expertise professionnelle.'),
  ('divorce', 1, 'Estimation indicative - Divorce/Séparation', 'Ce document ne constitue pas une expertise opposable devant une juridiction. Il s''agit d''une estimation indicative qui peut servir de base de discussion.'),
  ('succession', 1, 'Estimation indicative - Succession', 'Ce document ne constitue pas une expertise opposable devant une juridiction. Il s''agit d''une estimation indicative qui peut servir de base de discussion.'),
  ('notaire', 1, 'Estimation indicative - Discussion notariale', 'Cette estimation constitue un document préparatoire pour vos échanges notariaux. Elle ne remplace pas une expertise professionnelle.'),
  ('autre', 1, 'Estimation indicative', 'Cette estimation est purement indicative et constitue une aide à la décision. Elle ne remplace pas une expertise professionnelle.')
ON CONFLICT (motif, version) DO NOTHING;

-- Créer la première version des règles (snapshot JSONB correct)
INSERT INTO estimation_versions_regles (version_number, description, snapshot, created_at)
VALUES (
  1,
  'Version initiale des règles d''estimation',
  jsonb_build_object(
    'created_at', NOW(),
    'description', 'Paramètres initiaux du module d''estimation',
    'zones', '[]'::jsonb,
    'communes', '[]'::jsonb,
    'coefficients', '[]'::jsonb,
    'options', '[]'::jsonb,
    'marges', '[]'::jsonb
  ),
  NOW()
)
ON CONFLICT (version_number) DO NOTHING;

-- =====================================================================
-- 10. STORAGE BUCKET pour PDFs
-- =====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('estimations', 'estimations', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- FIN MIGRATION
-- =====================================================================
