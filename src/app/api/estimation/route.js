import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    
    // Validation
    if (!data.nom || !data.prenom || !data.email || !data.adresse_bien || !data.type_bien || !data.surface || !data.formule) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }
    
    // Créer l'estimation en DB
    const insertData = {
      formule: data.formule,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      telephone: data.telephone || null,
      adresse_bien: data.adresse_bien,
      type_bien: data.type_bien,
      surface: parseFloat(data.surface),
      nb_pieces: data.nb_pieces ? parseInt(data.nb_pieces) : null,
      annee_construction: data.annee_construction ? parseInt(data.annee_construction) : null,
      etat_general: data.etat_general || null,
      travaux: data.travaux || null,
      environnement: data.environnement || null,
      statut: 'DRAFT'
    }
    
    // Ajouter terms_accepted_at pour formules payantes si CGV acceptées
    if ((data.formule === 'formule_1' || data.formule === 'formule_2') && data.termsAccepted) {
      insertData.terms_accepted_at = new Date().toISOString()
    }
    
    const { data: estimation, error: dbError } = await supabase
      .from('estimations')
      .insert(insertData)
      .select()
      .single()
    
    if (dbError) {
      console.error('Error creating estimation:', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'estimation' },
        { status: 500 }
      )
    }
    
    // Si formule gratuite, générer estimation automatique et retourner
    if (data.formule === 'formule_0') {
      // Calcul automatique simplifié (prix au m² estimé)
      const prixM2Moyen = 2400 // Prix moyen au m² dans le Jura (à ajuster selon secteur)
      const surface = parseFloat(data.surface)
      const estimationBasse = Math.round(surface * prixM2Moyen * 0.85)
      const estimationHaute = Math.round(surface * prixM2Moyen * 1.15)
      const estimationMoyenne = Math.round((estimationBasse + estimationHaute) / 2)
      
      // Stocker les données d'estimation
      const estimationData = {
        prix_m2: prixM2Moyen,
        estimation_basse: estimationBasse,
        estimation_haute: estimationHaute,
        estimation_moyenne: estimationMoyenne,
        calculated_at: new Date().toISOString()
      }
      
      // Mettre à jour l'estimation avec les résultats
      await supabase
        .from('estimations')
        .update({
          estimation_data: estimationData,
          statut: 'COMPLETED'
        })
        .eq('id', estimation.id)
      
      return NextResponse.json({
        id: estimation.id,
        formule: 'formule_0'
      })
    }
    
    // Si formule payante, créer Stripe Checkout Session
    const priceId = data.formule === 'formule_1' 
      ? process.env.STRIPE_PRICE_ID_FORMULE1
      : process.env.STRIPE_PRICE_ID_FORMULE2
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      )
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/estimation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/estimation?cancelled=true`,
      client_reference_id: estimation.id,
      customer_email: data.email,
      metadata: {
        estimation_id: estimation.id,
        formule: data.formule
      }
    })
    
    // Mettre à jour l'estimation avec le session ID
    await supabase
      .from('estimations')
      .update({ 
        stripe_checkout_session_id: session.id 
      })
      .eq('id', estimation.id)
    
    return NextResponse.json({
      id: estimation.id,
      checkoutUrl: session.url
    })
    
  } catch (error) {
    console.error('Error in estimation API:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
