/**
 * API Admin : Créer estimation de test
 * POST /api/admin/estimation/create-test
 * 
 * Crée une estimation minimale valide pour tester la génération PDF
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // 1. Vérifier auth
    const { createClient: createClientAuth } = await import('@/lib/supabase/server')
    const supabaseAuth = createClientAuth()
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('role, email, nom, prenom')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé : Admin uniquement' }, { status: 403 })
    }

    // 2. Utiliser service role pour créer l'estimation
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

    // 3. Récupérer une commune au hasard
    const { data: communes } = await supabaseAdmin
      .from('estimation_communes')
      .select('id, nom, code_postal')
      .limit(1)

    const commune = communes?.[0] || { id: '00000000-0000-0000-0000-000000000000', nom: 'Lons-le-Saunier', code_postal: '39000' }

    // 4. Créer l'estimation de test
    const testEstimation = {
      user_id: user.id,
      motif: 'curiosite',
      type_bien: 'maison',
      surface_habitable: 120,
      surface_terrain: 500,
      commune_id: commune.id,
      commune_nom: commune.nom,
      code_postal: commune.code_postal,
      annee_construction: 2010,
      etat_bien: 'bon',
      formule: 'gratuite',
      consentement_accepte: true,
      calcul_detail: {
        test: true,
        note: 'Estimation créée automatiquement pour tests'
      }
    }

    const { data: estimation, error: createError } = await supabaseAdmin
      .from('estimations')
      .insert(testEstimation)
      .select()
      .single()

    if (createError) {
      console.error('[ADMIN] Erreur création estimation test:', createError)
      throw createError
    }

    console.log(`[ADMIN] Estimation test créée: ${estimation.id}`)

    return NextResponse.json({
      success: true,
      message: 'Estimation test créée',
      estimation_id: estimation.id,
      formule: estimation.formule
    })

  } catch (error) {
    console.error('[ADMIN] Erreur création estimation test:', error)
    return NextResponse.json({
      error: 'Erreur création estimation test',
      details: error.message
    }, { status: 500 })
  }
}
