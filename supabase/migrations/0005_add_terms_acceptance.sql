-- Migration : Ajout du champ terms_accepted_at pour tracking de l'acceptation des CGV
-- Requis pour la formule 2 "juridiquement viable"

-- Ajouter le champ terms_accepted_at à la table estimations
ALTER TABLE estimations
ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- Créer un index pour requêter facilement les acceptations
CREATE INDEX idx_estimations_terms_accepted ON estimations(terms_accepted_at) WHERE terms_accepted_at IS NOT NULL;

-- Commentaire explicatif
COMMENT ON COLUMN estimations.terms_accepted_at IS 'Timestamp d''acceptation des conditions générales de vente pour les formules payantes (juridiquement requis)';
