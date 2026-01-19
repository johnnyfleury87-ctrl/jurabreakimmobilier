-- Migration 0014 : Mode test PDF Admin
-- Date : 19 janvier 2026
-- Objectif : Permettre à l'admin de générer des PDFs en test sans paiement

-- 1. Ajouter le paramètre global mode_test_pdf_admin
INSERT INTO estimation_parametres_globaux (cle, valeur, description)
VALUES (
  'mode_test_pdf_admin',
  false,
  'Permet aux admins de générer des PDFs test sans paiement, même pour formules gratuites. PDFs marqués "MODE TEST".'
) ON CONFLICT (cle) DO NOTHING;

-- 2. Ajouter colonne pdf_mode dans estimations
ALTER TABLE estimations 
ADD COLUMN IF NOT EXISTS pdf_mode VARCHAR(10) DEFAULT 'prod' CHECK (pdf_mode IN ('prod', 'test'));

COMMENT ON COLUMN estimations.pdf_mode IS 'Mode de génération du PDF : prod (après paiement) ou test (admin uniquement)';

-- 3. Créer index pour filtrer les PDFs test
CREATE INDEX IF NOT EXISTS idx_estimations_pdf_mode ON estimations(pdf_mode);

-- 4. Ajouter contrainte : pdf_mode = 'test' uniquement si pdf_path existe
-- (Pour éviter des marqueurs test sans PDF généré)
-- Note : on ne peut pas faire une contrainte CHECK avec subquery, 
-- donc on fera la validation en application

-- 5. Mettre à jour les PDFs existants en mode 'prod' par défaut
UPDATE estimations 
SET pdf_mode = 'prod' 
WHERE pdf_path IS NOT NULL AND pdf_mode IS NULL;

-- 6. Log
DO $$
BEGIN
  RAISE NOTICE 'Migration 0014 appliquée : Mode test PDF admin activé';
END $$;
