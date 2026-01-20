/**
 * API : Génération PDF
 * POST /api/pdf/generate
 * 
 * Service de génération PDF appelé par :
 * - Webhook Stripe (après paiement)
 * - Admin test (mode test)
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { generateEstimationPDF } from '@/lib/pdfGenerator'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { estimation_id, test_mode = false, formule, user_email, calcul_detail } = body
    
    const logPrefix = `[PDF ${test_mode ? 'TEST' : 'PROD'}]`
    console.log(`${logPrefix} === DÉBUT GÉNÉRATION ===`)
    console.log(`${logPrefix} Estimation ID: ${estimation_id}`)

    // Vérification header admin pour mode test
    const isAdminTest = request.headers.get('X-Admin-Test') === 'true'
    
    if (test_mode && !isAdminTest) {
      console.error(`${logPrefix} ❌ Mode test sans header admin`)
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: {
          message: 'Mode test réservé aux administrateurs',
          code: 'FORBIDDEN'
        }
      }, { status: 403 })
    }
    console.log(`${logPrefix} Mode: ${test_mode ? 'TEST (admin)' : 'PRODUCTION'}`)

    // Utiliser service role pour accéder à toutes les estimations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Récupérer l'estimation complète (SANS JOIN PROFILES)
    console.log(`${logPrefix} Chargement estimation...`)
    const { data: estimation, error: estError } = await supabase
      .from('estimations')
      .select('*')
      .eq('id', estimation_id)
      .single()

    if (estError || !estimation) {
      console.error(`${logPrefix} ❌ Estimation introuvable:`, estError)
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: {
          message: 'Estimation introuvable',
          details: estError?.message,
          code: estError?.code || 'NOT_FOUND'
        }
      }, { status: 404 })
    }
    console.log(`${logPrefix} ✅ Estimation chargée - Formule: ${estimation.formule}`)
    console.log(`${logPrefix} Client: ${estimation.prenom} ${estimation.nom} (${estimation.email})`)

    // Générer le PDF avec flag test_mode
    console.log(`${logPrefix} Génération PDF...`)
    const pdfBuffer = await generateEstimationPDF(estimation, formule, { testMode: test_mode })
    console.log(`${logPrefix} ✅ PDF généré (${pdfBuffer.length} bytes)`)

    // Nom du fichier
    const timestamp = new Date().getTime()
    const prefix = test_mode ? 'TEST_' : ''
    const fileName = `estimations/${prefix}estimation_${estimation_id}_${timestamp}.pdf`
    console.log(`${logPrefix} Upload vers Storage: ${fileName}`)

    // Upload sur Supabase Storage avec service role
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('estimations')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error(`${logPrefix} ❌ Erreur upload storage:`, uploadError)
      return NextResponse.json({
        ok: false,
        data: null,
        error: {
          message: 'Erreur lors de l\'upload du PDF',
          details: uploadError.message,
          code: uploadError.code || 'STORAGE_ERROR'
        }
      }, { status: 500 })
    }

    console.log(`${logPrefix} ✅ Upload réussi: ${fileName}`)
    console.log(`${logPrefix} === SUCCÈS ===`)

    return NextResponse.json({
      ok: true,
      data: {
        pdf_path: fileName,
        test_mode: test_mode
      },
      error: null,
      message: test_mode ? 'PDF test généré avec succès' : 'PDF généré avec succès'
    })

  } catch (error) {
    console.error('[PDF] ❌ ERREUR GLOBALE:', error)
    console.error('[PDF] Stack:', error.stack)
    return NextResponse.json({
      ok: false,
      data: null,
      error: {
        message: 'Erreur lors de la génération du PDF',
        details: error.message,
        stack: error.stack,
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}
