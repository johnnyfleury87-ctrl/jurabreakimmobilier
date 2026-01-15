-- Migration 0004: Storage Buckets Configuration
-- Note: Les buckets doivent être créés via l'interface Supabase ou CLI
-- Ce fichier documente la configuration nécessaire

-- Bucket: annonces (images des annonces)
-- Création: supabase storage create annonces --public
-- Policies:
--   - SELECT public: autorisé (images publiques)
--   - INSERT/UPDATE/DELETE: admin only

-- Bucket: public (logo, signature, cachet)
-- Création: supabase storage create public --public
-- Policies:
--   - SELECT public: autorisé
--   - INSERT/UPDATE/DELETE: admin only

-- Bucket: estimations (PDF générés)
-- Création: supabase storage create estimations --private
-- Policies:
--   - SELECT: admin only (accès via signed URL si nécessaire)
--   - INSERT/UPDATE/DELETE: admin only

-- Script de création des buckets (à exécuter dans le dashboard Supabase)
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('annonces', 'annonces', true),
  ('public', 'public', true),
  ('estimations', 'estimations', false)
ON CONFLICT (id) DO NOTHING;
*/

-- Policies Storage pour bucket 'annonces'
-- SELECT public
CREATE POLICY "Public can view annonces images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'annonces');

-- INSERT admin only
CREATE POLICY "Admin can upload annonces images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'annonces' 
    AND (SELECT is_admin())
  );

-- UPDATE admin only
CREATE POLICY "Admin can update annonces images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'annonces' 
    AND (SELECT is_admin())
  );

-- DELETE admin only
CREATE POLICY "Admin can delete annonces images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'annonces' 
    AND (SELECT is_admin())
  );

-- Policies Storage pour bucket 'public'
CREATE POLICY "Public can view public files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'public');

CREATE POLICY "Admin can upload public files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public' 
    AND (SELECT is_admin())
  );

CREATE POLICY "Admin can update public files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public' 
    AND (SELECT is_admin())
  );

CREATE POLICY "Admin can delete public files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public' 
    AND (SELECT is_admin())
  );

-- Policies Storage pour bucket 'estimations'
-- SELECT admin only
CREATE POLICY "Admin can view estimations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'estimations' 
    AND (SELECT is_admin())
  );

-- INSERT admin only (les PDF sont générés côté serveur)
CREATE POLICY "Admin can upload estimations"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'estimations' 
    AND (SELECT is_admin())
  );

-- DELETE admin only
CREATE POLICY "Admin can delete estimations"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'estimations' 
    AND (SELECT is_admin())
  );
