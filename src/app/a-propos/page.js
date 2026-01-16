import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { PageContainer, SectionTitle, Card, CardContent } from '@/components/ui'
import styles from './page.module.css'

export default async function AProposPage() {
  const supabase = await createClient()
  
  // Récupérer les settings (photo et bio de Lolita)
  const { data: settings } = await supabase
    .from('agence_settings')
    .select('*')
  
  const settingsMap = settings?.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {}) || {}
  
  const photoUrl = settingsMap.about_photo_url
  const biography = settingsMap.about_biography || ''

  return (
    <PageContainer spacing="lg" maxWidth="xl" background="gray">
      <SectionTitle 
        level="h1" 
        align="center"
        subtitle="Découvrez l'équipe JuraBreak Immobilier"
        spacing="lg"
      >
        À Propos
      </SectionTitle>
      
      <div className={styles.content}>
        {photoUrl && (
          <Card hoverable padding="none" className={styles.photoCard}>
            <div className={styles.photoContainer}>
              <Image 
                src={photoUrl} 
                alt="Lolita - JuraBreak Immobilier"
                width={300}
                height={400}
                className={styles.photo}
              />
            </div>
          </Card>
        )}
        
        <Card hoverable padding="lg" className={styles.bioCard}>
          <CardContent>
            <h2 className={styles.bioTitle}>Lolita, votre agent immobilier</h2>
            <div 
              className={styles.bioText}
              dangerouslySetInnerHTML={{ __html: biography }}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
