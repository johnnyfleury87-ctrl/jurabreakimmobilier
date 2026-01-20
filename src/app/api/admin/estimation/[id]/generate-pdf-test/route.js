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

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateEstimationPDF } from '@/lib/pdfGenerator'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  const supabase = await createClient()
  const { id } = params
  
  const logPrefix = `[ADMIN TEST ${id.slice(0, 8)}]`

  try {
    console.log(`${logPrefix} === DÉBUT GÉNÉRATION PDF TEST ===`)
    
    // 1. VÉRIFICATION ADMIN
    console.log(`${logPrefix} Étape 1: Vérification authentification...`)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error(`${logPrefix} ❌ Auth échouée:`, authError?.message)
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { message: 'Non authentifié', code: 'AUTH_REQUIRED' } 
      }, { status: 401 })
    }
    console.log(`${logPrefix} ✅ User authentifié: ${user.id}`)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.error(`${logPrefix} ❌ Rôle insuffisant:`, profile?.role)
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { message: 'Accès refusé : Admin uniquement', code: 'FORBIDDEN' } 
      }, { status: 403 })
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
        ok: false,
        data: null,
        error: { 
          message: 'Erreur lecture paramètre mode test',
          details: paramError.message,
          code: paramError.code
        }
      }, { status: 500 })
    }

    if (!param || param.valeur !== true) {
      console.warn(`${logPrefix} ⚠️ Mode test désactivé (valeur=${param?.valeur})`)
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { 
          message: 'Mode test PDF désactivé. Activez-le dans les paramètres admin.',
          hint: 'Admin > Estimation > Paramètres Globaux > Mode test PDF (admin)',
          code: 'TEST_MODE_DISABLED'
        }
      }, { status: 403 })
    }
    console.log(`${logPrefix} ✅ Mode test activé`)

    // 3. RÉCUPÉRER L'ESTIMATION (SANS JOIN PROFILES)
    console.log(`${logPrefix} Étape 3: Chargement estimation...`)
    const { data: estimation, error: estError } = await supabase
      .from('estimations')
      .select('*')
      .eq('id', id)
      .single()

    if (estError) {
      console.error(`${logPrefix} ❌ Erreur chargement estimation:`, estError)
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { 
          message: 'Erreur chargement estimation',
          details: estError.message,
          code: estError.code
        }
      }, { status: 500 })
    }

    if (!estimation) {
      console.error(`${logPrefix} ❌ Estimation introuvable`)
      return NextResponse.json({ 
        ok: false,
        data: null,
        error: { message: 'Estimation introuvable', code: 'NOT_FOUND' } 
      }, { status: 404 })
    }
    
    console.log(`${logPrefix} ✅ Estimation chargée - Formule: ${estimation.formule}`)
    console.log(`${logPrefix} Champs présents:`, Object.keys(estimation).join(', '))
    console.log(`${logPrefix} Statut paiement: ${estimation.statut_paiement}`)

    // 🔍 PISTE 1: VÉRIFICATION MODE TEST - IGNORE STATUT PAIEMENT
    console.log(`${logPrefix} ⚠️ MODE TEST = IGNORE STATUT PAIEMENT`)

    // 4. GÉNÉRER LE PDF DIRECTEMENT (pas de fetch HTTP)
    console.log(`${logPrefix} Étape 4: Génération PDF directe...`)
    
    // Créer client service role pour upload
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log(`${logPrefix} 🔑 Service role présente: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`)
    console.log(`${logPrefix} 🔑 Supabase URL: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    
    // 🔍 PISTE 4: GÉNÉRATION PDF ELLE-MÊME
    console.log(`${logPrefix} 🎨 START RENDER`)
    let pdfBuffer
    try {
      console.log(`${logPrefix} Appel generateEstimationPDF...`)
      console.log(`${logPrefix} Formule: ${estimation.formule}, Test mode: true`)
      
      pdfBuffer = await generateEstimationPDF(estimation, estimation.formule, { testMode: true })
      
      console.log(`${logPrefix} ✅ PDF buffer généré: ${pdfBuffer.length} bytes`)
    } catch (pdfError) {
      console.error(`${logPrefix} ❌ ERREUR GÉNÉRATION PDF:`, pdfError)
      console.error(`${logPrefix} Message:`, pdfError.message)
      console.error(`${logPrefix} Code:`, pdfError.code)
      console.error(`${logPrefix} Stack:`, pdfError.stack)
      return NextResponse.json({
        ok: false,
        data: null,
        error: {
          message: pdfError.message || 'Erreur lors du rendu PDF',
          code: pdfError.code || 'PDF_RENDER_ERROR',
          stack: pdfError.stack
        }
      }, { status: 500 })
    }

    // 5. UPLOAD SUR STORAGE
    console.log(`${logPrefix} Étape 5: Upload sur Storage...`)
    const timestamp = Date.now()
    const fileName = `TEST_estimation_${id}_${timestamp}.pdf`
    const filePath = `estimations/${fileName}`
    
    console.log(`${logPrefix} 📁 Upload path: ${filePath}`)
    
    // 🔍 PISTE 5: STORAGE SUPABASE
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('estimations')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error(`${logPrefix} ❌ Erreur upload storage:`, uploadError)
      console.error(`${logPrefix} Upload error détails:`, JSON.stringify(uploadError, null, 2))
      return NextResponse.json({
        ok: false,
        data: null,
        error: {
          message: 'Erreur lors de l\'upload du PDF',
          details: uploadError.message,
          code: uploadError.code || 'STORAGE_ERROR',
          hint: uploadError.hint
        }
      }, { status: 500 })
    }

    console.log(`${logPrefix} ✅ Upload réussi:`, uploadData)
    console.log(`${logPrefix} 📄 PDF Path: ${filePath}`)

    // 6. METTRE À JOUR L'ESTIMATION AVEC SERVICE ROLE (bypass RLS)
    console.log(`${logPrefix} Étape 6: MAJ base de données avec service role...`)
    
    // 🔍 PISTE 3: SUPABASE SERVICE ROLE POUR UPDATE
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('estimations')
      .update({
        pdf_path: filePath,
        pdf_generated_at: new Date().toISOString(),
        pdf_mode: 'test'
      })
      .eq('id', id)
      .select()

    if (updateError) {
      console.error(`${logPrefix} ❌ Erreur MAJ estimation:`, updateError)
      console.error(`${logPrefix} Update error détails:`, JSON.stringify(updateError, null, 2))
      return NextResponse.json({
        ok: false,
        data: null,
        error: {
          message: 'Erreur mise à jour base de données',
          details: updateError.message,
          code: updateError.code,
          hint: updateError.hint
        }
      }, { status: 500 })
    }
    
    console.log(`${logPrefix} ✅ DB mise à jour:`, updateData)
    console.log(`${logPrefix} === SUCCÈS COMPLET ===`)

    return NextResponse.json({
      ok: true,
      data: {
        pdf_path: filePath,
        pdf_mode: 'test',
        formule: estimation.formule,
        file_size: pdfBuffer.length
      },
      error: null,
      message: 'PDF test généré avec succès',
      warning: '⚠️ Ce PDF est en MODE TEST et ne doit pas être utilisé en production'
    })

  } catch (error) {
    console.error(`${logPrefix} ❌ ERREUR GLOBALE:`, error)
    console.error(`${logPrefix} Message:`, error.message)
    console.error(`${logPrefix} Stack:`, error.stack)
    console.error(`${logPrefix} Name:`, error.name)
    
    // 🔍 LOGS ULTRA-DÉTAILLÉS POUR DEBUG
    return NextResponse.json({
      ok: false,
      data: null,
      error: {
        message: 'Erreur lors de la génération du PDF test',
        details: error.message,
        stack: error.stack,
        name: error.name,
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}
