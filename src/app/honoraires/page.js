import { Card, CardContent, Button } from '@/components/ui'
import styles from './page.module.css'

export const metadata = {
  title: 'Honoraires | JuraBreak Immobilier',
  description: 'Découvrez nos honoraires transparents pour la transaction et la location immobilière dans le Jura. Sans surprise, sans frais cachés.'
}

export default function HonorairesPage() {
  return (
    <div className={styles.honorairesPage}>
      {/* HERO SECTION - Fond vert charte */}
      <section className={styles.hero}>
        <div className={styles.heroPattern}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Honoraires</h1>
          <p className={styles.heroSubtitle}>
            Transparence totale, sans surprise, sans frais cachés
          </p>
        </div>
      </section>

      {/* NAVIGATION INTERNE */}
      <nav className={styles.nav}>
        <a href="#transaction" className={styles.navLink}>Transaction</a>
        <a href="#location" className={styles.navLink}>Location</a>
      </nav>

      {/* CONTENU PRINCIPAL */}
      <div className={styles.mainContent}>
        {/* CARD 1: TRANSACTION */}
        <Card id="transaction" hoverable padding="lg" className={styles.card}>
          <CardContent>
            <h2 className={styles.cardTitle}>Honoraires de transaction</h2>
            
            {/* Tableau des honoraires */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Type de bien</th>
                    <th>Honoraires TTC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Maison supérieure à 100 000€</td>
                    <td className={styles.price}>7 000€</td>
                  </tr>
                  <tr>
                    <td>Appartement supérieur à 100 000€</td>
                    <td className={styles.price}>6 000€</td>
                  </tr>
                  <tr>
                    <td>Immeuble supérieur à 100 000€</td>
                    <td className={styles.price}>9 000€</td>
                  </tr>
                  <tr>
                    <td>Immeuble supérieur à 500 000€</td>
                    <td className={styles.price}>15 000€</td>
                  </tr>
                  <tr>
                    <td>Bien de 50 000€ à 100 000€</td>
                    <td className={styles.price}>5 000€</td>
                  </tr>
                  <tr>
                    <td>Bien de 30 000€ à 49 999€</td>
                    <td className={styles.price}>3 500€</td>
                  </tr>
                  <tr>
                    <td>Bien de moins de 30 000€</td>
                    <td className={styles.price}>2 500€</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Encart Estimation */}
            <div className={styles.estimationBox}>
              <div className={styles.estimationBadge}>Estimation</div>
              <p className={styles.estimationText}>
                <strong>150€ TTC</strong> + frais de déplacement selon la localisation du bien
              </p>
            </div>

            {/* Texte explicatif */}
            <div className={styles.infoBox}>
              <svg className={styles.infoIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className={styles.infoText}>
                Les honoraires incluent le remboursement des diagnostics obligatoires lors de la vente définitive, 
                des photos avec une photographe professionnelle ainsi qu'un chiffrage lorsque le bien a besoin de travaux.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: LOCATION */}
        <Card id="location" hoverable padding="lg" className={styles.card}>
          <CardContent>
            <h2 className={styles.cardTitle}>Honoraires de location</h2>
            
            {/* Tableau des honoraires location */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Loyer hors charges</th>
                    <th>Honoraires</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>De 1€ à 399€</td>
                    <td className={styles.price}>80% du loyer</td>
                  </tr>
                  <tr>
                    <td>De 400€ à 799€</td>
                    <td className={styles.price}>75% du loyer</td>
                  </tr>
                  <tr>
                    <td>De 800€ à 1 499€</td>
                    <td className={styles.price}>60% du loyer</td>
                  </tr>
                  <tr>
                    <td>État des lieux</td>
                    <td className={styles.price}>3€ le m²</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Avantage */}
            <div className={styles.advantageBox}>
              <svg className={styles.advantageIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className={styles.advantageText}>
                <strong>Pas de frais de publicité</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
