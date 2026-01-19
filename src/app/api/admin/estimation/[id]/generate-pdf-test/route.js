/**
 * API Admin : Génération PDF Test
 * POST /api/admin/estimation/[id]/generate-pdf-test
 * 
 * Permet à un admin de générer un PDF test sans paiement
 * - Fonctionne même pour formule gratuite
 * - Nécessite mode_test_pdf_admin = true
 * - PDF marqué "MODE TEST"
 * - Accès ADMIN uniquement
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const supabase = createClient()
  const { id } = params

  try {
    // 1. VÉRIFICATION ADMIN
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé : Admin uniquement' }, { status: 403 })
    }

    // 2. VÉRIFIER MODE TEST ACTIVÉ
    const { data: param } = await supabase
      .from('estimation_parametres_globaux')
      .select('valeur')
      .eq('cle', 'mode_test_pdf_admin')
      .single()

    if (!param || param.valeur !== true) {
      return NextResponse.json({ 
        error: 'Mode test PDF désactivé. Activez-le dans les paramètres admin.' 
      }, { status: 403 })
    }

    // 3. RÉCUPÉRER L'ESTIMATION
    const { data: estimation, error: estError } = await supabase
      .from('estimations')
      .select('*, profiles(email, nom, prenom)')
      .eq('id', id)
      .single()

    if (estError || !estimation) {
      return NextResponse.json({ error: 'Estimation introuvable' }, { status: 404 })
    }

    // 4. GÉNÉRER LE PDF EN MODE TEST
    console.log(`[ADMIN TEST] Génération PDF test pour estimation ${id}`)
    
    // Appeler le service de génération PDF avec flag test
    const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/pdf/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Test': 'true' // Header spécial pour mode test
      },
      body: JSON.stringify({
        estimation_id: id,
        test_mode: true,
        formule: estimation.formule,
        user_email: estimation.profiles.email,
        calcul_detail: estimation.calcul_detail
      })
    })

    if (!pdfResponse.ok) {
      const error = await pdfResponse.json()
      throw new Error(error.message || 'Erreur génération PDF')
    }

    const pdfResult = await pdfResponse.json()

    // 5. METTRE À JOUR L'ESTIMATION AVEC PDF_MODE = 'test'
    const { error: updateError } = await supabase
      .from('estimations')
      .update({
        pdf_path: pdfResult.pdf_path,
        pdf_generated_at: new Date().toISOString(),
        pdf_mode: 'test'
      })
      .eq('id', id)

    if (updateError) {
      console.error('[ADMIN TEST] Erreur MAJ estimation:', updateError)
      throw updateError
    }

    console.log(`[ADMIN TEST] PDF test généré avec succès : ${pdfResult.pdf_path}`)

    return NextResponse.json({
      success: true,
      message: 'PDF test généré avec succès',
      pdf_path: pdfResult.pdf_path,
      pdf_mode: 'test',
      formule: estimation.formule,
      warning: '⚠️ Ce PDF est en MODE TEST et ne doit pas être utilisé en production'
    })

  } catch (error) {
    console.error('[ADMIN TEST] Erreur génération PDF test:', error)
    return NextResponse.json({
      error: 'Erreur lors de la génération du PDF test',
      details: error.message
    }, { status: 500 })
  }
}
