/**
 * API : Génération PDF
 * POST /api/pdf/generate
 * 
 * Service de génération PDF appelé par :
 * - Webhook Stripe (après paiement)
 * - Admin test (mode test)
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateEstimationPDF } from '@/lib/pdfGenerator'

export async function POST(request) {
  const supabase = createClient()

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
        error: 'Mode test réservé aux administrateurs' 
      }, { status: 403 })
    }
    console.log(`${logPrefix} Mode: ${test_mode ? 'TEST (admin)' : 'PRODUCTION'}`)

    // Récupérer l'estimation complète
    console.log(`${logPrefix} Chargement estimation...`)
    const { data: estimation, error: estError } = await supabase
      .from('estimations')
      .select('*')
      .eq('id', estimation_id)
      .single()

    if (estError || !estimation) {
      console.error(`${logPrefix} ❌ Estimation introuvable:`, estError)
      return NextResponse.json({ 
        error: 'Estimation introuvable',
        details: estError?.message
      }, { status: 404 })
    }
    console.log(`${logPrefix} ✅ Estimation chargée - Formule: ${estimation.formule}`)

    // Générer le PDF avec flag test_mode
    console.log(`${logPrefix} Génération PDF...`)
    const pdfBuffer = await generateEstimationPDF(estimation, formule, { testMode: test_mode })
    console.log(`${logPrefix} ✅ PDF généré (${pdfBuffer.length} bytes)`)

    // Nom du fichier
    const timestamp = new Date().getTime()
    const prefix = test_mode ? 'TEST_' : ''
    const fileName = `estimations/${prefix}estimation_${estimation_id}_${timestamp}.pdf`
    console.log(`${logPrefix} Upload vers Storage: ${fileName}`)

    // Upload sur Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('estimations')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error(`${logPrefix} ❌ Erreur upload storage:`, uploadError)
      throw new Error(`Upload Storage échoué: ${uploadError.message}`)
    }

    console.log(`${logPrefix} ✅ Upload réussi: ${fileName}`)
    console.log(`${logPrefix} === SUCCÈS ===`)

    return NextResponse.json({
      success: true,
      pdf_path: fileName,
      test_mode: test_mode,
      message: test_mode ? 'PDF test généré avec succès' : 'PDF généré avec succès'
    })

  } catch (error) {
    console.error('[PDF] ❌ ERREUR GLOBALE:', error)
    console.error('[PDF] Stack:', error.stack)
    return NextResponse.json({
      error: 'Erreur lors de la génération du PDF',
      details: error.message
    }, { status: 500 })
  }
}
