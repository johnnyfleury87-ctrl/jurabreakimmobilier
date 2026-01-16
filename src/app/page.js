import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import HeroSection from '@/components/HeroSection'
import styles from './page.module.css'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let settingsMap = {}
  
  try {
    const supabase = createClient()
    
    // Fetch settings depuis Supabase
    const { data: settingsData, error } = await supabase
      .from('agence_settings')
      .select('key, value')
      .in('key', ['home_hero_title', 'home_hero_subtitle', 'home_services', 'home_about_text'])
    
    if (error) {
      console.error('Supabase error:', error)
    }
    
    settingsMap = settingsData?.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {}) || {}
  } catch (err) {
    console.error('Failed to fetch settings:', err)
  }
  
  const heroTitle = settingsMap.home_hero_title || 'Bienvenue chez JuraBreak Immobilier'
  const heroSubtitle = settingsMap.home_hero_subtitle || 'Votre agence immobilière de confiance dans le Jura'
  const services = settingsMap.home_services || []
  const aboutText = settingsMap.home_about_text || 'JuraBreak Immobilier est votre partenaire de confiance pour tous vos projets immobiliers dans le Jura.'
  
  return (
    <div className={styles.home}>
      {/* HERO SECTION - Composant réutilisable */}
      <HeroSection
        title={heroTitle}
        subtitle={heroSubtitle}
        buttons={[
          { href: '/annonces', label: 'Voir les annonces', variant: 'primary', size: 'lg' }
        ]}
        showVideo={true}
        minHeight="100vh"
      />

      {/* SECTION PRÉSENTATION PERSONNELLE */}
      <section className={styles.presentation}>
        <div className={styles.presentationContent}>
          <div className={styles.presentationLeft}>
            <div className={styles.imageWrapper}>
              <Image 
                src="/images/team/lolita.png"
                alt="Lolita - Agent immobilier JuraBreak"
                width={300}
                height={300}
                className={styles.teamImage}
                priority
              />
            </div>
          </div>
          <div className={styles.presentationRight}>
            <p className={styles.presentationIntro}>Bonjour</p>
            <h2 className={styles.presentationTitle}>
              Votre partenaire immobilier dans le Jura
            </h2>
            <p className={styles.presentationText}>
              {aboutText}
            </p>
            <Button href="/a-propos" variant="secondary" size="lg">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

