/**
 * API Admin : Créer estimation de test
 * POST /api/admin/estimation/create-test
 * 
 * Crée une estimation minimale valide pour tester la génération PDF
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    // 1. Vérifier auth
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

    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('role, email, nom, prenom')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ 
        ok: false, 
        data: null, 
        error: { message: 'Accès refusé : Admin uniquement', code: 'FORBIDDEN' } 
      }, { status: 403 })
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

    const commune = communes?.[0] || { 
      id: '00000000-0000-0000-0000-000000000000', 
      nom: 'Lons-le-Saunier', 
      code_postal: '39000' 
    }

    // 4. Créer l'estimation de test avec seulement les colonnes existantes
    const testEstimation = {
      // user_id: Optionnel (peut être NULL selon schéma actuel)
      user_id: user.id,
      
      // Informations client (obligatoires)
      nom: profile.nom || 'Test',
      prenom: profile.prenom || 'Admin',
      email: profile.email,
      telephone: '0600000000',
      
      // Motif (obligatoire)
      motif: 'curiosite',
      
      // Données du bien (obligatoires)
      type_bien: 'maison',
      surface_habitable: 120,
      surface_terrain: 500,
      commune_id: commune.id,
      commune_nom: commune.nom,
      code_postal: commune.code_postal,
      annee_construction: 2010,
      etat_bien: 'bon',
      
      // Options
      options_selectionnees: [],
      
      // Consentement
      consentement_accepte: true,
      consentement_at: new Date().toISOString(),
      
      // Formule et paiement
      formule: 'gratuite',
      statut_paiement: 'PAID', // Pour pouvoir générer le PDF
      
      // Calcul basique
      calcul_inputs: {
        test: true,
        note: 'Estimation créée automatiquement pour tests'
      },
      calcul_detail: {
        test: true
      },
      valeur_basse: 180000,
      valeur_mediane: 200000,
      valeur_haute: 220000,
      niveau_fiabilite: 'minimal',
      
      // Statut
      statut: 'CALCULATED'
    }

    const { data: estimation, error: createError } = await supabaseAdmin
      .from('estimations')
      .insert(testEstimation)
      .select()
      .single()

    if (createError) {
      console.error('[ADMIN] Erreur création estimation test:', createError)
      return NextResponse.json({
        ok: false,
        data: null,
        error: {
          message: 'Erreur lors de la création de l\'estimation test',
          details: createError.message,
          hint: createError.hint,
          code: createError.code
        }
      }, { status: 500 })
    }

    console.log(`[ADMIN] Estimation test créée: ${estimation.id}`)

    return NextResponse.json({
      ok: true,
      data: {
        estimation_id: estimation.id,
        formule: estimation.formule,
        statut: estimation.statut
      },
      error: null,
      message: 'Estimation test créée avec succès'
    })

  } catch (error) {
    console.error('[ADMIN] Erreur création estimation test:', error)
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
