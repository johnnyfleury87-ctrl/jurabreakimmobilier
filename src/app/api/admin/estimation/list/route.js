/**
 * API Admin : Liste des estimations
 * GET /api/admin/estimation/list
 * 
 * Retourne la liste des estimations pour l'admin
 * Utilise service role pour contourner RLS
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // 1. Vérifier auth avec client normal
    const { createClient: createClientAuth } = await import('@/lib/supabase/server')
    const supabaseAuth = createClientAuth()
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier role admin
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé : Admin uniquement' }, { status: 403 })
    }

    // 2. Utiliser service role pour lister TOUTES les estimations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: estimations, error: estError } = await supabaseAdmin
      .from('estimations')
      .select('*, profiles(email, nom, prenom)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (estError) {
      console.error('[ADMIN] Erreur chargement estimations:', estError)
      throw estError
    }

    console.log(`[ADMIN] ${estimations?.length || 0} estimations chargées`)

    return NextResponse.json({
      success: true,
      estimations: estimations || [],
      count: estimations?.length || 0
    })

  } catch (error) {
    console.error('[ADMIN] Erreur liste estimations:', error)
    return NextResponse.json({
      error: 'Erreur chargement estimations',
      details: error.message
    }, { status: 500 })
  }
}
