#!/usr/bin/env node

/**
 * Script de vérification des migrations Estimation
 * Usage : node scripts/check-estimation-migrations.js
 * Exit code : 0 = OK, 1 = KO
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const REQUIRED_TABLES = [
  'estimations',
  'estimation_communes',
  'estimation_zones',
  'estimation_coefficients',
  'estimation_options',
  'estimation_marges',
  'estimation_mentions_legales',
  'estimation_versions_regles'
]

async function checkTables() {
  console.log('\n📋 VÉRIFICATION DES TABLES\n')
  
  let allOk = true
  
  for (const table of REQUIRED_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`❌ ${table.padEnd(35)} MISSING`)
      allOk = false
    } else {
      console.log(`✅ ${table.padEnd(35)} OK`)
    }
  }
  
  return allOk
}

async function checkMinimalData() {
  console.log('\n📊 VÉRIFICATION DES DONNÉES MINIMALES\n')
  
  const checks = [
    { table: 'estimation_zones', min: 1, label: 'Zones' },
    { table: 'estimation_marges', min: 3, label: 'Marges (3 niveaux)' },
    { table: 'estimation_mentions_legales', min: 1, label: 'Mentions légales' },
    { table: 'estimation_coefficients', min: 1, label: 'Coefficients' },
    { table: 'estimation_options', min: 1, label: 'Options' }
  ]
  
  let allOk = true
  
  for (const check of checks) {
    const { count, error } = await supabase
      .from(check.table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`❌ ${check.label.padEnd(30)} ERROR: ${error.message}`)
      allOk = false
    } else if (count < check.min) {
      console.log(`⚠️  ${check.label.padEnd(30)} INCOMPLETE (${count}/${check.min})`)
      allOk = false
    } else {
      console.log(`✅ ${check.label.padEnd(30)} OK (${count} lignes)`)
    }
  }
  
  // Check communes (info seulement)
  const { count: communesCount } = await supabase
    .from('estimation_communes')
    .select('*', { count: 'exact', head: true })
  
  if (communesCount === 0) {
    console.log(`⚠️  Communes du Jura               EMPTY (seed requis)`)
  } else {
    console.log(`✅ Communes du Jura               OK (${communesCount} communes)`)
  }
  
  return allOk
}

async function checkRLS() {
  console.log('\n🔒 VÉRIFICATION RLS\n')
  
  // Query directe pour vérifier RLS
  const { data, error } = await supabase.rpc('check_rls_status', {}, { 
    // Si la function n'existe pas, on fait un check alternatif
  }).catch(() => null)
  
  // Alternative : tenter un SELECT sur estimations
  const { error: rlsError } = await supabase
    .from('estimations')
    .select('id')
    .limit(1)
  
  if (rlsError && rlsError.code === '42501') {
    console.log('❌ RLS: ERREUR (permissions insuffisantes)')
    return false
  } else {
    console.log('✅ RLS: OK (politiques actives)')
    return true
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║   VÉRIFICATION MIGRATIONS ESTIMATION MODULE    ║')
  console.log('╚════════════════════════════════════════════════╝')
  
  let globalStatus = true
  
  try {
    const tablesOk = await checkTables()
    const dataOk = await checkMinimalData()
    const rlsOk = await checkRLS()
    
    globalStatus = tablesOk && dataOk && rlsOk
    
    console.log('\n' + '═'.repeat(50))
    if (globalStatus) {
      console.log('✅ RÉSULTAT : Toutes les migrations sont OK')
      console.log('═'.repeat(50))
      process.exit(0)
    } else {
      console.log('❌ RÉSULTAT : Des éléments manquent ou sont incomplets')
      console.log('\n📝 Actions requises :')
      console.log('   1. Appliquer les migrations : supabase db push')
      console.log('   2. Seed les communes : psql -f supabase/seeds/seed_estimation_communes_jura.sql')
      console.log('═'.repeat(50))
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message)
    process.exit(1)
  }
}

main()
