-- Script pour créer un utilisateur admin
-- Remplacer 'admin@jurabreak.fr' par l'email souhaité
-- L'utilisateur doit d'abord créer un compte via l'interface Supabase Auth

-- Étape 1: Créer le compte utilisateur dans Supabase Auth Dashboard
-- ou via API/CLI avec l'email: admin@jurabreak.fr

-- Étape 2: Récupérer l'UUID de l'utilisateur créé
-- SELECT id, email FROM auth.users WHERE email = 'admin@jurabreak.fr';

-- Étape 3: Créer ou mettre à jour le profil avec role admin
-- Remplacer 'USER_UUID_ICI' par l'UUID réel
INSERT INTO profiles (id, email, role)
VALUES (
  'USER_UUID_ICI'::uuid,
  'admin@jurabreak.fr',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', email = 'admin@jurabreak.fr';

-- Vérification
SELECT id, email, role, created_at 
FROM profiles 
WHERE role = 'admin';
