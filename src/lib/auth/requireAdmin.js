import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from './config'

/**
 * Vérifie que l'utilisateur est admin et authentifié
 * @param {string} pathname - Chemin actuel (pour éviter redirect loop)
 * @returns {Promise<{user, devBypass}>} - User Supabase ou null si bypass dev
 * @throws {redirect} - Redirige vers /admin/login si non connecté (NE PAS CATCH)
 */
export async function requireAdmin(pathname = '') {
  // MODE DEV BYPASS : Permet l'accès admin sans auth en développement
  const devBypassEnabled = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === 'true'
  
  if (devBypassEnabled) {
    console.warn('⚠️ DEV ADMIN BYPASS ACTIF - Ne jamais utiliser en production !')
    return { 
      user: null, 
      devBypass: true,
      email: 'dev-bypass@local.dev'
    }
  }

  // Vérifier les variables d'environnement
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('CONFIG_MISSING')
  }

  const supabase = await createClient()
  
  // Récupérer l'utilisateur
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Si erreur auth ou pas d'utilisateur => redirect login
  // MAIS ne pas rediriger si on est déjà sur /admin/login (avoid loop)
  if (authError || !user) {
    if (!pathname.includes('/admin/login')) {
      redirect('/admin/login')
    }
    // Si on est déjà sur /admin/login, retourner null
    return { user: null, devBypass: false, needsAuth: true }
  }
  
  // Vérifier l'allowlist
  if (!isAdminEmail(user.email)) {
    throw new Error('UNAUTHORIZED')
  }
  
  return { user, devBypass: false, needsAuth: false }
}

/**
 * Composant pour afficher "Accès refusé"
 */
export function AccessDenied({ email }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', color: '#dc2626' }}>🚫 Accès non autorisé</h1>
      <p style={{ color: '#666' }}>
        {email ? (
          <>
            Votre compte <strong>{email}</strong> n&apos;a pas les permissions
            nécessaires pour accéder à l&apos;administration.
          </>
        ) : (
          "Vous n'avez pas les permissions pour accéder à cette page."
        )}
      </p>
      <p style={{ color: '#999', fontSize: '0.875rem', marginTop: '0.5rem' }}>
        Emails autorisés : contact@jurabreak.fr, lolita@jurabreak.fr
      </p>
      <a 
        href="/" 
        style={{ 
          marginTop: '1rem', 
          color: '#2d6a4f', 
          textDecoration: 'underline' 
        }}
      >
        ← Retour au site
      </a>
    </div>
  )
}

/**
 * Composant pour afficher "Configuration manquante"
 */
export function ConfigMissing() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', color: '#dc2626' }}>❌ Configuration manquante</h1>
      <p style={{ color: '#666' }}>
        Les variables d&apos;environnement Supabase ne sont pas configurées.<br/>
        Vérifiez votre fichier .env.local
      </p>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1rem', 
        borderRadius: '8px',
        fontSize: '0.875rem',
        textAlign: 'left'
      }}>
        NEXT_PUBLIC_SUPABASE_URL=...<br/>
        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
      </pre>
      <a 
        href="/" 
        style={{ 
          marginTop: '1rem', 
          color: '#2d6a4f', 
          textDecoration: 'underline' 
        }}
      >
        ← Retour au site
      </a>
    </div>
  )
}
