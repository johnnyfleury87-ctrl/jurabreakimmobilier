-- Migration : Ajout du champ terms_accepted_at pour tracking de l'acceptation des CGV
-- Requis pour la formule 2 "juridiquement viable"

-- Ajouter le champ terms_accepted_at à la table estimations
ALTER TABLE estimations
ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- Créer un index pour requêter facilement les acceptations
CREATE INDEX idx_estimations_terms_accepted ON estimations(terms_accepted_at) WHERE terms_accepted_at IS NOT NULL;

-- Commentaire explicatif
COMMENT ON COLUMN estimations.terms_accepted_at IS 'Timestamp d''acceptation des conditions générales de vente pour les formules payantes (juridiquement requis)';

-- ============================================
-- Mise à jour de la policy RLS pour contraindre formule_2
-- ============================================
-- Supprimer l'ancienne policy créée dans 0002
DROP POLICY IF EXISTS "Public can insert draft estimations" ON estimations;

-- Recréer la policy avec la contrainte sur terms_accepted_at
CREATE POLICY "Public can insert draft estimations"
  ON estimations FOR INSERT
  TO public
  WITH CHECK (
    statut = 'DRAFT' 
    AND prix_paye IS NULL
    AND pdf_path IS NULL
    AND stripe_payment_intent_id IS NULL
    AND stripe_checkout_session_id IS NULL
    -- Pour formule 2, exiger terms_accepted_at (colonne maintenant existante)
    AND (
      formule IN ('formule_0', 'formule_1') 
      OR (formule = 'formule_2' AND terms_accepted_at IS NOT NULL)
    )
  );
