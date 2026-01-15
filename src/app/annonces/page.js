import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

export default async function AnnoncesPage() {
  const supabase = await createClient()
  
  // Récupérer les annonces publiées et non supprimées
  const { data: annonces, error } = await supabase
    .from('annonces')
    .select(`
      *,
      annonce_photos(*)
    `)
    .eq('is_deleted', false)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching annonces:', error)
  }

  return (
    <div className={styles.annonces}>
      <div className="container">
        <h1>Nos Annonces</h1>
        
        {!annonces || annonces.length === 0 ? (
          <p className={styles.empty}>Aucune annonce disponible pour le moment.</p>
        ) : (
          <div className={styles.grid}>
            {annonces.map((annonce) => {
              const firstPhoto = annonce.annonce_photos?.sort((a, b) => a.position - b.position)[0]
              
              return (
                <Link 
                  key={annonce.id} 
                  href={`/annonces/${annonce.slug}`}
                  className={styles.card}
                >
                  {firstPhoto && (
                    <div className={styles.imageContainer}>
                      <Image 
                        src={firstPhoto.url}
                        alt={annonce.titre}
                        width={400}
                        height={300}
                        className={styles.image}
                      />
                      <div className={styles.badge}>
                        {annonce.statut.replace('_', ' ')}
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.cardContent}>
                    <h2>{annonce.titre}</h2>
                    <p className={styles.location}>{annonce.ville} ({annonce.code_postal})</p>
                    <p className={styles.price}>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(annonce.prix)}
                    </p>
                    
                    <div className={styles.details}>
                      {annonce.surface && <span>{annonce.surface} m²</span>}
                      {annonce.nb_pieces && <span>{annonce.nb_pieces} pièces</span>}
                      {annonce.nb_chambres && <span>{annonce.nb_chambres} chambres</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
