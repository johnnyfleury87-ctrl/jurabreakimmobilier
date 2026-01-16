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
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  
  // Log détaillé en production pour debugging
  if (isProduction) {
    console.log('🔍 [PROD] Vérification auth API - Environnement:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
  }
  
  const supabase = await createClient()
  
  if (devBypassEnabled) {
    if (isProduction) {
      // CRITIQUE: En production, JAMAIS de bypass
      console.error('🚨 ALERTE SÉCURITÉ: DEV_ADMIN_BYPASS actif en PRODUCTION!')
      return {
        supabase,
        user: null,
        error: NextResponse.json(
          { error: 'Configuration invalide' },
          { status: 500 }
        )
      }
    }
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
      name: authError.name,
      isProduction
    })
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        { 
          error: 'AUTH_ERROR',
          message: 'Erreur d\'authentification', 
          details: isProduction ? 'Session invalide' : authError.message
        },
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
        { 
          error: 'NO_USER',
          message: 'Auth session missing', 
          details: 'Veuillez vous connecter via /admin/login' 
        },
        { status: 401 }
      )
    }
  }
  
  console.log('✅ User détecté:', { 
    id: user.id, 
    email: user.email,
    aud: user.aud,
    role: user.role 
  })
  
  // Vérifier le rôle dans la table profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    console.error('❌ PROFILE_ERROR:', profileError.message)
    // Fallback sur allowlist si profile n'existe pas encore
    const ADMIN_EMAILS = ['lolita@jurabreak.fr', 'contact@jurabreak.fr']
    if (!ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
      return {
        supabase,
        user: null,
        error: NextResponse.json(
          { error: 'Profil non trouvé', details: 'Veuillez contacter l\'administrateur' },
          { status: 403 }
        )
      }
    }
    console.warn('⚠️ Profil non trouvé mais email dans allowlist, accès autorisé')
  } else if (profile && profile.role !== 'admin') {
    console.error('❌ NOT_ADMIN:', user.email, 'Role:', profile.role)
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        { error: 'Accès refusé', details: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }
  }
  
  console.log('✅ ADMIN_OK:', user.email, 'Role:', profile?.role || 'fallback-allowlist')
  return { supabase, user, error: null, devBypass: false, profile }
}
