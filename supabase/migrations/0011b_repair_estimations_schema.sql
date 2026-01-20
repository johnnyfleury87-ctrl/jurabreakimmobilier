-- =====================================================================
-- MIGRATION REPAIR: Ajouter les colonnes manquantes à estimations
-- =====================================================================
-- À utiliser si la table estimations existe déjà avec l'ancien schéma
-- et qu'on veut ajouter les nouvelles colonnes sans tout recréer
-- =====================================================================

-- Ajouter user_id si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='user_id'
  ) THEN
    ALTER TABLE estimations ADD COLUMN user_id UUID;
    RAISE NOTICE 'Colonne user_id ajoutée';
  END IF;
END $$;

-- Ajouter les champs client dénormalisés si manquants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='nom'
  ) THEN
    ALTER TABLE estimations ADD COLUMN nom TEXT;
    ALTER TABLE estimations ADD COLUMN prenom TEXT;
    RAISE NOTICE 'Colonnes nom/prenom ajoutées';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='email'
  ) THEN
    ALTER TABLE estimations ADD COLUMN email TEXT;
    RAISE NOTICE 'Colonne email ajoutée';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='telephone'
  ) THEN
    ALTER TABLE estimations ADD COLUMN telephone TEXT;
    RAISE NOTICE 'Colonne telephone ajoutée';
  END IF;
END $$;

-- Ajouter motif si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='motif'
  ) THEN
    ALTER TABLE estimations ADD COLUMN motif TEXT CHECK (motif IN ('curiosite', 'vente', 'divorce', 'succession', 'notaire', 'autre'));
    ALTER TABLE estimations ADD COLUMN motif_autre_detail TEXT;
    -- Valeur par défaut pour les anciennes lignes
    UPDATE estimations SET motif = 'curiosite' WHERE motif IS NULL;
    RAISE NOTICE 'Colonnes motif ajoutées';
  END IF;
END $$;

-- Ajouter surface_habitable si manquante (en copiant depuis surface si elle existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='surface_habitable'
  ) THEN
    ALTER TABLE estimations ADD COLUMN surface_habitable DECIMAL(10,2);
    
    -- Migrer depuis "surface" si elle existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' 
      AND table_name='estimations' 
      AND column_name='surface'
    ) THEN
      UPDATE estimations SET surface_habitable = surface WHERE surface_habitable IS NULL;
      RAISE NOTICE 'Colonne surface_habitable ajoutée et migrée depuis surface';
    ELSE
      RAISE NOTICE 'Colonne surface_habitable ajoutée';
    END IF;
  END IF;
END $$;

-- Ajouter surface_terrain si manquante
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='surface_terrain'
  ) THEN
    ALTER TABLE estimations ADD COLUMN surface_terrain DECIMAL(10,2);
    RAISE NOTICE 'Colonne surface_terrain ajoutée';
  END IF;
END $$;

-- Ajouter commune_id et commune_nom si manquants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='commune_id'
  ) THEN
    ALTER TABLE estimations ADD COLUMN commune_id UUID REFERENCES estimation_communes(id) ON DELETE SET NULL;
    RAISE NOTICE 'Colonne commune_id ajoutée';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='commune_nom'
  ) THEN
    ALTER TABLE estimations ADD COLUMN commune_nom TEXT;
    -- Migrer depuis "commune" si elle existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' 
      AND table_name='estimations' 
      AND column_name='commune'
    ) THEN
      UPDATE estimations SET commune_nom = commune WHERE commune_nom IS NULL;
      RAISE NOTICE 'Colonne commune_nom ajoutée et migrée depuis commune';
    ELSE
      RAISE NOTICE 'Colonne commune_nom ajoutée';
    END IF;
  END IF;
END $$;

-- Ajouter code_postal si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='code_postal'
  ) THEN
    ALTER TABLE estimations ADD COLUMN code_postal TEXT;
    -- Valeur par défaut
    UPDATE estimations SET code_postal = '39000' WHERE code_postal IS NULL;
    RAISE NOTICE 'Colonne code_postal ajoutée';
  END IF;
END $$;

-- Ajouter etat_bien si manquant (en migrant depuis etat_general si elle existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='etat_bien'
  ) THEN
    ALTER TABLE estimations ADD COLUMN etat_bien TEXT CHECK (etat_bien IN ('a_renover', 'correct', 'bon', 'tres_bon'));
    
    -- Migrer depuis etat_general si elle existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' 
      AND table_name='estimations' 
      AND column_name='etat_general'
    ) THEN
      UPDATE estimations 
      SET etat_bien = CASE 
        WHEN etat_general = 'neuf' THEN 'tres_bon'
        WHEN etat_general = 'excellent' THEN 'tres_bon'
        WHEN etat_general = 'bon' THEN 'bon'
        WHEN etat_general = 'moyen' THEN 'correct'
        WHEN etat_general = 'a_renover' THEN 'a_renover'
        ELSE 'correct'
      END
      WHERE etat_bien IS NULL;
      RAISE NOTICE 'Colonne etat_bien ajoutée et migrée depuis etat_general';
    ELSE
      -- Valeur par défaut
      UPDATE estimations SET etat_bien = 'correct' WHERE etat_bien IS NULL;
      RAISE NOTICE 'Colonne etat_bien ajoutée avec valeur par défaut';
    END IF;
  END IF;
END $$;

-- Ajouter champs complémentaires (formules standard/premium)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='nb_chambres'
  ) THEN
    ALTER TABLE estimations ADD COLUMN nb_chambres INTEGER;
    ALTER TABLE estimations ADD COLUMN nb_salles_bain INTEGER;
    ALTER TABLE estimations ADD COLUMN exposition TEXT;
    ALTER TABLE estimations ADD COLUMN chauffage TEXT;
    ALTER TABLE estimations ADD COLUMN dpe_classe TEXT;
    ALTER TABLE estimations ADD COLUMN ges_classe TEXT;
    RAISE NOTICE 'Colonnes complémentaires (premium) ajoutées';
  END IF;
END $$;

-- Ajouter options_selectionnees si manquante
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='options_selectionnees'
  ) THEN
    ALTER TABLE estimations ADD COLUMN options_selectionnees JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Colonne options_selectionnees ajoutée';
  END IF;
END $$;

-- Ajouter consentement si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='consentement_accepte'
  ) THEN
    ALTER TABLE estimations ADD COLUMN consentement_accepte BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE estimations ADD COLUMN consentement_ip TEXT;
    ALTER TABLE estimations ADD COLUMN consentement_at TIMESTAMPTZ;
    RAISE NOTICE 'Colonnes consentement ajoutées';
  END IF;
END $$;

-- Ajouter version_regles_id si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='version_regles_id'
  ) THEN
    ALTER TABLE estimations ADD COLUMN version_regles_id UUID REFERENCES estimation_versions_regles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Colonne version_regles_id ajoutée';
  END IF;
END $$;

-- Ajouter calcul_inputs et calcul_detail si manquants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='calcul_inputs'
  ) THEN
    ALTER TABLE estimations ADD COLUMN calcul_inputs JSONB;
    ALTER TABLE estimations ADD COLUMN calcul_detail JSONB;
    RAISE NOTICE 'Colonnes calcul_inputs/detail ajoutées';
  END IF;
END $$;

-- Ajouter valeurs calculées si manquantes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='valeur_basse'
  ) THEN
    ALTER TABLE estimations ADD COLUMN valeur_basse DECIMAL(12,2);
    ALTER TABLE estimations ADD COLUMN valeur_mediane DECIMAL(12,2);
    ALTER TABLE estimations ADD COLUMN valeur_haute DECIMAL(12,2);
    RAISE NOTICE 'Colonnes valeurs calculées ajoutées';
  END IF;
END $$;

-- Ajouter niveau_fiabilite si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='niveau_fiabilite'
  ) THEN
    ALTER TABLE estimations ADD COLUMN niveau_fiabilite TEXT CHECK (niveau_fiabilite IN ('minimal', 'complet', 'tres_complet'));
    RAISE NOTICE 'Colonne niveau_fiabilite ajoutée';
  END IF;
END $$;

-- Ajouter calcule_at si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='calcule_at'
  ) THEN
    ALTER TABLE estimations ADD COLUMN calcule_at TIMESTAMPTZ;
    RAISE NOTICE 'Colonne calcule_at ajoutée';
  END IF;
END $$;

-- Ajouter pdf_mode si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='pdf_mode'
  ) THEN
    ALTER TABLE estimations ADD COLUMN pdf_mode TEXT;
    RAISE NOTICE 'Colonne pdf_mode ajoutée';
  END IF;
END $$;

-- Ajouter completed_at si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='completed_at'
  ) THEN
    ALTER TABLE estimations ADD COLUMN completed_at TIMESTAMPTZ;
    RAISE NOTICE 'Colonne completed_at ajoutée';
  END IF;
END $$;

-- Créer les index manquants (idempotent)
CREATE INDEX IF NOT EXISTS idx_estimations_user_id ON estimations(user_id);
CREATE INDEX IF NOT EXISTS idx_estimations_email ON estimations(email);
CREATE INDEX IF NOT EXISTS idx_estimations_code_postal ON estimations(code_postal);
CREATE INDEX IF NOT EXISTS idx_estimations_commune ON estimations(commune_id);

-- Rendre les colonnes NOT NULL si elles ont des valeurs par défaut maintenant
DO $$ 
BEGIN
  -- Mettre des valeurs par défaut pour les anciennes lignes
  UPDATE estimations SET nom = 'Non renseigné' WHERE nom IS NULL;
  UPDATE estimations SET prenom = 'Non renseigné' WHERE prenom IS NULL;
  UPDATE estimations SET email = 'noreply@jurabreakimmobilier.com' WHERE email IS NULL;
  UPDATE estimations SET commune_nom = 'Non renseignée' WHERE commune_nom IS NULL;
  UPDATE estimations SET code_postal = '39000' WHERE code_postal IS NULL;
  UPDATE estimations SET etat_bien = 'correct' WHERE etat_bien IS NULL;
  UPDATE estimations SET type_bien = 'maison' WHERE type_bien IS NULL;
  UPDATE estimations SET surface_habitable = 100 WHERE surface_habitable IS NULL;
  UPDATE estimations SET motif = 'curiosite' WHERE motif IS NULL;
  
  RAISE NOTICE 'Valeurs par défaut appliquées aux anciennes lignes';
END $$;

-- Résumé
DO $$ 
BEGIN
  RAISE NOTICE '=== MIGRATION REPAIR TERMINÉE ===';
  RAISE NOTICE 'Vérifiez avec: SELECT column_name FROM information_schema.columns WHERE table_name=''estimations'' ORDER BY ordinal_position;';
END $$;
