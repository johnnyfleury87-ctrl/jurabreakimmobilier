import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // Déterminer si on est en production
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          const value = cookieStore.get(name)?.value
          if (!value && isProduction) {
            console.warn(`⚠️ Cookie manquant en prod: ${name}`)
          }
          return value
        },
        set(name, value, options) {
          try {
            // Configuration des cookies adaptée pour la production Vercel
            const cookieOptions = {
              ...options,
              // Forcer secure en production
              secure: isProduction,
              // sameSite strict pour la sécurité
              sameSite: 'lax',
              // Path par défaut
              path: '/',
              // Durée max (1 an)
              maxAge: 365 * 24 * 60 * 60
            }
            
            cookieStore.set({ name, value, ...cookieOptions })
          } catch (error) {
            // Ne pas avaler l'erreur silencieusement en prod
            if (isProduction) {
              console.error(`❌ Erreur set cookie ${name}:`, error.message)
            }
            // Cookies can only be set in Server Actions or Route Handlers
          }
        },
        remove(name, options) {
          try {
            const cookieOptions = {
              ...options,
              secure: isProduction,
              sameSite: 'lax',
              path: '/',
              maxAge: 0
            }
            cookieStore.set({ name, value: '', ...cookieOptions })
          } catch (error) {
            if (isProduction) {
              console.error(`❌ Erreur remove cookie ${name}:`, error.message)
            }
            // Cookies can only be removed in Server Actions or Route Handlers
          }
        },
      },
    }
  )
}
