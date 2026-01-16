import { NextResponse } from 'next/server'
import { checkApiAdminAuth } from '@/lib/auth/apiAuth'

// Force dynamic rendering car on utilise cookies/session
export const dynamic = 'force-dynamic'
export const revalidate = 0

// DELETE: Supprimer une photo
export async function DELETE(request, { params }) {
  try {
    const { supabase, user, error: authError } = await checkApiAdminAuth()
    if (authError) return authError
    
    const { id, photoId } = await params
    
    // Récupérer la photo
    const { data: photo, error: photoError } = await supabase
      .from('annonce_photos')
      .select('*')
      .eq('id', photoId)
      .eq('annonce_id', id)
      .single()
    
    if (photoError || !photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      )
    }
    
    // Supprimer du Storage si storage_path existe
    if (photo.storage_path) {
      const { error: storageError } = await supabase
        .storage
        .from('annonces')
        .remove([photo.storage_path])
      
      if (storageError) {
        console.error('Erreur suppression Storage:', storageError)
        // On continue quand même pour supprimer l'enregistrement
      }
    }
    
    // Supprimer l'enregistrement
    const { error: deleteError } = await supabase
      .from('annonce_photos')
      .delete()
      .eq('id', photoId)
    
    if (deleteError) throw deleteError
    
    return NextResponse.json({ 
      message: 'Photo supprimée avec succès' 
    })
    
  } catch (error) {
    console.error('Erreur DELETE /api/admin/annonces/[id]/photos/[photoId]:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT: Mettre à jour une photo (position, alt_text, is_cover)
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient()
    const { id, photoId } = await params
    
    // Vérifier auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || !isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Si on définit cette photo comme cover, désactiver les autres
    if (body.is_cover === true) {
      await supabase
        .from('annonce_photos')
        .update({ is_cover: false })
        .eq('annonce_id', id)
    }
    
    // Mettre à jour la photo
    const updateData = {}
    if (body.position !== undefined) updateData.position = body.position
    if (body.alt_text !== undefined) updateData.alt_text = body.alt_text
    if (body.is_cover !== undefined) updateData.is_cover = body.is_cover
    
    const { data: photo, error } = await supabase
      .from('annonce_photos')
      .update(updateData)
      .eq('id', photoId)
      .eq('annonce_id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ 
      photo,
      message: 'Photo mise à jour avec succès' 
    })
    
  } catch (error) {
    console.error('Erreur PUT /api/admin/annonces/[id]/photos/[photoId]:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
