/**
 * Helper pour vérifier l'authentification admin dans les API routes
 * Gère le mode DEV_ADMIN_BYPASS pour faciliter le développement
 */

import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from './config'
import { NextResponse } from 'next/server'

/**
 * Vérifie que l'utilisateur est admin et authentifié
 * @returns {{ supabase, user, error: null } | { supabase, user: null, error: NextResponse }}
 */
export async function checkApiAdminAuth() {
  const devBypassEnabled = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === 'true'
  const supabase = await createClient()
  
  if (devBypassEnabled) {
    console.warn('⚠️ DEV API BYPASS ACTIF - Ne jamais utiliser en production !')
    return { supabase, user: null, error: null, devBypass: true }
  }
  
  // Vérifier auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError) {
    console.error('❌ Auth error:', authError.message)
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        { error: 'Erreur d\'authentification', details: authError.message },
        { status: 401 }
      )
    }
  }
  
  if (!user) {
    console.error('❌ Pas d\'utilisateur')
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        { error: 'Non authentifié - aucun utilisateur détecté' },
        { status: 401 }
      )
    }
  }
  
  if (!isAdminEmail(user.email)) {
    console.error('❌ Email non autorisé:', user.email)
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        { error: 'Non autorisé - email non dans l\'allowlist', email: user.email },
        { status: 403 }
      )
    }
  }
  
  console.log('✅ Admin autorisé:', user.email)
  return { supabase, user, error: null, devBypass: false }
}
