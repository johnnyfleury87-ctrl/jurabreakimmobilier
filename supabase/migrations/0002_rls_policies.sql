-- Migration 0002: RLS Policies
-- Fonction helper is_admin() (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Activation RLS sur toutes les tables sensibles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agence_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonce_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: profiles
-- ============================================
-- SELECT: user peut lire sa propre ligne
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT: permettre création lors du sign-up
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: user peut modifier sa ligne, admin peut tout modifier
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- ============================================
-- POLICIES: agence_settings
-- ============================================
-- SELECT: public peut lire (lecture seule pour affichage site)
CREATE POLICY "Public can read settings"
  ON agence_settings FOR SELECT
  TO public
  USING (true);

-- INSERT/UPDATE/DELETE: admin only
CREATE POLICY "Admin can insert settings"
  ON agence_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update settings"
  ON agence_settings FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete settings"
  ON agence_settings FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- POLICIES: annonces
-- ============================================
-- SELECT public: uniquement annonces publiées et non supprimées
CREATE POLICY "Public can read published annonces"
  ON annonces FOR SELECT
  TO public
  USING (
    is_deleted = false 
    AND published_at IS NOT NULL
  );

-- SELECT admin: tout lire
CREATE POLICY "Admin can read all annonces"
  ON annonces FOR SELECT
  TO authenticated
  USING (is_admin());

-- INSERT: admin only
CREATE POLICY "Admin can insert annonces"
  ON annonces FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: admin only
CREATE POLICY "Admin can update annonces"
  ON annonces FOR UPDATE
  TO authenticated
  USING (is_admin());

-- DELETE: admin only (soft delete normalement)
CREATE POLICY "Admin can delete annonces"
  ON annonces FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- POLICIES: annonce_photos
-- ============================================
-- SELECT public: seulement photos liées aux annonces publiées
CREATE POLICY "Public can read photos of published annonces"
  ON annonce_photos FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM annonces
      WHERE annonces.id = annonce_photos.annonce_id
      AND annonces.is_deleted = false
      AND annonces.published_at IS NOT NULL
    )
  );

-- SELECT admin: tout lire
CREATE POLICY "Admin can read all photos"
  ON annonce_photos FOR SELECT
  TO authenticated
  USING (is_admin());

-- INSERT/UPDATE/DELETE: admin only
CREATE POLICY "Admin can insert photos"
  ON annonce_photos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update photos"
  ON annonce_photos FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete photos"
  ON annonce_photos FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- POLICIES: events
-- ============================================
-- SELECT public: peut lire les événements publiés
CREATE POLICY "Public can read published events"
  ON events FOR SELECT
  TO public
  USING (is_published = true);

-- SELECT admin: tout lire
CREATE POLICY "Admin can read all events"
  ON events FOR SELECT
  TO authenticated
  USING (is_admin());

-- INSERT/UPDATE/DELETE: admin only
CREATE POLICY "Admin can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- POLICIES: leads
-- ============================================
-- INSERT public: autorisé (sans authentification)
CREATE POLICY "Public can insert leads"
  ON leads FOR INSERT
  TO public
  WITH CHECK (true);

-- SELECT/UPDATE/DELETE: admin only
CREATE POLICY "Admin can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- POLICIES: analytics_events
-- ============================================
-- INSERT public: autorisé (tracking anonyme)
CREATE POLICY "Public can insert analytics"
  ON analytics_events FOR INSERT
  TO public
  WITH CHECK (true);

-- SELECT: admin only
CREATE POLICY "Admin can read analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================
-- POLICIES: estimations
-- ============================================
-- INSERT public: autorisé (statut DRAFT uniquement + restrictions champs sensibles)
-- Note: contrainte sur terms_accepted_at pour formule_2 ajoutée dans migration 0005
CREATE POLICY "Public can insert draft estimations"
  ON estimations FOR INSERT
  TO public
  WITH CHECK (
    statut = 'DRAFT' 
    AND prix_paye IS NULL
    AND pdf_path IS NULL
    AND stripe_payment_intent_id IS NULL
    AND stripe_checkout_session_id IS NULL
  );

-- SELECT: admin only
CREATE POLICY "Admin can read estimations"
  ON estimations FOR SELECT
  TO authenticated
  USING (is_admin());

-- UPDATE: admin only (pour changer statut après paiement)
CREATE POLICY "Admin can update estimations"
  ON estimations FOR UPDATE
  TO authenticated
  USING (is_admin());

-- DELETE: admin only
CREATE POLICY "Admin can delete estimations"
  ON estimations FOR DELETE
  TO authenticated
  USING (is_admin());
