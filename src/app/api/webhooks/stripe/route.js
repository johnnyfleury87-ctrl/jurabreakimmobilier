import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { generateEstimationPDF } from '@/lib/pdfGenerator'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  
  let event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
  
  // Traiter l'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    
    const estimationId = session.metadata.estimation_id
    const formule = session.metadata.formule
    
    if (estimationId) {
      const supabase = createAdminClient()
      
      // Générer un token unique pour le téléchargement sécurisé du PDF
      const downloadToken = crypto.randomUUID()
      
      // Mettre à jour l'estimation
      const { error } = await supabase
        .from('estimations')
        .update({
          statut: 'PAID',
          stripe_payment_intent_id: session.payment_intent,
          prix_paye: session.amount_total / 100,
          download_token: downloadToken  // ✅ Token unique pour download
        })
        .eq('id', estimationId)
      
      if (error) {
        console.error('Error updating estimation:', error)
      } else {
        console.log(`Payment completed for estimation ${estimationId}`)
        
        // Générer le PDF de l'estimation
        try {
          // Récupérer les données complètes de l'estimation
          const { data: estimation, error: fetchError } = await supabase
            .from('estimations')
            .select('*')
            .eq('id', estimationId)
            .single()
          
          if (fetchError || !estimation) {
            console.error('Error fetching estimation for PDF:', fetchError)
          } else {
            // ⚠️ IDEMPOTENCE : Vérifier si PDF déjà généré
            // Si webhook Stripe arrive 2 fois, on ne génère pas 2 PDF
            if (estimation.pdf_path) {
              console.log(`PDF already exists for estimation ${estimationId}, skipping generation`)
            } else {
              // Générer le PDF
              const pdfBuffer = await generateEstimationPDF(estimation, formule)
            
              // Uploader dans Supabase Storage (bucket 'estimations' privé)
              const fileName = `estimation_${estimationId}_${Date.now()}.pdf`
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('estimations')
                .upload(fileName, pdfBuffer, {
                  contentType: 'application/pdf',
                  cacheControl: '3600',
                  upsert: false
                })
              
              if (uploadError) {
                console.error('Error uploading PDF:', uploadError)
              } else {
                // Stocker le path Storage (pas l'URL signée)
                // L'URL signée sera générée server-side à la demande
                await supabase
                  .from('estimations')
                  .update({ pdf_path: fileName })
                  .eq('id', estimationId)
                
                console.log(`PDF generated and uploaded: ${fileName}`)
                  
                // TODO: Envoyer email avec lien vers le PDF
                // Note: Nécessite configuration d'un service email (Resend, Sendgrid, etc.)
              }
            }
          }
        } catch (pdfError) {
          console.error('Error generating PDF:', pdfError)
        }
        
        // Si formule 2, notification pour visite sur place
        if (formule === 'formule_2') {
          console.log('Formule 2: Schedule on-site visit - TODO: Send notification to admin')
        }
      }
    }
  }
  
  return NextResponse.json({ received: true })
}
