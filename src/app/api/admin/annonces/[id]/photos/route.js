import { NextResponse } from 'next/server'
import { checkApiAdminAuth } from '@/lib/auth/apiAuth'

// Force dynamic rendering car on utilise cookies/session
export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST: Upload une photo pour une annonce
export async function POST(request, { params }) {
  try {
    const { supabase, user, error: authError } = await checkApiAdminAuth()
    if (authError) return authError
    
    const { id } = await params
    
    // Vérifier que l'annonce existe
    const { data: annonce, error: annonceError } = await supabase
      .from('annonces')
      .select('id')
      .eq('id', id)
      .single()
    
    if (annonceError || !annonce) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file')
    const position = parseInt(formData.get('position') || '0')
    const altText = formData.get('alt_text') || ''
    const isCover = formData.get('is_cover') === 'true'
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }
    
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Upload vers Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('annonces')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Erreur upload Storage:', uploadError)
      throw uploadError
    }
    
    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase
      .storage
      .from('annonces')
      .getPublicUrl(fileName)
    
    // Si c'est la photo de couverture, désactiver les autres
    if (isCover) {
      await supabase
        .from('annonce_photos')
        .update({ is_cover: false })
        .eq('annonce_id', id)
    }
    
    // Insérer l'enregistrement de la photo
    const { data: photo, error: photoError } = await supabase
      .from('annonce_photos')
      .insert([{
        annonce_id: id,
        url: publicUrl,
        storage_path: fileName,
        position,
        alt_text: altText,
        is_cover: isCover,
        file_size: file.size
      }])
      .select()
      .single()
    
    if (photoError) throw photoError
    
    return NextResponse.json({ 
      photo,
      message: 'Photo uploadée avec succès' 
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erreur POST /api/admin/annonces/[id]/photos:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// GET: Liste les photos d'une annonce
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Vérifier auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || !isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const { data: photos, error } = await supabase
      .from('annonce_photos')
      .select('*')
      .eq('annonce_id', id)
      .order('position', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ photos })
    
  } catch (error) {
    console.error('Erreur GET /api/admin/annonces/[id]/photos:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
