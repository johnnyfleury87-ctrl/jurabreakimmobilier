-- =====================================================================
-- VÉRIFICATION MIGRATIONS ESTIMATION
-- Fichier : supabase/checks/check_estimation_migrations.sql
-- =====================================================================

\echo '=== VÉRIFICATION TABLES ESTIMATION ==='

-- Check existence des tables
DO $$
DECLARE
  v_table TEXT;
  v_exists BOOLEAN;
BEGIN
  RAISE NOTICE '--- Tables ---';
  
  FOREACH v_table IN ARRAY ARRAY[
    'estimations',
    'estimation_communes',
    'estimation_zones',
    'estimation_coefficients',
    'estimation_options',
    'estimation_marges',
    'estimation_mentions_legales',
    'estimation_versions_regles'
  ]
  LOOP
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = v_table
    ) INTO v_exists;
    
    IF v_exists THEN
      RAISE NOTICE '%: OK', v_table;
    ELSE
      RAISE NOTICE '%: MISSING', v_table;
    END IF;
  END LOOP;
END $$;

\echo ''
\echo '=== VÉRIFICATION DONNÉES MINIMALES ==='

-- Check données zones
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM estimation_zones;
  IF v_count > 0 THEN
    RAISE NOTICE 'estimation_zones: OK (% lignes)', v_count;
  ELSE
    RAISE NOTICE 'estimation_zones: EMPTY';
  END IF;
END $$;

-- Check données communes
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM estimation_communes;
  IF v_count > 0 THEN
    RAISE NOTICE 'estimation_communes: OK (% lignes)', v_count;
  ELSE
    RAISE NOTICE 'estimation_communes: EMPTY';
  END IF;
END $$;

-- Check données coefficients
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM estimation_coefficients;
  IF v_count > 0 THEN
    RAISE NOTICE 'estimation_coefficients: OK (% lignes)', v_count;
  ELSE
    RAISE NOTICE 'estimation_coefficients: EMPTY';
  END IF;
END $$;

-- Check données options
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM estimation_options;
  IF v_count > 0 THEN
    RAISE NOTICE 'estimation_options: OK (% lignes)', v_count;
  ELSE
    RAISE NOTICE 'estimation_options: EMPTY';
  END IF;
END $$;

-- Check données marges
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM estimation_marges;
  IF v_count >= 3 THEN
    RAISE NOTICE 'estimation_marges: OK (% lignes)', v_count;
  ELSE
    RAISE NOTICE 'estimation_marges: INCOMPLETE (% / 3 attendues)', v_count;
  END IF;
END $$;

-- Check données mentions légales
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM estimation_mentions_legales;
  IF v_count > 0 THEN
    RAISE NOTICE 'estimation_mentions_legales: OK (% lignes)', v_count;
  ELSE
    RAISE NOTICE 'estimation_mentions_legales: EMPTY';
  END IF;
END $$;

\echo ''
\echo '=== VÉRIFICATION RLS ==='

-- Check RLS activé
SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN 'OK' ELSE 'DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'estimation%'
ORDER BY tablename;

\echo ''
\echo '=== VÉRIFICATION POLICIES ==='

-- Check policies estimations
SELECT 
  tablename,
  policyname,
  CASE WHEN cmd = 'SELECT' THEN 'READ'
       WHEN cmd = 'INSERT' THEN 'INSERT'
       WHEN cmd = 'UPDATE' THEN 'UPDATE'
       WHEN cmd = 'DELETE' THEN 'DELETE'
       WHEN cmd = '*' THEN 'ALL'
  END as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'estimations'
ORDER BY tablename, policyname;

\echo ''
\echo '=== VÉRIFICATION INDEXES ==='

-- Check indexes importants
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'estimation%'
ORDER BY tablename, indexname;

\echo ''
\echo '=== RÉSUMÉ ==='
\echo 'Si tous les checks sont OK, les migrations sont correctement appliquées.'
\echo 'Sinon, exécutez : supabase db push ou appliquez manuellement 0011 et 0012.'
