-- ========================================
-- AUDIT DB PRODUCTION - MODULE ESTIMATION
-- Compatible Supabase SQL Editor
-- ========================================

-- A. Colonnes table estimations
SELECT 
    'A. COLONNES ESTIMATIONS' as check_type,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='estimations'
ORDER BY ordinal_position;

-- B. Tables estimation existantes
SELECT 
    'B. TABLES ESTIMATION' as check_type,
    table_name
FROM information_schema.tables
WHERE table_schema='public'
AND table_name LIKE 'estimation%'
ORDER BY table_name;

-- C. estimations_old existe?
SELECT 
    'C. ESTIMATIONS_OLD EXISTS' as check_type,
    EXISTS(
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema='public' 
        AND table_name='estimations_old'
    ) as estimations_old_exists;

-- D. Index présents
SELECT 
    'D. INDEX ESTIMATIONS' as check_type,
    indexname, 
    indexdef
FROM pg_indexes
WHERE schemaname='public'
AND tablename='estimations'
ORDER BY indexname;

-- E. Contraintes
SELECT 
    'E. CONSTRAINTS' as check_type,
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.estimations'::regclass
ORDER BY conname;

-- F. Triggers
SELECT 
    'F. TRIGGERS' as check_type,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema='public'
AND event_object_table='estimations'
ORDER BY trigger_name;

-- G. Policies RLS
SELECT 
    'G. RLS POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname='public'
AND tablename='estimations'
ORDER BY policyname;

-- H. Vérifier présence user_id
SELECT 
    'H. USER_ID CHECK' as check_type,
    EXISTS(
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='estimations' 
        AND column_name='user_id'
    ) as user_id_exists;

-- I. Colonnes communes (si table existe)
SELECT 
    'I. COLONNES COMMUNES' as check_type,
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_schema='public' 
AND table_name='estimation_communes'
ORDER BY ordinal_position;

-- J. Compter estimations par formule
SELECT 
    'J. COUNT PAR FORMULE' as check_type,
    formule,
    COUNT(*) as total
FROM estimations
GROUP BY formule;

-- K. Vérifier config admin
SELECT 
    'K. CONFIG ADMIN' as check_type,
    *
FROM config_admin
WHERE key LIKE 'estimation%'
ORDER BY key;
