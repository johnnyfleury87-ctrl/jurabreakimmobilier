import { createClient } from '@/lib/supabase/server'
import { PageContainer, SectionTitle, Card, CardContent, Button } from '@/components/ui'
import styles from './page.module.css'

export default async function HonorairesPage() {
  const supabase = await createClient()
  
  // Récupérer les honoraires depuis les settings
  const { data: settings } = await supabase
    .from('agence_settings')
    .select('*')
    .eq('key', 'honoraires')
    .single()
  
  const honoraires = settings?.value || {}

  return (
    <PageContainer spacing="lg" maxWidth="lg" background="gray">
      <SectionTitle 
        level="h1" 
        align="center"
        subtitle="Découvrez nos honoraires transparents pour l'achat et la vente de biens immobiliers"
        spacing="lg"
      >
        Honoraires
      </SectionTitle>
      
      <div className={styles.cardsGrid}>
        <Card hoverable padding="lg" className={styles.card}>
          <CardContent>
            <h2 className={styles.cardTitle}>Nos Tarifs</h2>
            <p className={styles.cardText}>
              Découvrez nos honoraires transparents pour l'achat et la vente de biens immobiliers.
            </p>
          </CardContent>
        </Card>

        <Card hoverable padding="lg" className={styles.card}>
          <CardContent>
            <h3 className={styles.cardTitle}>Commission sur la vente</h3>
            <p className={styles.cardText}>
              Nos honoraires sont calculés selon le prix de vente du bien.
            </p>
            <div className={styles.info}>
              <p>Les honoraires sont à la charge du vendeur sauf mention contraire.</p>
            </div>
          </CardContent>
        </Card>

        <Card hoverable padding="lg" className={styles.card}>
          <CardContent>
            <h3 className={styles.cardTitle}>Services inclus</h3>
            <ul className={styles.servicesList}>
              <li>Estimation du bien</li>
              <li>Photographies professionnelles</li>
              <li>Diffusion multi-supports</li>
              <li>Visites et négociations</li>
              <li>Accompagnement jusqu'à la signature</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card padding="lg" className={styles.ctaCard}>
        <CardContent>
          <h3 className={styles.ctaTitle}>Besoin d'informations ?</h3>
          <p className={styles.ctaText}>
            N'hésitez pas à nous contacter pour un devis personnalisé.
          </p>
          <Button href="/contact" size="lg">
            Nous contacter
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
