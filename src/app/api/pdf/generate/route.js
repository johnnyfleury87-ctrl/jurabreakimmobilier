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

    // Vérification header admin pour mode test
    const isAdminTest = request.headers.get('X-Admin-Test') === 'true'
    
    if (test_mode && !isAdminTest) {
      return NextResponse.json({ 
        error: 'Mode test réservé aux administrateurs' 
      }, { status: 403 })
    }

    // Récupérer l'estimation complète
    const { data: estimation, error: estError } = await supabase
      .from('estimations')
      .select('*')
      .eq('id', estimation_id)
      .single()

    if (estError || !estimation) {
      return NextResponse.json({ error: 'Estimation introuvable' }, { status: 404 })
    }

    // Générer le PDF avec flag test_mode
    console.log(`[PDF] Génération PDF ${test_mode ? '(TEST)' : '(PROD)'} pour estimation ${estimation_id}`)
    
    const pdfBuffer = await generateEstimationPDF(estimation, formule, { testMode: test_mode })

    // Nom du fichier
    const timestamp = new Date().getTime()
    const prefix = test_mode ? 'TEST_' : ''
    const fileName = `estimations/${prefix}estimation_${estimation_id}_${timestamp}.pdf`

    // Upload sur Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('estimations')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('[PDF] Erreur upload storage:', uploadError)
      throw new Error('Erreur lors de l\'upload du PDF')
    }

    console.log(`[PDF] PDF ${test_mode ? 'TEST' : 'PROD'} généré et uploadé : ${fileName}`)

    return NextResponse.json({
      success: true,
      pdf_path: fileName,
      test_mode: test_mode,
      message: test_mode ? 'PDF test généré avec succès' : 'PDF généré avec succès'
    })

  } catch (error) {
    console.error('[PDF] Erreur génération:', error)
    return NextResponse.json({
      error: 'Erreur lors de la génération du PDF',
      details: error.message
    }, { status: 500 })
  }
}
