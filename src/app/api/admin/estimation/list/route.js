/**
 * API Admin : Liste des estimations
 * GET /api/admin/estimation/list
 * 
 * Retourne la liste des estimations pour l'admin
 * Utilise service role pour contourner RLS
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // 1. Vérifier auth avec client normal
    const { createClient: createClientAuth } = await import('@/lib/supabase/server')
    const supabaseAuth = await createClientAuth()
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        ok: false, 
        data: null, 
        error: { message: 'Non authentifié', code: 'AUTH_REQUIRED' } 
      }, { status: 401 })
    }

    // Vérifier role admin
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ 
        ok: false, 
        data: null, 
        error: { message: 'Accès refusé : Admin uniquement', code: 'FORBIDDEN' } 
      }, { status: 403 })
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

    // Requête simple sans join - bypass RLS
    const { data: estimations, error: estError } = await supabaseAdmin
      .from('estimations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (estError) {
      console.error('[ADMIN] Erreur chargement estimations:', estError)
      return NextResponse.json({
        ok: false,
        data: null,
        error: {
          message: 'Erreur lors du chargement des estimations',
          details: estError.message,
          hint: estError.hint,
          code: estError.code
        }
      }, { status: 500 })
    }

    console.log(`[ADMIN] ${estimations?.length || 0} estimations chargées`)

    return NextResponse.json({
      ok: true,
      data: estimations || [],
      error: null,
      count: estimations?.length || 0
    })

  } catch (error) {
    console.error('[ADMIN] Erreur liste estimations:', error)
    return NextResponse.json({
      ok: false,
      data: null,
      error: {
        message: 'Erreur serveur interne',
        details: error.message,
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}
