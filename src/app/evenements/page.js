import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
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
    <div className={styles.evenements}>
      <div className="container">
        <h1>Événements</h1>
        
        {!events || events.length === 0 ? (
          <p className={styles.empty}>Aucun événement disponible pour le moment.</p>
        ) : (
          <div className={styles.grid}>
            {events.map((event) => (
              <div key={event.id} className={styles.card}>
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
                
                <div className={styles.content}>
                  <div className={styles.date}>
                    {new Date(event.date_event).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  <h2>{event.titre}</h2>
                  
                  {event.lieu && (
                    <p className={styles.lieu}>📍 {event.lieu}</p>
                  )}
                  
                  {event.description && (
                    <p className={styles.description}>{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
