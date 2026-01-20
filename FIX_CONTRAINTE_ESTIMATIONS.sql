-- =====================================================================
-- FIX URGENT : Suppression contraintes CHECK bloquantes sur estimations
-- À EXÉCUTER DANS SUPABASE SQL EDITOR
-- =====================================================================

-- 1. Supprimer TOUTES les contraintes CHECK
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
    RAISE NOTICE 'Contrainte supprimée: %', r.conname;
  END LOOP;
END $$;

-- 2. Recréer uniquement les contraintes essentielles sans conditions strictes
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
ADD CONSTRAINT estimations_statut_check 
CHECK (statut IN ('DRAFT', 'CALCULATED', 'PAID', 'COMPLETED', 'CANCELLED'));

-- Vérification
SELECT COUNT(*) as "Contraintes CHECK recréées"
FROM pg_constraint 
WHERE conrelid = 'estimations'::regclass 
AND contype = 'c';
