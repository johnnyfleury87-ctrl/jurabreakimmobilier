-- Script de vérification RLS
-- Exécuter après les migrations pour vérifier que tout est en place

-- 1. Vérifier que RLS est activé sur toutes les tables sensibles
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'agence_settings',
  'annonces',
  'annonce_photos',
  'events',
  'leads',
  'analytics_events',
  'estimations'
)
ORDER BY tablename;

-- 2. Lister toutes les policies par table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Vérifier les tables sans RLS (devrait être vide pour les tables sensibles)
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename IN (
  'profiles',
  'agence_settings',
  'annonces',
  'annonce_photos',
  'events',
  'leads',
  'analytics_events',
  'estimations'
);

-- 4. Vérifier les tables sans policies (alerte si une table sensible n'a pas de policy)
SELECT DISTINCT
  t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
AND t.tablename IN (
  'profiles',
  'agence_settings',
  'annonces',
  'annonce_photos',
  'events',
  'leads',
  'analytics_events',
  'estimations'
)
AND p.policyname IS NULL;

-- 5. Vérifier que la fonction is_admin() existe
SELECT 
  proname,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'is_admin';
