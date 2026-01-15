import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          JuraBreak Immobilier
        </Link>
        <nav className={styles.nav}>
          <Link href="/">Accueil</Link>
          <Link href="/a-propos">À propos</Link>
          <Link href="/honoraires">Honoraires</Link>
          <Link href="/annonces">Annonces</Link>
          <Link href="/evenements">Événements</Link>
          <Link href="/estimation">Estimation</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
