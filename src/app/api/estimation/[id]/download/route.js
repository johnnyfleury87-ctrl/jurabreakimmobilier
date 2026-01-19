import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEstimationPDF } from '@/lib/estimation/pdfGenerator'

export const dynamic = 'force-dynamic'

/**
 * API GET /api/estimation/[id]/download?token=xxx
 * Téléchargement sécurisé du PDF conforme à docs/estimation.md
 */
export async function GET(request, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // Vérifier l'estimation et le token
    const { data: estimation, error } = await supabase
      .from('estimations')
      .select('*')
      .eq('id', id)
      .eq('download_token', token)
      .single()
    
    if (error || !estimation) {
      return NextResponse.json({ error: 'Introuvable ou token invalide' }, { status: 404 })
    }
    
    // Si PDF déjà généré, le récupérer
    if (estimation.pdf_path) {
      const { data: pdfData, error: storageError } = await supabase
        .storage
        .from('estimations')
        .download(estimation.pdf_path)
      
      if (!storageError && pdfData) {
        const buffer = await pdfData.arrayBuffer()
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="estimation_${id.substring(0, 8)}.pdf"`,
            'Cache-Control': 'no-cache'
          }
        })
      }
    }
    
    // Sinon, générer le PDF
    const { data: mentionLegale } = await supabase
      .from('estimation_mentions_legales')
      .select('*')
      .eq('motif', estimation.motif)
      .eq('actif', true)
      .order('version', { ascending: false })
      .limit(1)
      .single()
    
    const pdfBuffer = await generateEstimationPDF(estimation, mentionLegale)
    
    // Stocker le PDF
    const fileName = `${id}/estimation_${Date.now()}.pdf`
    
    await supabase.storage.from('estimations').upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false
    })
    
    await supabase
      .from('estimations')
      .update({
        pdf_path: fileName,
        pdf_generated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estimation_${id.substring(0, 8)}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error) {
    console.error('Erreur téléchargement PDF:', error)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }
}
