import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
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
    <div className={styles.apropos}>
      <div className="container">
        <h1>À Propos</h1>
        
        <div className={styles.content}>
          {photoUrl && (
            <div className={styles.photoContainer}>
              <Image 
                src={photoUrl} 
                alt="Lolita - JuraBreak Immobilier"
                width={300}
                height={400}
                className={styles.photo}
              />
            </div>
          )}
          
          <div className={styles.bio}>
            <h2>Lolita, votre agent immobilier</h2>
            <div 
              className={styles.bioText}
              dangerouslySetInnerHTML={{ __html: biography }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
