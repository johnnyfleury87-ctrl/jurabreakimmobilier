import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: Liste les annonces publiques (visibles et publiées uniquement)
export async function GET(request) {
  try {
    const supabase = await createClient()
    
    // Récupérer uniquement les annonces visibles, publiées et non supprimées
    const { data: annonces, error } = await supabase
      .from('annonces')
      .select(`
        *,
        annonce_photos(*)
      `)
      .eq('is_deleted', false)
      .eq('visible', true)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ annonces: annonces || [] })
  } catch (error) {
    console.error('Erreur GET /api/annonces:', error)
    return NextResponse.json(
      { error: error.message, annonces: [] },
      { status: 500 }
    )
  }
}
