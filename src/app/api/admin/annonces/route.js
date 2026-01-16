import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/auth/config'

// GET: Liste toutes les annonces (admin seulement)
export async function GET(request) {
  try {
    const supabase = await createClient()
    
    // Vérifier auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || !isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    // Récupérer toutes les annonces (y compris supprimées pour l'admin)
    const { data: annonces, error } = await supabase
      .from('annonces')
      .select(`
        *,
        annonce_photos(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ annonces })
  } catch (error) {
    console.error('Erreur GET /api/admin/annonces:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST: Créer une nouvelle annonce
export async function POST(request) {
  try {
    const supabase = await createClient()
    
    // Vérifier auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || !isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Générer un slug unique si non fourni
    let slug = body.slug
    if (!slug) {
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_unique_slug', { titre: body.titre })
      
      if (slugError) throw slugError
      slug = slugData
    }
    
    // Préparer les données de l'annonce
    const annonceData = {
      titre: body.titre,
      slug,
      type_bien: body.type_bien,
      description: body.description,
      points_forts: body.points_forts || [],
      
      ville: body.ville,
      code_postal: body.code_postal,
      secteur: body.secteur,
      adresse: body.adresse,
      latitude: body.latitude,
      longitude: body.longitude,
      
      prix: body.prix,
      devise: body.devise || 'EUR',
      charges: body.charges,
      taxe_fonciere: body.taxe_fonciere,
      type_transaction: body.type_transaction || 'VENTE',
      loyer_hc: body.loyer_hc,
      
      surface_m2: body.surface_m2,
      terrain_m2: body.terrain_m2,
      nb_pieces: body.nb_pieces,
      nb_chambres: body.nb_chambres,
      nb_salles_bain: body.nb_salles_bain,
      nb_salles_eau: body.nb_salles_eau,
      etage: body.etage,
      nb_etages_immeuble: body.nb_etages_immeuble,
      annee_construction: body.annee_construction,
      
      chauffage: body.chauffage,
      type_chauffage: body.type_chauffage,
      climatisation: body.climatisation || false,
      ascenseur: body.ascenseur || false,
      balcon: body.balcon || false,
      terrasse: body.terrasse || false,
      jardin: body.jardin || false,
      garage: body.garage || false,
      parking: body.parking || false,
      cave: body.cave || false,
      piscine: body.piscine || false,
      
      dpe: body.dpe,
      ges: body.ges,
      
      video_url: body.video_url,
      visite_virtuelle_url: body.visite_virtuelle_url,
      
      statut: body.statut || 'A_VENDRE',
      visible: body.visible !== undefined ? body.visible : true,
      published_at: body.visible ? new Date().toISOString() : null,
      
      honoraires_transaction: body.honoraires_transaction,
      honoraires_location: body.honoraires_location,
      honoraires_etat_lieux: body.honoraires_etat_lieux,
      
      ordre_affichage: body.ordre_affichage || 0
    }
    
    // Insérer l'annonce
    const { data: annonce, error } = await supabase
      .from('annonces')
      .insert([annonceData])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ 
      annonce,
      message: 'Annonce créée avec succès' 
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erreur POST /api/admin/annonces:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
