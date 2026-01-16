-- Migration: Auto-création des profiles admin
-- Date: 2026-01-16
-- Description: Crée automatiquement un profil admin pour les emails autorisés lors de l'inscription

-- Fonction pour auto-créer les profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_emails TEXT[] := ARRAY['lolita@jurabreak.fr', 'contact@jurabreak.fr'];
  user_role TEXT;
BEGIN
  -- Déterminer le rôle en fonction de l'email
  IF NEW.email = ANY(admin_emails) THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  -- Insérer le profil
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Éviter les erreurs si le profil existe déjà

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Créer les profils pour les utilisateurs existants qui n'en ont pas
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email IN ('lolita@jurabreak.fr', 'contact@jurabreak.fr') THEN 'admin'
    ELSE 'user'
  END as role,
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
AND u.email IS NOT NULL;

-- Commentaire pour documentation
COMMENT ON FUNCTION public.handle_new_user IS 'Auto-crée un profil admin ou user lors de la création d''un utilisateur dans auth.users';
