import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { PageContainer, SectionTitle, Card, CardContent } from '@/components/ui'
import styles from './page.module.css'

export default async function EvenementsPage() {
  const supabase = await createClient()
  
  // Récupérer les événements publiés
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('date_event', { ascending: false })

  return (
    <PageContainer spacing="lg" maxWidth="2xl" background="gray">
      <SectionTitle 
        level="h1" 
        align="center"
        subtitle="Restez informés de nos événements et portes ouvertes"
        spacing="lg"
      >
        Événements
      </SectionTitle>
      
      {!events || events.length === 0 ? (
        <Card padding="lg" className={styles.emptyCard}>
          <p className={styles.empty}>Aucun événement disponible pour le moment.</p>
        </Card>
      ) : (
        <div className={styles.grid}>
          {events.map((event, index) => (
            <Card key={event.id} hoverable padding="none" className={styles.eventCard} style={{ animationDelay: `${index * 50}ms` }}>
              {event.photo_url && (
                <div className={styles.imageContainer}>
                  <Image 
                    src={event.photo_url}
                    alt={event.titre}
                    width={400}
                    height={250}
                    className={styles.image}
                  />
                </div>
              )}
              
              <CardContent>
                <div className={styles.date}>
                  {new Date(event.date_event).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                <h2 className={styles.title}>{event.titre}</h2>
                
                {event.lieu && (
                  <p className={styles.lieu}>📍 {event.lieu}</p>
                )}
                
                {event.description && (
                  <p className={styles.description}>{event.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
