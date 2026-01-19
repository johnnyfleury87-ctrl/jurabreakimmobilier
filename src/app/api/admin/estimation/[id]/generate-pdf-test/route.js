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
  
  const logPrefix = `[ADMIN TEST ${id.slice(0, 8)}]`

  try {
    console.log(`${logPrefix} === DÉBUT GÉNÉRATION PDF TEST ===`)
    
    // 1. VÉRIFICATION ADMIN
    console.log(`${logPrefix} Étape 1: Vérification authentification...`)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error(`${logPrefix} ❌ Auth échouée:`, authError?.message)
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    console.log(`${logPrefix} ✅ User authentifié: ${user.id}`)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.error(`${logPrefix} ❌ Rôle insuffisant:`, profile?.role)
      return NextResponse.json({ error: 'Accès refusé : Admin uniquement' }, { status: 403 })
    }
    console.log(`${logPrefix} ✅ Role admin confirmé`)

    // 2. VÉRIFIER MODE TEST ACTIVÉ
    console.log(`${logPrefix} Étape 2: Vérification mode test...`)
    const { data: param, error: paramError } = await supabase
      .from('estimation_parametres_globaux')
      .select('valeur')
      .eq('cle', 'mode_test_pdf_admin')
      .single()

    if (paramError) {
      console.error(`${logPrefix} ❌ Erreur lecture paramètre:`, paramError)
      return NextResponse.json({ 
        error: 'Erreur lecture paramètre mode test',
        details: paramError.message
      }, { status: 500 })
    }

    if (!param || param.valeur !== true) {
      console.warn(`${logPrefix} ⚠️ Mode test désactivé (valeur=${param?.valeur})`)
      return NextResponse.json({ 
        error: 'Mode test PDF désactivé. Activez-le dans les paramètres admin.',
        help: 'Admin > Estimation > Paramètres Globaux > Mode test PDF (admin)'
      }, { status: 403 })
    }
    console.log(`${logPrefix} ✅ Mode test activé`)

    // 3. RÉCUPÉRER L'ESTIMATION
    console.log(`${logPrefix} Étape 3: Chargement estimation...`)
    const { data: estimation, error: estError } = await supabase
      .from('estimations')
      .select('*, profiles(email, nom, prenom)')
      .eq('id', id)
      .single()

    if (estError) {
      console.error(`${logPrefix} ❌ Erreur chargement estimation:`, estError)
      return NextResponse.json({ 
        error: 'Erreur chargement estimation',
        details: estError.message
      }, { status: 500 })
    }

    if (!estimation) {
      console.error(`${logPrefix} ❌ Estimation introuvable`)
      return NextResponse.json({ error: 'Estimation introuvable' }, { status: 404 })
    }
    
    console.log(`${logPrefix} ✅ Estimation chargée - Formule: ${estimation.formule}`)

    // 4. GÉNÉRER LE PDF EN MODE TEST
    console.log(`${logPrefix} Étape 4: Génération PDF...`)
    const pdfUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/pdf/generate`
    console.log(`${logPrefix} URL génération: ${pdfUrl}`)
    
    const pdfResponse = await fetch(pdfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Test': 'true'
      },
      body: JSON.stringify({
        estimation_id: id,
        test_mode: true,
        formule: estimation.formule,
        user_email: estimation.profiles?.email || 'test@example.com',
        calcul_detail: estimation.calcul_detail
      })
    })

    if (!pdfResponse.ok) {
      const error = await pdfResponse.json()
      console.error(`${logPrefix} ❌ Erreur service PDF:`, error)
      throw new Error(error.details || error.error || 'Erreur génération PDF')
    }

    const pdfResult = await pdfResponse.json()
    console.log(`${logPrefix} ✅ PDF généré: ${pdfResult.pdf_path}`)

    // 5. METTRE À JOUR L'ESTIMATION
    console.log(`${logPrefix} Étape 5: MAJ base de données...`)
    const { error: updateError } = await supabase
      .from('estimations')
      .update({
        pdf_path: pdfResult.pdf_path,
        pdf_generated_at: new Date().toISOString(),
        pdf_mode: 'test'
      })
      .eq('id', id)

    if (updateError) {
      console.error(`${logPrefix} ❌ Erreur MAJ estimation:`, updateError)
      throw new Error(`Erreur MAJ DB: ${updateError.message}`)
    }
    
    console.log(`${logPrefix} ✅ DB mise à jour`)
    console.log(`${logPrefix} === SUCCÈS ===`)

    return NextResponse.json({
      success: true,
      message: 'PDF test généré avec succès',
      pdf_path: pdfResult.pdf_path,
      pdf_mode: 'test',
      formule: estimation.formule,
      warning: '⚠️ Ce PDF est en MODE TEST et ne doit pas être utilisé en production'
    })

  } catch (error) {
    console.error(`${logPrefix} ❌ ERREUR GLOBALE:`, error)
    return NextResponse.json({
      error: 'Erreur lors de la génération du PDF test',
      details: error.message,
      step: 'Voir logs serveur pour détails'
    }, { status: 500 })
  }
}
