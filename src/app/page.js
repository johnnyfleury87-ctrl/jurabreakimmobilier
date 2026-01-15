import Link from 'next/link'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createClient()
  
  // Fetch settings depuis Supabase
  const { data: settingsData } = await supabase
    .from('agence_settings')
    .select('key, value')
    .in('key', ['home_hero_title', 'home_hero_subtitle', 'home_services', 'home_about_text'])
  
  const settingsMap = settingsData?.reduce((acc, s) => {
    acc[s.key] = s.value
    return acc
  }, {}) || {}
  
  const heroTitle = settingsMap.home_hero_title || 'Bienvenue chez JuraBreak Immobilier'
  const heroSubtitle = settingsMap.home_hero_subtitle || 'Votre agence immobilière de confiance dans le Jura'
  const services = settingsMap.home_services || []
  const aboutText = settingsMap.home_about_text || 'JuraBreak Immobilier est votre partenaire de confiance pour tous vos projets immobiliers dans le Jura.'
  
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className="container">
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
          <div className={styles.cta}>
            <Link href="/annonces" className={styles.button}>
              Voir nos annonces
            </Link>
            <Link href="/estimation" className={styles.buttonSecondary}>
              Estimer mon bien
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2>Nos Services</h2>
          <div className={styles.grid}>
            {services.length > 0 ? services.map((service, index) => (
              <div key={index} className={styles.feature}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            )) : (
              <p>Aucun service configuré.</p>
            )}
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <div className="container">
          <h2>À Propos</h2>
          <p>{aboutText}</p>
          <Link href="/a-propos" className={styles.link}>
            En savoir plus →
          </Link>
        </div>
      </section>
    </div>
  )
}

