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
  
  console.log('🔍 Vérification auth API...')
  
  // Vérifier auth avec logs détaillés
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError) {
    console.error('❌ AUTH_ERROR:', {
      message: authError.message,
      status: authError.status,
      name: authError.name
    })
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
    console.error('❌ NO_USER - Session manquante ou expirée')
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        { error: 'Session manquante', details: 'Veuillez vous connecter via /admin/login' },
        { status: 401 }
      )
    }
  }
  
  console.log('✅ User détecté:', { id: user.id, email: user.email })
  
  // Vérifier allowlist admin (indépendant de la table profiles)
  const ADMIN_EMAILS = ['lolita@jurabreak.fr', 'contact@jurabreak.fr']
  
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
    console.error('❌ NOT_ALLOWED:', user.email, '- Email non dans allowlist')
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        { error: 'Accès refusé', details: 'Email non autorisé' },
        { status: 403 }
      )
    }
  }
  
  console.log('✅ ADMIN_OK:', user.email)
  return { supabase, user, error: null, devBypass: false }
}
