import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Route callback pour l'authentification Supabase
 * Gère les redirections après login (magic link, OAuth, etc.)
 */
export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/admin'
  
  // Log en production pour debugging
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  if (isProduction) {
    console.log('🔄 [PROD] Auth callback:', { 
      hasCode: !!code, 
      next,
      origin: requestUrl.origin 
    })
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Erreur exchange code:', error.message)
        return NextResponse.redirect(
          `${requestUrl.origin}/admin/login?error=auth_callback_failed`
        )
      }
      
      console.log('✅ Auth callback réussi')
      
      // Redirection vers la page demandée
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } catch (err) {
      console.error('❌ Exception auth callback:', err)
      return NextResponse.redirect(
        `${requestUrl.origin}/admin/login?error=auth_exception`
      )
    }
  }

  // Pas de code, redirection directe
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
