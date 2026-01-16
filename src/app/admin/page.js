import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  
  // Récupérer les statistiques réelles
  const { count: annoncesCount } = await supabase
    .from('annonces')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
  
  const { count: contactsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'nouveau')
  
  const { count: estimationsCount } = await supabase
    .from('estimations')
    .select('*', { count: 'exact', head: true })
  
  const { count: evenementsCount } = await supabase
    .from('evenements')
    .select('*', { count: 'exact', head: true })

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
          <li><Link href="/admin/leads">📧 Messages contact</Link></li>
          <li><Link href="/admin/estimations">📋 Estimations</Link></li>
          <li><Link href="/admin/evenements">📅 Événements</Link></li>
          <li><Link href="/admin/settings">⚙️ Paramètres</Link></li>
        </ul>
        <div className={styles.sidebarFooter}>
          <p className={styles.userInfo}>
            <span className={styles.userIcon}>👤</span>
            {user?.email}
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
            <div className={styles.cardIcon}>📧</div>
            <div className={styles.cardContent}>
              <h3>Messages contact</h3>
              <p className={styles.cardNumber}>{contactsCount || 0}</p>
              <p className={styles.cardLabel}>Nouveaux messages</p>
            </div>
            <Link href="/admin/leads" className={styles.cardLink}>
              Consulter →
            </Link>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardIcon}>📋</div>
            <div className={styles.cardContent}>
              <h3>Estimations</h3>
              <p className={styles.cardNumber}>{estimationsCount || 0}</p>
              <p className={styles.cardLabel}>Demandes d&apos;estimation</p>
            </div>
            <Link href="/admin/estimations" className={styles.cardLink}>
              Consulter →
            </Link>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardIcon}>🏠</div>
            <div className={styles.cardContent}>
              <h3>Annonces</h3>
              <p className={styles.cardNumber}>{annoncesCount || 0}</p>
              <p className={styles.cardLabel}>Annonces actives</p>
            </div>
            <Link href="/admin/annonces" className={styles.cardLink}>
              Gérer →
            </Link>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardIcon}>📅</div>
            <div className={styles.cardContent}>
              <h3>Événements</h3>
              <p className={styles.cardNumber}>{evenementsCount || 0}</p>
              <p className={styles.cardLabel}>Événements publiés</p>
            </div>
            <Link href="/admin/evenements" className={styles.cardLink}>
              Gérer →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

