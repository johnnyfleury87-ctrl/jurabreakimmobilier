import { NextResponse } from 'next/server'
import { checkApiAdminAuth } from '@/lib/auth/apiAuth'
import { calculerHonoraires } from '@/lib/honoraires'
import { revalidatePath } from 'next/cache'

// Force dynamic rendering car on utilise cookies/session
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: Récupérer une annonce spécifique
export async function GET(request, { params }) {
  try {
    const { supabase, user, error: authError } = await checkApiAdminAuth()
    if (authError) return authError
    
    const { id } = await params
    
    const { data: annonce, error } = await supabase
      .from('annonces')
      .select(`
        *,
        annonce_photos(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    if (!annonce) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ annonce })
  } catch (error) {
    console.error('Erreur GET /api/admin/annonces/[id]:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT: Mettre à jour une annonce
export async function PUT(request, { params }) {
  try {
    const { supabase, user, error: authError } = await checkApiAdminAuth()
    if (authError) return authError
    
    const { id } = await params
    
    const body = await request.json()
    
    // Recalculer les honoraires si les données financières ont changé
    const honorairesCalcules = calculerHonoraires({
      typeTransaction: body.type_transaction || 'VENTE',
      typeBien: body.type_bien,
      prix: parseFloat(body.prix) || 0,
      loyerHC: parseFloat(body.loyer_hc) || 0,
      surfaceM2: parseFloat(body.surface_m2) || 0
    })
    
    // Préparer les données de mise à jour
    const updateData = {
      titre: body.titre,
      slug: body.slug,
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
      mode_affichage: body.mode_affichage || 'statique',
      
      statut: body.statut,
      visible: body.visible,
      published_at: body.visible && !body.published_at ? new Date().toISOString() : body.published_at,
      
      // Honoraires recalculés automatiquement
      honoraires_transaction: honorairesCalcules.type === 'VENTE' ? honorairesCalcules.total : null,
      honoraires_location: honorairesCalcules.type === 'LOCATION' ? honorairesCalcules.honorairesLocation : null,
      honoraires_etat_lieux: honorairesCalcules.type === 'LOCATION' ? honorairesCalcules.honorairesEtatLieux : null,
      
      ordre_affichage: body.ordre_affichage || 0,
      updated_at: new Date().toISOString()
    }
    
    // Mettre à jour
    const { data: annonce, error } = await supabase
      .from('annonces')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    // Revalider le cache
    try {
      revalidatePath('/annonces')
      revalidatePath(`/annonces/${annonce.slug}`)
    } catch (revalError) {
      console.error('Erreur revalidation:', revalError)
    }
    
    return NextResponse.json({ 
      annonce,
      message: 'Annonce mise à jour avec succès',
      honoraires: honorairesCalcules
    })
    
  } catch (error) {
    console.error('Erreur PUT /api/admin/annonces/[id]:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE: Supprimer une annonce (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { supabase, user, error: authError } = await checkApiAdminAuth()
    if (authError) return authError
    
    const { id } = await params
    
    // Soft delete
    const { error } = await supabase
      .from('annonces')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        visible: false
      })
      .eq('id', id)
    
    if (error) throw error
    
    // Revalider le cache
    try {
      revalidatePath('/annonces')
    } catch (revalError) {
      console.error('Erreur revalidation:', revalError)
    }
    
    return NextResponse.json({ 
      message: 'Annonce supprimée avec succès' 
    })
    
  } catch (error) {
    console.error('Erreur DELETE /api/admin/annonces/[id]:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
