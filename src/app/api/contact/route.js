import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    
    // Validation basique
    if (!data.nom || !data.prenom || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }
    
    // Insérer le lead dans la base
    const { error } = await supabase
      .from('leads')
      .insert({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone || null,
        message: data.message,
        annonce_id: data.annonce_id || null,
        type_demande: data.type_demande || 'contact',
        statut: 'nouveau'
      })
    
    if (error) {
      console.error('Error inserting lead:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement' },
        { status: 500 }
      )
    }
    
    // TODO: Envoyer un email de notification si configuré
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in contact API:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
