import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creerVersionRegles } from '@/lib/estimation/calculator'

export const dynamic = 'force-dynamic'

/**
 * API POST /api/admin/estimation/create-version
 * Crée un snapshot des règles actuelles (versioning)
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    
    // Vérifier que l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { description } = body
    
    if (!description) {
      return NextResponse.json(
        { error: 'Description requise' },
        { status: 400 }
      )
    }
    
    // Créer la version
    const version = await creerVersionRegles(supabase, description, user.id)
    
    return NextResponse.json({
      success: true,
      version
    })
    
  } catch (error) {
    console.error('Erreur création version:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
