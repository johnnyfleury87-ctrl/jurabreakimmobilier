-- =====================================================================
-- MIGRATION 0017: DROP contrainte CHECK problématique sur estimations
-- =====================================================================
-- La contrainte empêche les insertions - on la supprime
-- =====================================================================

-- Lister et supprimer TOUTES les contraintes CHECK sur estimations
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'estimations'::regclass 
    AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE estimations DROP CONSTRAINT IF EXISTS %I CASCADE', r.conname);
    RAISE NOTICE '[0017] Contrainte CHECK supprimée: %', r.conname;
  END LOOP;
END $$;

-- Recréer uniquement les contraintes essentielles (enum values)
ALTER TABLE estimations
ADD CONSTRAINT estimations_motif_check 
CHECK (motif IN ('curiosite', 'vente', 'divorce', 'succession', 'notaire', 'autre'));

ALTER TABLE estimations
ADD CONSTRAINT estimations_type_bien_check 
CHECK (type_bien IN ('maison', 'appartement', 'autre'));

ALTER TABLE estimations
ADD CONSTRAINT estimations_etat_bien_check 
CHECK (etat_bien IN ('a_renover', 'correct', 'bon', 'tres_bon'));

ALTER TABLE estimations
ADD CONSTRAINT estimations_formule_check 
CHECK (formule IN ('gratuite', 'standard', 'premium') OR formule IS NULL);

ALTER TABLE estimations
ADD CONSTRAINT estimations_statut_paiement_check 
CHECK (statut_paiement IN ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED'));

ALTER TABLE estimations
ADD CONSTRAINT estimations_niveau_fiabilite_check 
CHECK (niveau_fiabilite IN ('minimal', 'complet', 'tres_complet') OR niveau_fiabilite IS NULL);

ALTER TABLE estimations
ADD CONSTRAINT estimations_statut_check 
CHECK (statut IN ('DRAFT', 'CALCULATED', 'PAID', 'COMPLETED', 'CANCELLED'));

ALTER TABLE estimations
ADD CONSTRAINT estimations_pdf_mode_check 
CHECK (pdf_mode IN ('prod', 'test') OR pdf_mode IS NULL);

ALTER TABLE estimations
ADD CONSTRAINT estimations_environnement_check 
CHECK (environnement IN ('centre_ville', 'periurbain', 'rural', 'montagne') OR environnement IS NULL);

ALTER TABLE estimations
ADD CONSTRAINT estimations_travaux_check 
CHECK (travaux IN ('aucun', 'mineurs', 'majeurs', 'complet') OR travaux IS NULL);

-- =====================================================================
-- VÉRIFICATION
-- =====================================================================
DO $$ 
DECLARE
  check_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO check_count
  FROM pg_constraint 
  WHERE conrelid = 'estimations'::regclass 
  AND contype = 'c';
  
  RAISE NOTICE '[0017] ✅ % contraintes CHECK recréées sur estimations', check_count;
END $$;

-- =====================================================================
-- FIN MIGRATION 0017
-- =====================================================================
