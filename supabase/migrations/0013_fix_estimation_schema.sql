-- =====================================================================
-- MIGRATION 0013: Corrections additives module estimation
-- =====================================================================
-- ⚠️ IMPORTANT: Cette migration est 100% ADDITIVE
-- - NE supprime rien
-- - NE renomme rien
-- - Ajoute uniquement ce qui manque
-- - Peut être relancée sans erreur (idempotente)
-- =====================================================================

-- =====================================================================
-- 1. AJOUTER user_id SI ABSENT (SANS FK vers profiles)
-- =====================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
    AND table_name='estimations' 
    AND column_name='user_id'
  ) THEN
    ALTER TABLE estimations ADD COLUMN user_id UUID;
    RAISE NOTICE '[0013] Colonne user_id ajoutée';
  ELSE
    RAISE NOTICE '[0013] Colonne user_id existe déjà';
  END IF;
END $$;

-- ⚠️ AUCUNE FOREIGN KEY vers profiles (pour éviter PGRST200)

-- =====================================================================
-- 2. AJOUTER LES COLONNES MÉTIER SI ABSENTES
-- =====================================================================

-- Champs client (dénormalisés)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='nom') THEN
    ALTER TABLE estimations ADD COLUMN nom TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='prenom') THEN
    ALTER TABLE estimations ADD COLUMN prenom TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='email') THEN
    ALTER TABLE estimations ADD COLUMN email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='telephone') THEN
    ALTER TABLE estimations ADD COLUMN telephone TEXT;
  END IF;
  RAISE NOTICE '[0013] Colonnes client vérifiées';
END $$;

-- Motif
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='motif') THEN
    ALTER TABLE estimations ADD COLUMN motif TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='motif_autre_detail') THEN
    ALTER TABLE estimations ADD COLUMN motif_autre_detail TEXT;
  END IF;
  RAISE NOTICE '[0013] Colonnes motif vérifiées';
END $$;

-- Surface habitable (migration depuis "surface" si elle existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='surface_habitable') THEN
    ALTER TABLE estimations ADD COLUMN surface_habitable NUMERIC(10,2);
    
    -- Migrer depuis "surface" si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='surface') THEN
      UPDATE estimations SET surface_habitable = surface WHERE surface_habitable IS NULL AND surface IS NOT NULL;
      RAISE NOTICE '[0013] surface_habitable ajoutée et migrée depuis surface';
    ELSE
      RAISE NOTICE '[0013] surface_habitable ajoutée';
    END IF;
  ELSE
    RAISE NOTICE '[0013] surface_habitable existe déjà';
  END IF;
END $$;

-- Surface terrain
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='surface_terrain') THEN
    ALTER TABLE estimations ADD COLUMN surface_terrain NUMERIC(10,2);
    RAISE NOTICE '[0013] surface_terrain ajoutée';
  END IF;
END $$;

-- Commune
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='commune_id') THEN
    ALTER TABLE estimations ADD COLUMN commune_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='commune_nom') THEN
    ALTER TABLE estimations ADD COLUMN commune_nom TEXT;
    -- Migrer depuis "commune" si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='commune') THEN
      UPDATE estimations SET commune_nom = commune WHERE commune_nom IS NULL AND commune IS NOT NULL;
    END IF;
  END IF;
  RAISE NOTICE '[0013] Colonnes commune vérifiées';
END $$;

-- Code postal
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='code_postal') THEN
    ALTER TABLE estimations ADD COLUMN code_postal TEXT;
    RAISE NOTICE '[0013] code_postal ajouté';
  END IF;
END $$;

-- Année construction
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='annee_construction') THEN
    ALTER TABLE estimations ADD COLUMN annee_construction INTEGER;
  END IF;
END $$;

-- État bien (migration depuis etat_general si elle existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='etat_bien') THEN
    ALTER TABLE estimations ADD COLUMN etat_bien TEXT;
    
    -- Migrer depuis etat_general si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='etat_general') THEN
      UPDATE estimations 
      SET etat_bien = CASE 
        WHEN etat_general = 'neuf' THEN 'tres_bon'
        WHEN etat_general = 'excellent' THEN 'tres_bon'
        WHEN etat_general = 'bon' THEN 'bon'
        WHEN etat_general = 'moyen' THEN 'correct'
        WHEN etat_general = 'a_renover' THEN 'a_renover'
        ELSE 'correct'
      END
      WHERE etat_bien IS NULL AND etat_general IS NOT NULL;
      RAISE NOTICE '[0013] etat_bien ajouté et migré depuis etat_general';
    ELSE
      RAISE NOTICE '[0013] etat_bien ajouté';
    END IF;
  ELSE
    RAISE NOTICE '[0013] etat_bien existe déjà';
  END IF;
END $$;

-- Nombre de pièces
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='nb_pieces') THEN
    ALTER TABLE estimations ADD COLUMN nb_pieces INTEGER;
  END IF;
END $$;

-- Champs premium
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='nb_chambres') THEN
    ALTER TABLE estimations ADD COLUMN nb_chambres INTEGER;
    ALTER TABLE estimations ADD COLUMN nb_salles_bain INTEGER;
    ALTER TABLE estimations ADD COLUMN exposition TEXT;
    ALTER TABLE estimations ADD COLUMN chauffage TEXT;
    ALTER TABLE estimations ADD COLUMN dpe_classe TEXT;
    ALTER TABLE estimations ADD COLUMN ges_classe TEXT;
    RAISE NOTICE '[0013] Colonnes premium ajoutées';
  END IF;
END $$;

-- Options sélectionnées (JSONB)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='options_selectionnees') THEN
    ALTER TABLE estimations ADD COLUMN options_selectionnees JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE '[0013] options_selectionnees ajoutée';
  END IF;
END $$;

-- Consentement
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='consentement_accepte') THEN
    ALTER TABLE estimations ADD COLUMN consentement_accepte BOOLEAN DEFAULT false;
    ALTER TABLE estimations ADD COLUMN consentement_ip TEXT;
    ALTER TABLE estimations ADD COLUMN consentement_at TIMESTAMPTZ;
    RAISE NOTICE '[0013] Colonnes consentement ajoutées';
  END IF;
END $$;

-- Formule
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='formule') THEN
    ALTER TABLE estimations ADD COLUMN formule TEXT;
    RAISE NOTICE '[0013] formule ajoutée';
  END IF;
END $$;

-- Version règles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='version_regles_id') THEN
    ALTER TABLE estimations ADD COLUMN version_regles_id UUID;
  END IF;
END $$;

-- Calcul
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='calcul_inputs') THEN
    ALTER TABLE estimations ADD COLUMN calcul_inputs JSONB;
    ALTER TABLE estimations ADD COLUMN calcul_detail JSONB;
    RAISE NOTICE '[0013] Colonnes calcul ajoutées';
  END IF;
END $$;

-- Valeurs calculées
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='valeur_basse') THEN
    ALTER TABLE estimations ADD COLUMN valeur_basse NUMERIC(12,2);
    ALTER TABLE estimations ADD COLUMN valeur_mediane NUMERIC(12,2);
    ALTER TABLE estimations ADD COLUMN valeur_haute NUMERIC(12,2);
    RAISE NOTICE '[0013] Colonnes valeurs ajoutées';
  END IF;
END $$;

-- Niveau fiabilité
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='niveau_fiabilite') THEN
    ALTER TABLE estimations ADD COLUMN niveau_fiabilite TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='calcule_at') THEN
    ALTER TABLE estimations ADD COLUMN calcule_at TIMESTAMPTZ;
  END IF;
END $$;

-- PDF
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='pdf_mode') THEN
    ALTER TABLE estimations ADD COLUMN pdf_mode TEXT;
    RAISE NOTICE '[0013] pdf_mode ajoutée';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='completed_at') THEN
    ALTER TABLE estimations ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- =====================================================================
-- 3. CRÉER LES INDEX MANQUANTS (idempotents)
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_estimations_user_id ON estimations(user_id);
CREATE INDEX IF NOT EXISTS idx_estimations_email ON estimations(email);
CREATE INDEX IF NOT EXISTS idx_estimations_code_postal ON estimations(code_postal);
CREATE INDEX IF NOT EXISTS idx_estimations_commune ON estimations(commune_id);

DO $$ BEGIN
  RAISE NOTICE '[0013] Index vérifiés';
END $$;

-- =====================================================================
-- 4. VALEURS PAR DÉFAUT SAFE (pour éviter NULL dans PDF)
-- =====================================================================

DO $$ 
BEGIN
  -- Mettre des valeurs par défaut pour les lignes existantes
  UPDATE estimations SET nom = 'Non renseigné' WHERE nom IS NULL;
  UPDATE estimations SET prenom = 'Non renseigné' WHERE prenom IS NULL;
  UPDATE estimations SET email = 'noreply@jurabreakimmobilier.com' WHERE email IS NULL;
  UPDATE estimations SET commune_nom = 'Non renseignée' WHERE commune_nom IS NULL;
  UPDATE estimations SET code_postal = '39000' WHERE code_postal IS NULL;
  
  -- Mettre statut par défaut si absent
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='statut') THEN
    UPDATE estimations SET statut = 'DRAFT' WHERE statut IS NULL;
  END IF;
  
  RAISE NOTICE '[0013] Valeurs par défaut appliquées';
END $$;

-- =====================================================================
-- 5. VÉRIFICATION FINALE
-- =====================================================================

DO $$ 
DECLARE
  user_id_exists BOOLEAN;
  surface_habitable_exists BOOLEAN;
  etat_bien_exists BOOLEAN;
BEGIN
  -- Vérifier colonnes critiques
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='user_id') INTO user_id_exists;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='surface_habitable') INTO surface_habitable_exists;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estimations' AND column_name='etat_bien') INTO etat_bien_exists;
  
  IF user_id_exists AND surface_habitable_exists AND etat_bien_exists THEN
    RAISE NOTICE '[0013] ✅ Migration corrective terminée avec succès';
    RAISE NOTICE '[0013] - user_id: OK';
    RAISE NOTICE '[0013] - surface_habitable: OK';
    RAISE NOTICE '[0013] - etat_bien: OK';
  ELSE
    RAISE WARNING '[0013] ⚠️ Certaines colonnes manquent encore';
  END IF;
END $$;

-- =====================================================================
-- FIN MIGRATION 0013 - CORRECTIONS ADDITIVES
-- =====================================================================
