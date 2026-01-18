-- Migration 0010: Ajout du mode d'affichage pour les annonces
-- Date: 18 janvier 2026
-- Description: Permet de choisir comment les photos d'une annonce sont affichées

-- Ajouter le champ mode_affichage
ALTER TABLE annonces 
ADD COLUMN IF NOT EXISTS mode_affichage TEXT NOT NULL DEFAULT 'statique'
CHECK (mode_affichage IN ('statique', 'dynamique', 'film', 'focus', 'hover'));

-- Index pour optimiser les requêtes par mode
CREATE INDEX IF NOT EXISTS idx_annonces_mode_affichage 
ON annonces(mode_affichage) 
WHERE is_deleted = false;

-- Commentaire pour documentation
COMMENT ON COLUMN annonces.mode_affichage IS 
'Mode d''affichage des photos: statique (photo unique), dynamique (carousel), film (défilement continu), focus (alternance), hover (au survol)';
