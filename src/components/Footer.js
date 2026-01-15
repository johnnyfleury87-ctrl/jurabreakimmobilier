import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>JuraBreak Immobilier</h3>
            <p>Votre agence immobilière dans le Jura</p>
          </div>
          <div className={styles.section}>
            <h4>Contact</h4>
            <p>Email: contact@jurabreak.fr</p>
            <p>Tél: 06 XX XX XX XX</p>
          </div>
          <div className={styles.section}>
            <h4>Liens</h4>
            <p><a href="/mentions-legales">Mentions légales</a></p>
            <p><a href="/politique-confidentialite">Politique de confidentialité</a></p>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} JuraBreak Immobilier. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
