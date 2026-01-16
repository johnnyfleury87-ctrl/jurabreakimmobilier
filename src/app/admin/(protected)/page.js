import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

// Force dynamic rendering car on utilise auth/session
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  try {
    const supabase = await createClient()
    
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Erreur getUser:', userError)
    }
    
    // Récupérer les statistiques réelles avec gestion d'erreur
    let annoncesCount = 0
    
    try {
      const { count, error } = await supabase
        .from('annonces')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
      
      if (error) {
        console.error('Erreur count annonces:', error)
      } else {
        annoncesCount = count || 0
      }
    } catch (e) {
      console.error('Erreur annonces:', e)
    }

    return (
      <div className={styles.admin}>
        <nav className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>JuraBreak Admin</h2>
            <Link href="/" className={styles.publicLink}>← Site public</Link>
          </div>
          <ul className={styles.menu}>
            <li><Link href="/admin" className={styles.active}>📊 Dashboard</Link></li>
            <li><Link href="/admin/annonces">🏠 Annonces</Link></li>
          </ul>
          <div className={styles.sidebarFooter}>
            <p className={styles.userInfo}>
              <span className={styles.userIcon}>👤</span>
              {user?.email || 'Inconnu'}
            </p>
            <Link href="/admin/logout" className={styles.logoutLink}>
              🚪 Déconnexion
            </Link>
          </div>
        </nav>
        
        <main className={styles.content}>
          <div className={styles.header}>
            <h1>Tableau de bord</h1>
            <p className={styles.subtitle}>Vue d&apos;ensemble de votre activité</p>
          </div>
          
          <div className={styles.cards}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🏠</div>
              <div className={styles.cardContent}>
                <h3>Annonces</h3>
                <p className={styles.cardNumber}>{annoncesCount}</p>
                <p className={styles.cardLabel}>Annonces actives</p>
              </div>
              <Link href="/admin/annonces" className={styles.cardLink}>
                Gérer →
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Erreur critique AdminDashboard:', error)
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
        <h1 style={{ fontSize: '2rem', color: '#dc2626' }}>⚠️ Erreur</h1>
        <p style={{ color: '#666' }}>
          Impossible de charger le dashboard admin
        </p>
        <p style={{ 
          fontFamily: 'monospace', 
          fontSize: '0.875rem', 
          color: '#999',
          backgroundColor: '#f5f5f5',
          padding: '0.5rem',
          borderRadius: '4px'
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
          ↻ Réessayer
        </Link>
      </div>
    )
  }
}

