import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request, { params }) {
  const { id } = params
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  // Vérifier que le token est fourni
  if (!token) {
    return NextResponse.json(
      { error: 'Token de téléchargement manquant' },
      { status: 400 }
    )
  }
  
  const supabase = createClient()
  
  // Vérifier que l'estimation existe et que le token correspond
  const { data: estimation, error } = await supabase
    .from('estimations')
    .select('id, email, pdf_path, statut, download_token')
    .eq('id', id)
    .single()
  
  if (error || !estimation) {
    return NextResponse.json(
      { error: 'Estimation introuvable' },
      { status: 404 }
    )
  }
  
  // Vérifier que le token correspond
  if (estimation.download_token !== token) {
    return NextResponse.json(
      { error: 'Token de téléchargement invalide' },
      { status: 403 }
    )
  }
  
  // Vérifier que le PDF existe
  if (!estimation.pdf_path) {
    return NextResponse.json(
      { error: 'PDF non disponible' },
      { status: 404 }
    )
  }
  
  // Vérifier que l'estimation est payée
  if (estimation.statut !== 'PAID' && estimation.statut !== 'COMPLETED') {
    return NextResponse.json(
      { error: 'PDF non disponible pour cette estimation' },
      { status: 403 }
    )
  }
  
  // Générer URL signée valide 5 minutes (accès temporaire)
  const adminSupabase = createAdminClient()
  const { data: urlData, error: urlError } = await adminSupabase.storage
    .from('estimations')
    .createSignedUrl(estimation.pdf_path, 300) // 5 minutes
  
  if (urlError || !urlData?.signedUrl) {
    console.error('Error generating signed URL:', urlError)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du lien de téléchargement' },
      { status: 500 }
    )
  }
  
  // Rediriger vers l'URL signée temporaire
  return NextResponse.redirect(urlData.signedUrl)
}
