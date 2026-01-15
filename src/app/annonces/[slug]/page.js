import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.css'

export default async function AnnoncePage({ params }) {
  const supabase = await createClient()
  const { slug } = await params
  
  // Récupérer l'annonce par slug
  const { data: annonce, error } = await supabase
    .from('annonces')
    .select(`
      *,
      annonce_photos(*)
    `)
    .eq('slug', slug)
    .eq('is_deleted', false)
    .not('published_at', 'is', null)
    .single()
  
  if (error || !annonce) {
    notFound()
  }
  
  // Trier les photos par position
  const photos = annonce.annonce_photos?.sort((a, b) => a.position - b.position) || []

  return (
    <div className={styles.annonce}>
      <div className="container">
        {photos.length > 0 && (
          <div className={styles.gallery}>
            <Image 
              src={photos[0].url}
              alt={annonce.titre}
              width={1200}
              height={600}
              className={styles.mainImage}
              priority
            />
            {photos.length > 1 && (
              <div className={styles.thumbnails}>
                {photos.slice(1).map((photo) => (
                  <Image 
                    key={photo.id}
                    src={photo.url}
                    alt={photo.alt_text || annonce.titre}
                    width={200}
                    height={150}
                    className={styles.thumbnail}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className={styles.content}>
          <div className={styles.main}>
            <div className={styles.header}>
              <h1>{annonce.titre}</h1>
              <p className={styles.location}>
                {annonce.ville} ({annonce.code_postal})
              </p>
              <div className={styles.badge}>{annonce.statut.replace('_', ' ')}</div>
            </div>
            
            <div className={styles.price}>
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(annonce.prix)}
            </div>
            
            <div className={styles.features}>
              {annonce.surface && (
                <div className={styles.feature}>
                  <span className={styles.label}>Surface</span>
                  <span className={styles.value}>{annonce.surface} m²</span>
                </div>
              )}
              {annonce.nb_pieces && (
                <div className={styles.feature}>
                  <span className={styles.label}>Pièces</span>
                  <span className={styles.value}>{annonce.nb_pieces}</span>
                </div>
              )}
              {annonce.nb_chambres && (
                <div className={styles.feature}>
                  <span className={styles.label}>Chambres</span>
                  <span className={styles.value}>{annonce.nb_chambres}</span>
                </div>
              )}
              {annonce.type_bien && (
                <div className={styles.feature}>
                  <span className={styles.label}>Type</span>
                  <span className={styles.value}>{annonce.type_bien}</span>
                </div>
              )}
            </div>
            
            {annonce.description && (
              <div className={styles.description}>
                <h2>Description</h2>
                <p>{annonce.description}</p>
              </div>
            )}
            
            {annonce.adresse && (
              <div className={styles.address}>
                <h2>Localisation</h2>
                <p>{annonce.adresse}</p>
                <p>{annonce.code_postal} {annonce.ville}</p>
              </div>
            )}
          </div>
          
          <div className={styles.sidebar}>
            <div className={styles.contact}>
              <h3>Intéressé(e) ?</h3>
              <p>Contactez-nous pour plus d'informations ou organiser une visite.</p>
              <a href={`/contact?annonce=${annonce.id}`} className={styles.button}>
                Demander une visite
              </a>
              <a href="/contact" className={styles.buttonSecondary}>
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
