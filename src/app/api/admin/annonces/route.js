import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/auth/config'
import { calculerHonoraires } from '@/lib/honoraires'
import { revalidatePath } from 'next/cache'

// GET: Liste toutes les annonces (admin seulement)
export async function GET(request) {
  try {
    const supabase = await createClient()
    
    // Vérifier auth avec logs détaillés
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔍 GET /api/admin/annonces - Auth check:', {
      hasUser: !!user,
      email: user?.email,
      authError: authError?.message
    })
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Erreur d\'authentification', details: authError.message },
        { status: 401 }
      )
    }
    
    if (!user) {
      console.error('❌ Pas d\'utilisateur')
      return NextResponse.json(
        { error: 'Non authentifié - aucun utilisateur détecté' },
        { status: 401 }
      )
    }
    
    if (!isAdminEmail(user.email)) {
      console.error('❌ Email non autorisé:', user.email)
      return NextResponse.json(
        { error: 'Non autorisé - email non dans l\'allowlist', email: user.email },
        { status: 403 }
      )
    }
    
    console.log('✅ Admin autorisé:', user.email)
    
    // Récupérer toutes les annonces (y compris supprimées pour l'admin)
    const { data: annonces, error } = await supabase
      .from('annonces')
      .select(`
        *,
        annonce_photos(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erreur DB:', error)
      throw error
    }
    
    console.log(`✅ ${annonces?.length || 0} annonces récupérées`)
    
    return NextResponse.json({ annonces })
  } catch (error) {
    console.error('❌ Erreur GET /api/admin/annonces:', error)
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
    
    // Calculer automatiquement les honoraires
    const honorairesCalcules = calculerHonoraires({
      typeTransaction: body.type_transaction || 'VENTE',
      typeBien: body.type_bien,
      prix: parseFloat(body.prix) || 0,
      loyerHC: parseFloat(body.loyer_hc) || 0,
      surfaceM2: parseFloat(body.surface_m2) || 0
    })
    
    // Générer un slug unique si non fourni
    let slug = body.slug
    if (!slug) {
      // Créer un slug simple basé sur le titre
      const baseSlug = body.titre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Ajouter un timestamp pour garantir l'unicité
      slug = `${baseSlug}-${Date.now()}`
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
      published_at: body.published_at || (body.visible ? new Date().toISOString() : null),
      
      // Honoraires calculés automatiquement
      honoraires_transaction: honorairesCalcules.type === 'VENTE' ? honorairesCalcules.total : null,
      honoraires_location: honorairesCalcules.type === 'LOCATION' ? honorairesCalcules.honorairesLocation : null,
      honoraires_etat_lieux: honorairesCalcules.type === 'LOCATION' ? honorairesCalcules.honorairesEtatLieux : null,
      
      ordre_affichage: body.ordre_affichage || 0
    }
    
    // Insérer l'annonce
    const { data: annonce, error } = await supabase
      .from('annonces')
      .insert([annonceData])
      .select()
      .single()
    
    if (error) throw error
    
    // Revalider le cache des pages publiques
    try {
      revalidatePath('/annonces')
      revalidatePath(`/annonces/${annonce.slug}`)
    } catch (revalError) {
      console.error('Erreur revalidation:', revalError)
    }
    
    return NextResponse.json({ 
      annonce,
      message: 'Annonce créée avec succès',
      honoraires: honorairesCalcules
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erreur POST /api/admin/annonces:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
