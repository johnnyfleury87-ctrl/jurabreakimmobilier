#!/usr/bin/env node
/**
 * Script de vérification des variables d'environnement
 * Usage: node scripts/check-env.js
 * ou: npm run env:check
 */

const requiredEnvVars = {
  public: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ],
  serverOnly: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_ID_FORMULE1',
    'STRIPE_PRICE_ID_FORMULE2',
    'BASE_URL'
  ],
  optional: [
    'EMAIL_PROVIDER_API_KEY'
  ]
}

const allRequired = [...requiredEnvVars.public, ...requiredEnvVars.serverOnly]

function checkEnvVars() {
  console.log('🔍 Checking environment variables...\n')
  
  let missing = []
  let present = []
  let warnings = []
  
  // Vérifier les variables requises
  allRequired.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName)
      console.log(`  ✓ ${varName}`)
    } else {
      missing.push(varName)
      console.log(`  ✗ ${varName} - MISSING`)
    }
  })
  
  // Vérifier les variables optionnelles
  console.log('\n📦 Optional variables:')
  requiredEnvVars.optional.forEach(varName => {
    if (process.env[varName]) {
      console.log(`  ✓ ${varName}`)
    } else {
      console.log(`  ⚠ ${varName} - Not set (optional)`)
      warnings.push(`${varName} is not set (email features disabled)`)
    }
  })
  
  // Vérifier les mauvaises pratiques
  console.log('\n🛡️  Security checks:')
  
  // Vérifier que les clés server-only ne sont pas préfixées NEXT_PUBLIC_
  const dangerousVars = Object.keys(process.env).filter(key => {
    return key.startsWith('NEXT_PUBLIC_') && 
           (key.includes('SECRET') || key.includes('SERVICE_ROLE') || key.includes('PRIVATE'))
  })
  
  if (dangerousVars.length > 0) {
    console.log(`  ⚠️  WARNING: Server-only keys should NOT be prefixed with NEXT_PUBLIC_:`)
    dangerousVars.forEach(key => console.log(`     - ${key}`))
    warnings.push('Server-only keys exposed as public')
  } else {
    console.log(`  ✓ No server-only keys exposed as public`)
  }
  
  // Vérifier le format des URLs
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    warnings.push('NEXT_PUBLIC_SUPABASE_URL should start with https://')
  }
  
  if (process.env.BASE_URL) {
    const baseUrl = process.env.BASE_URL
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      warnings.push('BASE_URL should start with http:// or https://')
    }
    if (baseUrl === 'http://localhost:3000') {
      console.log(`  ℹ️  BASE_URL is set to localhost (development mode)`)
    }
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60))
  
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set')
    console.log(`   ${present.length}/${allRequired.length} required variables present`)
  } else {
    console.log('❌ Missing required environment variables:')
    missing.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    console.log(`\n📝 Only ${present.length}/${allRequired.length} required variables present`)
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach(warning => console.log(`   - ${warning}`))
  }
  
  console.log('\n💡 To fix missing variables:')
  console.log('   Local: Copy .env.example to .env.local and fill in values')
  console.log('   Production: Configure in Vercel → Settings → Environment Variables')
  console.log('\n📚 Documentation: docs/SETUP_VERCEL_ENV.md')
  console.log('='.repeat(60) + '\n')
  
  // Exit code
  if (missing.length > 0) {
    process.exit(1)
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Build will continue with warnings\n')
    process.exit(0)
  }
  
  console.log('✅ Environment configuration is valid\n')
  process.exit(0)
}

// Exécuter la vérification
checkEnvVars()
