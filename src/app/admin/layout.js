import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/auth/config'
import Link from 'next/link'

export default async function AdminLayout({ children }) {
  try {
    // Vérifier les variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', color: '#dc2626' }}>❌ Configuration manquante</h1>
          <p style={{ color: '#666', textAlign: 'center' }}>
            Les variables d&apos;environnement Supabase ne sont pas configurées.<br/>
            Vérifiez votre fichier .env.local
          </p>
          <Link 
            href="/" 
            style={{ 
              marginTop: '1rem', 
              color: '#2d6a4f', 
              textDecoration: 'underline' 
            }}
          >
            ← Retour au site
          </Link>
        </div>
      )
    }

    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Erreur auth admin:', authError)
      redirect('/admin/login')
    }
    
    if (!user) {
      redirect('/admin/login')
    }
    
    // Vérifier si l'email est autorisé
    if (!isAdminEmail(user.email)) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', color: '#dc2626' }}>🚫 Accès non autorisé</h1>
          <p style={{ color: '#666', textAlign: 'center' }}>
            Votre compte ({user.email}) n&apos;a pas les permissions nécessaires pour accéder à l&apos;administration.
          </p>
          <p style={{ color: '#999', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Emails autorisés : contact@jurabreak.fr, lolita@jurabreak.fr
          </p>
          <Link 
            href="/" 
            style={{ 
              marginTop: '1rem', 
              color: '#2d6a4f', 
              textDecoration: 'underline' 
            }}
          >
            ← Retour au site
          </Link>
        </div>
      )
    }
    
    return (
      <div>
        {children}
      </div>
    )
  } catch (error) {
    console.error('Erreur critique AdminLayout:', error)
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#dc2626' }}>⚠️ Erreur système</h1>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Une erreur est survenue lors de la vérification des permissions.
        </p>
        <p style={{ 
          fontFamily: 'monospace', 
          fontSize: '0.875rem', 
          color: '#999',
          backgroundColor: '#f5f5f5',
          padding: '0.5rem',
          borderRadius: '4px',
          maxWidth: '600px',
          overflow: 'auto'
        }}>
          {error.message}
        </p>
        <Link 
          href="/admin/login" 
          style={{ 
            marginTop: '1rem', 
            color: '#2d6a4f', 
            textDecoration: 'underline' 
          }}
        >
          ↻ Réessayer la connexion
        </Link>
      </div>
    )
  }
}
