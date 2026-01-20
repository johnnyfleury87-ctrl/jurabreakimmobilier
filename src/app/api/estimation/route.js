import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculerEstimation, getReglesCalcul } from '@/lib/estimation/calculator'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * API POST /api/estimation
 * Conforme à docs/estimation.md
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // =====================================================================
    // VALIDATION - Étape 1 : User ID obligatoire
    // =====================================================================
    if (!body.user_id) {
      return NextResponse.json(
        { error: 'Authentification requise. Vous devez créer un compte.' },
        { status: 401 }
      )
    }
    
    // =====================================================================
    // VALIDATION - Étape 2 : Motif obligatoire
    // =====================================================================
    const motifsValides = ['curiosite', 'vente', 'divorce', 'succession', 'notaire', 'autre']
    if (!body.motif || !motifsValides.includes(body.motif)) {
      return NextResponse.json(
        { error: 'Motif d\'estimation requis' },
        { status: 400 }
      )
    }
    
    if (body.motif === 'autre' && !body.motif_autre_detail) {
      return NextResponse.json(
        { error: 'Précision requise pour le motif "Autre"' },
        { status: 400 }
      )
    }
    
    // =====================================================================
    // VALIDATION - Étape 3 : Données du bien
    // =====================================================================
    if (!body.type_bien || !body.surface_habitable || !body.commune_nom || !body.code_postal || !body.etat_bien) {
      return NextResponse.json(
        { error: 'Données du bien incomplètes' },
        { status: 400 }
      )
    }
    
    // =====================================================================
    // VALIDATION - Étape 5 : Consentement légal obligatoire
    // =====================================================================
    if (!body.consentement_accepte) {
      return NextResponse.json(
        { error: 'Vous devez accepter les conditions légales' },
        { status: 400 }
      )
    }
    
    // Récupérer IP pour traçabilité
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // =====================================================================
    // CALCUL DE L'ESTIMATION (côté serveur)
    // =====================================================================
    const regles = await getReglesCalcul(supabase)
    
    const inputs = {
      surface_habitable: parseFloat(body.surface_habitable),
      surface_terrain: body.surface_terrain ? parseFloat(body.surface_terrain) : null,
      type_bien: body.type_bien,
      etat_bien: body.etat_bien,
      commune_id: body.commune_id || null,
      annee_construction: body.annee_construction ? parseInt(body.annee_construction) : null,
      options_selectionnees: body.options_selectionnees || []
    }
    
    const resultat = calculerEstimation(inputs, regles)
    
    // =====================================================================
    // CRÉATION EN BASE
    // =====================================================================
    const formule = body.formule || 'gratuite'
    
    // Vérifier la config de la formule
    const { data: configFormule } = await supabase
      .from('estimation_config_formules')
      .select('*')
      .eq('formule', formule)
      .eq('actif', true)
      .single()
    
    if (!configFormule) {
      return NextResponse.json(
        { error: 'Formule non disponible' },
        { status: 400 }
      )
    }
    
    // Vérifier les champs premium si requis
    if (configFormule.champs_premium_requis) {
      if (!body.nb_pieces || !body.nb_chambres || !body.environnement || !body.travaux) {
        return NextResponse.json(
          { error: 'Champs supplémentaires requis pour la formule Premium' },
          { status: 400 }
        )
      }
    }
    
    const downloadToken = crypto.randomBytes(32).toString('hex')
    
    const insertData = {
      user_id: body.user_id,
      nom: body.nom || '',
      prenom: body.prenom || '',
      email: body.email || '',
      telephone: body.telephone || null,
      motif: body.motif,
      motif_autre_detail: body.motif === 'autre' ? body.motif_autre_detail : null,
      type_bien: body.type_bien,
      surface_habitable: parseFloat(body.surface_habitable),
      surface_terrain: body.surface_terrain ? parseFloat(body.surface_terrain) : null,
      commune_id: body.commune_id || null,
      commune_nom: body.commune_nom,
      code_postal: body.code_postal,
      annee_construction: body.annee_construction ? parseInt(body.annee_construction) : null,
      etat_bien: body.etat_bien,
      options_selectionnees: body.options_selectionnees || [],
      
      // Champs premium (si fournis)
      nb_pieces: body.nb_pieces ? parseInt(body.nb_pieces) : null,
      nb_chambres: body.nb_chambres ? parseInt(body.nb_chambres) : null,
      environnement: body.environnement || null,
      travaux: body.travaux || null,
      
      consentement_accepte: true,
      consentement_ip: ip,
      consentement_at: new Date().toISOString(),
      formule: formule,
      statut_paiement: formule === 'gratuite' ? 'PAID' : 'PENDING',
      paiement_at: formule === 'gratuite' ? new Date().toISOString() : null,
      calcul_inputs: inputs,
      calcul_detail: resultat.detail,
      valeur_basse: resultat.valeur_basse,
      valeur_mediane: resultat.valeur_mediane,
      valeur_haute: resultat.valeur_haute,
      niveau_fiabilite: resultat.niveau_fiabilite,
      calcule_at: new Date().toISOString(),
      download_token: downloadToken,
      statut: formule === 'gratuite' ? 'CALCULATED' : 'DRAFT'
    }
    
    const { data: estimation, error: dbError } = await supabase
      .from('estimations')
      .insert(insertData)
      .select()
      .single()
    
    if (dbError) {
      console.error('Erreur création estimation:', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'estimation' },
        { status: 500 }
      )
    }
    
    // =====================================================================
    // RETOUR
    // =====================================================================
    if (formule === 'gratuite') {
      // IMPORTANT : Pas de génération PDF pour la formule gratuite
      return NextResponse.json({
        success: true,
        estimation_id: estimation.id,
        formule: 'gratuite',
        resultat: {
          valeur_basse: resultat.valeur_basse,
          valeur_mediane: resultat.valeur_mediane,
          valeur_haute: resultat.valeur_haute,
          niveau_fiabilite: resultat.niveau_fiabilite
        },
        no_pdf: true, // Indication explicite
        download_token: downloadToken
      })
    }
    
    // Formule payante : nécessite paiement avant génération PDF
    return NextResponse.json({
      success: true,
      estimation_id: estimation.id,
      formule: formule,
      requires_payment: true,
      prix: configFormule.prix
    })
    
  } catch (error) {
    console.error('Erreur API estimation:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * API GET /api/estimation?user_id=xxx
 * Historique des estimations
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'user_id requis' },
        { status: 400 }
      )
    }
    
    const { data: estimations, error } = await supabase
      .from('estimations')
      .select('id, motif, commune_nom, surface_habitable, valeur_mediane, statut, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erreur récupération estimations:', error)
      return NextResponse.json(
        { error: 'Erreur récupération' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      estimations
    })
    
  } catch (error) {
    console.error('Erreur API estimation GET:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
