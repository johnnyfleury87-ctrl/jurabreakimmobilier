import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * API GET /api/estimation/communes?code_postal=xxxxx
 * Retourne les communes actives pour un code postal donné
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const codePostal = searchParams.get('code_postal')
    
    if (!codePostal) {
      return NextResponse.json(
        { error: 'Code postal requis' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Récupérer les communes actives pour ce code postal
    const { data: communes, error } = await supabase
      .from('estimation_communes')
      .select(`
        id,
        nom,
        code_postal,
        prix_m2_reference,
        zone:estimation_zones(nom)
      `)
      .eq('code_postal', codePostal)
      .eq('actif', true)
      .order('nom')
    
    if (error) {
      console.error('Erreur récupération communes:', error)
      return NextResponse.json(
        { error: 'Erreur récupération communes' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      communes: communes || [],
      count: communes?.length || 0
    })
    
  } catch (error) {
    console.error('Erreur API communes:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
