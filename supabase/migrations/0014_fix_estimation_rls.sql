-- =====================================================================
-- MIGRATION 0014: Fix RLS estimation (après ajout user_id)
-- =====================================================================
-- ⚠️ Cette migration corrige les policies RLS si elles utilisent user_id
-- mais que user_id n'existait pas lors de l'application de 0012
-- =====================================================================

-- =====================================================================
-- 1. RECRÉER LES POLICIES UTILISATEUR (DROP + CREATE pour idempotence)
-- =====================================================================

-- Supprimer les policies existantes pour les recréer proprement
DROP POLICY IF EXISTS "Users can view own estimations" ON estimations;
DROP POLICY IF EXISTS "Users can create own estimations" ON estimations;

-- Recréer avec user_id (qui existe maintenant grâce à 0013)
CREATE POLICY "Users can view own estimations"
  ON estimations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own estimations"
  ON estimations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy update pour que les users puissent modifier leurs estimations
CREATE POLICY IF NOT EXISTS "Users can update own estimations"
  ON estimations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

RAISE NOTICE '[0014] Policies utilisateurs recréées avec user_id';

-- =====================================================================
-- 2. POLICY ADMIN (inchangée, mais on la recrée pour cohérence)
-- =====================================================================

DROP POLICY IF EXISTS "Admins can view all estimations" ON estimations;

CREATE POLICY "Admins can view all estimations"
  ON estimations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy admin pour modifications
CREATE POLICY IF NOT EXISTS "Admins can update all estimations"
  ON estimations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

RAISE NOTICE '[0014] Policies admin vérifiées';

-- =====================================================================
-- 3. S'ASSURER QUE RLS EST ACTIVÉ
-- =====================================================================

ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 4. VÉRIFICATION FINALE
-- =====================================================================

DO $$ 
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname='public' 
  AND tablename='estimations';
  
  RAISE NOTICE '[0014] ✅ % policies actives sur estimations', policy_count;
END $$;

-- =====================================================================
-- FIN MIGRATION 0014 - FIX RLS
-- =====================================================================
