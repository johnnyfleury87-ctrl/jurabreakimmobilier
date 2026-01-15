import { createClient } from '@/lib/supabase/server'
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
    <div className={styles.honoraires}>
      <div className="container">
        <h1>Honoraires</h1>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Nos Tarifs</h2>
            <p>
              Découvrez nos honoraires transparents pour l'achat et la vente de biens immobiliers.
            </p>
          </section>

          <section className={styles.section}>
            <h3>Commission sur la vente</h3>
            <p>Nos honoraires sont calculés selon le prix de vente du bien.</p>
            <div className={styles.info}>
              <p>Les honoraires sont à la charge du vendeur sauf mention contraire.</p>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Services inclus</h3>
            <ul>
              <li>Estimation du bien</li>
              <li>Photographies professionnelles</li>
              <li>Diffusion multi-supports</li>
              <li>Visites et négociations</li>
              <li>Accompagnement jusqu'à la signature</li>
            </ul>
          </section>

          <section className={styles.contact}>
            <h3>Besoin d'informations ?</h3>
            <p>N'hésitez pas à nous contacter pour un devis personnalisé.</p>
            <a href="/contact" className={styles.button}>
              Nous contacter
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
