import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * API GET /api/admin/estimation/parametres
 * Récupère les paramètres globaux et config formules
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Vérifier que l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    
    // Récupérer paramètres globaux
    const { data: parametresGlobaux } = await supabase
      .from('estimation_parametres_globaux')
      .select('*')
      .order('cle')
    
    // Récupérer config formules
    const { data: configFormules } = await supabase
      .from('estimation_config_formules')
      .select('*')
      .order('ordre')
    
    return NextResponse.json({
      success: true,
      parametres_globaux: parametresGlobaux || [],
      config_formules: configFormules || []
    })
    
  } catch (error) {
    console.error('Erreur GET parametres:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * API PUT /api/admin/estimation/parametres
 * Met à jour un paramètre global
 */
export async function PUT(request) {
  try {
    const supabase = await createClient()
    
    // Vérifier que l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    
    const body = await request.json()
    const { type, cle, valeur, formule, updates } = body
    
    if (type === 'parametre_global') {
      // Mettre à jour un paramètre global
      const { error } = await supabase
        .from('estimation_parametres_globaux')
        .update({ 
          valeur: valeur,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('cle', cle)
      
      if (error) throw error
      
      return NextResponse.json({
        success: true,
        message: 'Paramètre mis à jour'
      })
    }
    
    if (type === 'config_formule') {
      // Mettre à jour une config formule
      const { error } = await supabase
        .from('estimation_config_formules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('formule', formule)
      
      if (error) throw error
      
      return NextResponse.json({
        success: true,
        message: 'Configuration formule mise à jour'
      })
    }
    
    return NextResponse.json(
      { error: 'Type non reconnu' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Erreur PUT parametres:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
