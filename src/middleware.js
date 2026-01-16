import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

/**
 * Middleware Next.js pour protéger les routes admin
 * Vérifie la session Supabase avant d'autoriser l'accès
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Routes à protéger
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  const isAdminApiRoute = pathname.startsWith('/api/admin')
  
  // Laisser passer les autres routes
  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next()
  }
  
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  
  // Bypass dev (JAMAIS en production)
  const devBypass = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === 'true'
  if (devBypass && !isProduction) {
    return NextResponse.next()
  }
  
  // Créer une response pour manipuler les cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  // Créer le client Supabase avec gestion des cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
  
  // Vérifier la session
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Pas de user ou erreur auth
  if (error || !user) {
    if (isProduction) {
      console.warn(`⚠️ [MIDDLEWARE] Accès refusé à ${pathname} - Pas de session`)
    }
    
    // Redirection vers login pour les pages admin
    if (isAdminRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // 401 pour les API routes
    if (isAdminApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Session required' },
        { status: 401 }
      )
    }
  }
  
  // Session valide, continuer
  return response
}

// Configuration du matcher pour optimiser les performances
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - fichiers publics (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
