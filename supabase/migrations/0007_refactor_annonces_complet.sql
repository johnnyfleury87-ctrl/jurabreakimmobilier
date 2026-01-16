-- Migration 0007: Refactoring complet table annonces pour système avancé
-- Date: 16 janvier 2026
-- Description: Enrichissement du modèle annonces avec tous les champs requis

-- 1) Supprimer l'ancienne table annonces et ses dépendances
DROP TABLE IF EXISTS annonce_photos CASCADE;
DROP TABLE IF EXISTS annonces CASCADE;

-- 2) Créer la nouvelle table annonces avec tous les champs
CREATE TABLE annonces (
  -- IDENTITÉ
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type_bien TEXT NOT NULL CHECK (type_bien IN ('maison', 'appartement', 'terrain', 'immeuble', 'local_commercial', 'autre')),
  description TEXT,
  points_forts TEXT[], -- Liste des points forts
  
  -- LOCALISATION
  ville TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  secteur TEXT, -- quartier/secteur optionnel
  adresse TEXT, -- masquée par défaut
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- PRIX & FINANCE
  prix DECIMAL(12,2) NOT NULL,
  devise TEXT NOT NULL DEFAULT 'EUR',
  charges DECIMAL(10,2), -- charges mensuelles
  taxe_fonciere DECIMAL(10,2), -- taxe foncière annuelle
  type_transaction TEXT NOT NULL DEFAULT 'VENTE' CHECK (type_transaction IN ('VENTE', 'LOCATION')),
  loyer_hc DECIMAL(10,2), -- loyer hors charges pour location
  
  -- CARACTÉRISTIQUES
  surface_m2 DECIMAL(10,2),
  terrain_m2 DECIMAL(10,2),
  nb_pieces INTEGER,
  nb_chambres INTEGER,
  nb_salles_bain INTEGER,
  nb_salles_eau INTEGER,
  etage INTEGER,
  nb_etages_immeuble INTEGER,
  annee_construction INTEGER,
  
  -- ÉQUIPEMENTS
  chauffage TEXT, -- gaz, électrique, fioul, pompe à chaleur, etc.
  type_chauffage TEXT, -- individuel, collectif
  climatisation BOOLEAN DEFAULT false,
  ascenseur BOOLEAN DEFAULT false,
  balcon BOOLEAN DEFAULT false,
  terrasse BOOLEAN DEFAULT false,
  jardin BOOLEAN DEFAULT false,
  garage BOOLEAN DEFAULT false,
  parking BOOLEAN DEFAULT false,
  cave BOOLEAN DEFAULT false,
  piscine BOOLEAN DEFAULT false,
  
  -- DIAGNOSTICS
  dpe TEXT, -- A, B, C, D, E, F, G
  ges TEXT, -- A, B, C, D, E, F, G
  
  -- MEDIA
  video_url TEXT,
  visite_virtuelle_url TEXT,
  
  -- STATUT & VISIBILITÉ
  statut TEXT NOT NULL DEFAULT 'A_VENDRE' CHECK (statut IN (
    'A_VENDRE',
    'SOUS_COMPROMIS', 
    'VENDU',
    'EN_LOCATION',
    'LOUE',
    'RETIRE'
  )),
  visible BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  
  -- HONORAIRES (calculés automatiquement)
  honoraires_transaction DECIMAL(10,2),
  honoraires_location DECIMAL(10,2),
  honoraires_etat_lieux DECIMAL(10,2),
  
  -- ORDRE & TIMESTAMPS
  ordre_affichage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Index pour performances
CREATE INDEX idx_annonces_slug ON annonces(slug);
CREATE INDEX idx_annonces_statut ON annonces(statut) WHERE is_deleted = false;
CREATE INDEX idx_annonces_type_bien ON annonces(type_bien) WHERE is_deleted = false;
CREATE INDEX idx_annonces_ville ON annonces(ville) WHERE is_deleted = false;
CREATE INDEX idx_annonces_prix ON annonces(prix) WHERE is_deleted = false;
CREATE INDEX idx_annonces_published ON annonces(published_at) WHERE is_deleted = false AND published_at IS NOT NULL;
CREATE INDEX idx_annonces_visible ON annonces(visible) WHERE is_deleted = false;
CREATE INDEX idx_annonces_type_transaction ON annonces(type_transaction) WHERE is_deleted = false;

-- 3) Table photos (avec plus de métadonnées)
CREATE TABLE annonce_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annonce_id UUID NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT, -- chemin dans Supabase Storage
  position INTEGER NOT NULL CHECK (position >= 0),
  alt_text TEXT,
  is_cover BOOLEAN DEFAULT false, -- photo principale
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- en bytes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(annonce_id, position)
);

CREATE INDEX idx_annonce_photos_annonce_id ON annonce_photos(annonce_id);
CREATE INDEX idx_annonce_photos_position ON annonce_photos(annonce_id, position);

-- 4) Trigger pour mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_annonces_updated_at
  BEFORE UPDATE ON annonces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5) Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(titre TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convertir en slug basique
  base_slug := lower(titre);
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Vérifier l'unicité et ajouter un suffixe si nécessaire
  WHILE EXISTS (SELECT 1 FROM annonces WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 6) Données de test (optionnel, à retirer en production)
INSERT INTO annonces (
  titre, slug, type_bien, description, 
  ville, code_postal, 
  prix, type_transaction,
  surface_m2, nb_pieces, nb_chambres,
  statut, visible, published_at
) VALUES (
  'Belle maison familiale',
  'belle-maison-familiale',
  'maison',
  'Magnifique maison familiale avec jardin et garage.',
  'Lons-le-Saunier',
  '39000',
  285000,
  'VENTE',
  140,
  6,
  4,
  'A_VENDRE',
  true,
  NOW()
);

-- Commentaires pour documentation
COMMENT ON TABLE annonces IS 'Table des annonces immobilières avec tous les détails requis';
COMMENT ON COLUMN annonces.statut IS 'Statut du bien: A_VENDRE, SOUS_COMPROMIS, VENDU, EN_LOCATION, LOUE, RETIRE';
COMMENT ON COLUMN annonces.type_transaction IS 'Type de transaction: VENTE ou LOCATION';
COMMENT ON COLUMN annonces.honoraires_transaction IS 'Honoraires calculés automatiquement pour la vente';
COMMENT ON COLUMN annonces.honoraires_location IS 'Honoraires calculés automatiquement pour la location';
COMMENT ON COLUMN annonces.points_forts IS 'Liste des points forts du bien (array)';
