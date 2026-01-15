-- Migration : Ajout du champ download_token pour sécuriser le téléchargement des PDF
-- Seules les personnes ayant le token (envoyé par email ou affiché après paiement) peuvent télécharger

-- Ajouter le champ download_token à la table estimations
ALTER TABLE estimations
ADD COLUMN download_token TEXT UNIQUE;

-- Créer un index pour accélérer la recherche par token
CREATE INDEX idx_estimations_download_token ON estimations(download_token) WHERE download_token IS NOT NULL;

-- Commentaire explicatif
COMMENT ON COLUMN estimations.download_token IS 'Token unique pour sécuriser le téléchargement du PDF (généré lors du paiement, requis pour accéder au PDF)';
