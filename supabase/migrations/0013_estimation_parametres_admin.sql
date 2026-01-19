-- =====================================================================
-- Migration 0013: Paramètres admin pour pilotage module estimation
-- Objectif : Contrôle activation PDF et envoi email par formule
-- =====================================================================

-- =====================================================================
-- 1. TABLE PARAMETRES GLOBAUX ESTIMATION
-- =====================================================================

CREATE TABLE IF NOT EXISTS estimation_parametres_globaux (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cle TEXT NOT NULL UNIQUE,
  valeur BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID
);

-- Insérer les paramètres globaux par défaut
INSERT INTO estimation_parametres_globaux (cle, valeur, description)
VALUES
  ('service_actif', true, 'Activer/désactiver le service d''estimation en ligne'),
  ('generation_pdf_active', true, 'Autoriser la génération de PDF (formules payantes)'),
  ('envoi_email_auto_actif', false, 'Activer l''envoi automatique des PDFs par email')
ON CONFLICT (cle) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_parametres_globaux_cle ON estimation_parametres_globaux(cle);

-- =====================================================================
-- 2. TABLE CONFIGURATION FORMULES
-- =====================================================================

CREATE TABLE IF NOT EXISTS estimation_config_formules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formule TEXT NOT NULL UNIQUE CHECK (formule IN ('gratuite', 'standard', 'premium')),
  nom_affichage TEXT NOT NULL,
  prix DECIMAL(10,2) NOT NULL DEFAULT 0,
  pdf_autorise BOOLEAN NOT NULL DEFAULT false,
  email_autorise BOOLEAN NOT NULL DEFAULT false,
  champs_premium_requis BOOLEAN NOT NULL DEFAULT false,
  ordre INTEGER NOT NULL DEFAULT 0,
  actif BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insérer les configurations de formules par défaut
INSERT INTO estimation_config_formules (formule, nom_affichage, prix, pdf_autorise, email_autorise, champs_premium_requis, ordre, description)
VALUES
  (
    'gratuite',
    'Formule Gratuite',
    0.00,
    false, -- PAS de PDF pour gratuite
    false, -- PAS d'email pour gratuite
    false,
    1,
    'Estimation affichée à l''écran uniquement - Pas de PDF généré'
  ),
  (
    'standard',
    'Formule Standard',
    49.00,
    true, -- PDF autorisé
    true, -- Email autorisé (si paramètre global activé)
    false,
    2,
    'Estimation complète avec PDF généré et téléchargeable'
  ),
  (
    'premium',
    'Formule Premium',
    149.00,
    true, -- PDF autorisé
    true, -- Email autorisé (si paramètre global activé)
    true, -- Champs supplémentaires requis
    3,
    'Estimation complète avec champs détaillés obligatoires'
  )
ON CONFLICT (formule) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_config_formules_actif ON estimation_config_formules(actif);
CREATE INDEX IF NOT EXISTS idx_config_formules_ordre ON estimation_config_formules(ordre);

-- =====================================================================
-- 3. AJOUT COLONNES CHAMPS PREMIUM DANS TABLE ESTIMATIONS
-- =====================================================================

ALTER TABLE estimations
ADD COLUMN IF NOT EXISTS nb_pieces INTEGER,
ADD COLUMN IF NOT EXISTS nb_chambres INTEGER,
ADD COLUMN IF NOT EXISTS environnement TEXT CHECK (environnement IN ('centre_ville', 'periurbain', 'rural', 'montagne')),
ADD COLUMN IF NOT EXISTS travaux TEXT CHECK (travaux IN ('aucun', 'mineurs', 'majeurs', 'complet'));

-- Index pour faciliter les recherches
CREATE INDEX IF NOT EXISTS idx_estimations_formule ON estimations(formule);
CREATE INDEX IF NOT EXISTS idx_estimations_pdf_path ON estimations(pdf_path) WHERE pdf_path IS NOT NULL;

-- =====================================================================
-- 4. TRIGGER POUR UPDATE_AT
-- =====================================================================

DROP TRIGGER IF EXISTS set_config_formules_updated_at ON estimation_config_formules;
CREATE TRIGGER set_config_formules_updated_at
  BEFORE UPDATE ON estimation_config_formules
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

DROP TRIGGER IF EXISTS set_parametres_globaux_updated_at ON estimation_parametres_globaux;
CREATE TRIGGER set_parametres_globaux_updated_at
  BEFORE UPDATE ON estimation_parametres_globaux
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

-- =====================================================================
-- 5. VUES UTILES POUR ADMIN
-- =====================================================================

-- Vue statistiques par formule
CREATE OR REPLACE VIEW estimation_stats_formules AS
SELECT
  e.formule,
  cf.nom_affichage,
  COUNT(*) as nb_estimations,
  SUM(CASE WHEN e.statut_paiement = 'PAID' THEN 1 ELSE 0 END) as nb_payees,
  SUM(CASE WHEN e.pdf_path IS NOT NULL THEN 1 ELSE 0 END) as nb_pdf_generes,
  ROUND(AVG(e.valeur_mediane), 2) as valeur_mediane_moyenne
FROM estimations e
LEFT JOIN estimation_config_formules cf ON e.formule = cf.formule
GROUP BY e.formule, cf.nom_affichage, cf.ordre
ORDER BY cf.ordre;

-- =====================================================================
-- 6. COMMENTAIRES
-- =====================================================================

COMMENT ON TABLE estimation_parametres_globaux IS 'Paramètres globaux pour le pilotage du module estimation';
COMMENT ON TABLE estimation_config_formules IS 'Configuration des formules : prix, autorisations PDF/email';
COMMENT ON COLUMN estimations.nb_pieces IS 'Nombre de pièces (requis formule premium)';
COMMENT ON COLUMN estimations.nb_chambres IS 'Nombre de chambres (requis formule premium)';
COMMENT ON COLUMN estimations.environnement IS 'Environnement du bien (requis formule premium)';
COMMENT ON COLUMN estimations.travaux IS 'Travaux récents (requis formule premium)';

-- =====================================================================
-- VÉRIFICATION
-- =====================================================================

SELECT 'Migration 0013 appliquée avec succès' as status;

-- Afficher les paramètres globaux
SELECT * FROM estimation_parametres_globaux ORDER BY cle;

-- Afficher la configuration des formules
SELECT formule, nom_affichage, prix, pdf_autorise, email_autorise, champs_premium_requis, actif
FROM estimation_config_formules
ORDER BY ordre;
