import Image from 'next/image'
import { Button } from '@/components/ui'
import styles from './page.module.css'

export const metadata = {
  title: 'Honoraires | JuraBreak Immobilier',
  description: 'Découvrez nos honoraires transparents pour la transaction et la location immobilière dans le Jura. Sans surprise, sans frais cachés.'
}

export default function HonorairesPage() {
  return (
    <div className={styles.honorairesPage}>
      {/* HERO SECTION - Fond léger */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>Honoraires</h1>
            <p className={styles.heroSubtitle}>
              Transparence totale, sans surprise, sans frais cachés
            </p>
            <div className={styles.heroCta}>
              <Button href="/contact" variant="primary" size="md">
                Nous contacter
              </Button>
              <Button href="/estimation" variant="secondary" size="md">
                Demander une estimation
              </Button>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroImageWrapper}>
              <Image
                src="/images/team/honorraire.png"
                alt="Honoraires JuraBreak Immobilier"
                width={400}
                height={400}
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <div className={styles.mainContent}>
        {/* SECTION TRANSACTION */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Honoraires de transaction</h2>
          
          {/* Liste des honoraires */}
          <div className={styles.priceList}>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Maison supérieure à 100 000€</span>
              <span className={styles.priceValue}>7 000€ TTC</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Appartement supérieur à 100 000€</span>
              <span className={styles.priceValue}>6 000€ TTC</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Immeuble supérieur à 100 000€</span>
              <span className={styles.priceValue}>9 000€ TTC</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Immeuble supérieur à 500 000€</span>
              <span className={styles.priceValue}>15 000€ TTC</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Bien de 50 000€ à 100 000€</span>
              <span className={styles.priceValue}>5 000€ TTC</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Bien de 30 000€ à 49 999€</span>
              <span className={styles.priceValue}>3 500€ TTC</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Bien de moins de 30 000€</span>
              <span className={styles.priceValue}>2 500€ TTC</span>
            </div>
          </div>

          {/* Encart Estimation */}
          <div className={styles.estimationBox}>
            <span className={styles.estimationLabel}>Estimation</span>
            <span className={styles.estimationValue}>
              150€ TTC <span className={styles.estimationDetail}>+ frais de déplacement selon la localisation du bien</span>
            </span>
          </div>

          {/* Texte explicatif */}
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              Les honoraires incluent le remboursement des diagnostics obligatoires lors de la vente définitive, 
              des photos avec une photographe professionnelle ainsi qu'un chiffrage lorsque le bien a besoin de travaux.
            </p>
          </div>
        </section>

        {/* SECTION LOCATION */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Honoraires de location</h2>
          
          {/* Liste des honoraires location */}
          <div className={styles.priceList}>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Loyer hors charges de 1€ à 399€</span>
              <span className={styles.priceValue}>80% du loyer</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Loyer hors charges de 400€ à 799€</span>
              <span className={styles.priceValue}>75% du loyer</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>Loyer hors charges de 800€ à 1 499€</span>
              <span className={styles.priceValue}>60% du loyer</span>
            </div>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>État des lieux</span>
              <span className={styles.priceValue}>3€ le m²</span>
            </div>
          </div>

          {/* Avantage */}
          <div className={styles.advantageBox}>
            <svg className={styles.advantageIcon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className={styles.advantageText}>Pas de frais de publicité</span>
          </div>
        </section>
      </div>
    </div>
  )
}
