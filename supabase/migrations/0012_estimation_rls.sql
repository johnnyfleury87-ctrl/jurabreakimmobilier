-- RLS Policies pour le module d'estimation
-- Conforme à docs/estimation.md - Sécurité & Traçabilité

-- =====================================================================
-- ESTIMATIONS
-- =====================================================================

-- Enable RLS
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres estimations
CREATE POLICY "Users can view own estimations"
  ON estimations FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs estimations
CREATE POLICY "Users can create own estimations"
  ON estimations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all estimations"
  ON estimations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================================
-- COMMUNES & ZONES (lecture publique pour le formulaire)
-- =====================================================================

ALTER TABLE estimation_communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_zones ENABLE ROW LEVEL SECURITY;

-- Lecture publique des communes actives
CREATE POLICY "Public can read active communes"
  ON estimation_communes FOR SELECT
  USING (actif = true);

-- Lecture publique des zones actives
CREATE POLICY "Public can read active zones"
  ON estimation_zones FOR SELECT
  USING (actif = true);

-- Admins peuvent modifier
CREATE POLICY "Admins can manage communes"
  ON estimation_communes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage zones"
  ON estimation_zones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================================
-- COEFFICIENTS & OPTIONS (lecture publique)
-- =====================================================================

ALTER TABLE estimation_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active coefficients"
  ON estimation_coefficients FOR SELECT
  USING (actif = true);

CREATE POLICY "Public can read active options"
  ON estimation_options FOR SELECT
  USING (actif = true);

CREATE POLICY "Admins can manage coefficients"
  ON estimation_coefficients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage options"
  ON estimation_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================================
-- MARGES & MENTIONS LÉGALES (lecture publique)
-- =====================================================================

ALTER TABLE estimation_marges ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_mentions_legales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read marges"
  ON estimation_marges FOR SELECT
  USING (true);

CREATE POLICY "Public can read active mentions legales"
  ON estimation_mentions_legales FOR SELECT
  USING (actif = true);

CREATE POLICY "Admins can manage marges"
  ON estimation_marges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage mentions legales"
  ON estimation_mentions_legales FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================================
-- VERSIONS RÈGLES (admins uniquement)
-- =====================================================================

ALTER TABLE estimation_versions_regles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage versions"
  ON estimation_versions_regles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public can read versions for history"
  ON estimation_versions_regles FOR SELECT
  USING (true);

-- =====================================================================
-- STORAGE POLICIES pour le bucket 'estimations'
-- =====================================================================

-- Admins peuvent uploader
CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'estimations' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role peut uploader (pour l'API)
CREATE POLICY "Service can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'estimations' AND
    auth.role() = 'service_role'
  );

-- Les utilisateurs peuvent télécharger leurs propres PDFs
-- Note: Gestion par token dans l'API, pas de RLS direct sur storage
