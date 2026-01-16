import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/images/branding/logo-jurabreak.png" 
            alt="JuraBreak Immobilier - Logo" 
            width={50}
            height={48}
            priority
            className={styles.logoImage}
          />
          <span className={styles.logoText}>JuraBreak Immobilier</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/">Accueil</Link>
          <Link href="/a-propos">À propos</Link>
          <Link href="/honoraires">Honoraires</Link>
          <Link href="/annonces">Annonces</Link>
          <Link href="/evenements">Événements</Link>
          <Link href="/estimation">Estimation</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/admin/login" className={styles.adminLink} title="Espace administration">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
