import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/auth/config'
import Link from 'next/link'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  
  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser()
  
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
        <h1 style={{ fontSize: '2rem', color: '#dc2626' }}>Accès non autorisé</h1>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Votre compte ({user.email}) n&apos;a pas les permissions nécessaires pour accéder à l&apos;administration.
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
}
