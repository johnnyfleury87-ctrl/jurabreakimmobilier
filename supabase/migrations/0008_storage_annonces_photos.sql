-- Migration 0008: Configuration Storage pour les photos d'annonces
-- Date: 16 janvier 2026

-- Créer le bucket 'annonces' pour stocker les photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('annonces', 'annonces', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politique pour permettre aux admins d'uploader
CREATE POLICY "Les admins peuvent uploader des photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'annonces' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Politique pour permettre aux admins de supprimer
CREATE POLICY "Les admins peuvent supprimer des photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'annonces' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Politique pour permettre à tout le monde de voir les photos
CREATE POLICY "Tout le monde peut voir les photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'annonces');

-- Politique pour permettre aux admins de mettre à jour
CREATE POLICY "Les admins peuvent mettre à jour des photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'annonces' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
