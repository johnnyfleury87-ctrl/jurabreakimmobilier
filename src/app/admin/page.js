import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Récupérer quelques statistiques
  const { count: annoncesCount } = await supabase
    .from('annonces')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
  
  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'nouveau')
  
  const { count: estimationsCount } = await supabase
    .from('estimations')
    .select('*', { count: 'exact', head: true })

  return (
    <div className={styles.admin}>
      <nav className={styles.nav}>
        <div className={styles.navHeader}>
          <h2>Admin</h2>
          <Link href="/">← Site public</Link>
        </div>
        <ul>
          <li><Link href="/admin">📊 Dashboard</Link></li>
          <li><Link href="/admin/annonces">🏠 Annonces</Link></li>
          <li><Link href="/admin/leads">📧 Leads</Link></li>
          <li><Link href="/admin/evenements">📅 Événements</Link></li>
          <li><Link href="/admin/estimations">📋 Estimations</Link></li>
          <li><Link href="/admin/settings">⚙️ Paramètres</Link></li>
          <li><Link href="/admin/logout">🚪 Déconnexion</Link></li>
        </ul>
      </nav>
      
      <main className={styles.main}>
        <h1>Tableau de bord</h1>
        
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Annonces actives</h3>
            <p className={styles.statNumber}>{annoncesCount || 0}</p>
            <Link href="/admin/annonces">Gérer →</Link>
          </div>
          
          <div className={styles.statCard}>
            <h3>Nouveaux leads</h3>
            <p className={styles.statNumber}>{leadsCount || 0}</p>
            <Link href="/admin/leads">Voir →</Link>
          </div>
          
          <div className={styles.statCard}>
            <h3>Estimations</h3>
            <p className={styles.statNumber}>{estimationsCount || 0}</p>
            <Link href="/admin/estimations">Consulter →</Link>
          </div>
        </div>
        
        <div className={styles.quickActions}>
          <h2>Actions rapides</h2>
          <div className={styles.actions}>
            <Link href="/admin/annonces/new" className={styles.actionButton}>
              + Nouvelle annonce
            </Link>
            <Link href="/admin/evenements/new" className={styles.actionButton}>
              + Nouvel événement
            </Link>
            <Link href="/admin/settings" className={styles.actionButton}>
              ⚙️ Paramètres du site
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
