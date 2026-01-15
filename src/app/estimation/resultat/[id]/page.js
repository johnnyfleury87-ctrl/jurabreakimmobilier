import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import styles from './page.module.css'

export default async function ResultatEstimationPage({ params }) {
  const { id } = params
  const supabase = createClient()
  
  // Récupérer l'estimation
  const { data: estimation, error } = await supabase
    .from('estimations')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !estimation) {
    redirect('/estimation')
  }
  
  // Extraire les données d'estimation
  const estimationData = estimation.estimation_data || {}
  const { estimation_basse, estimation_haute, estimation_moyenne } = estimationData
  
  return (
    <div className={styles.resultat}>
      <div className="container">
        <h1>Votre Estimation</h1>
        
        <div className={styles.card}>
          <div className={styles.header}>
            <h2>Résultat de l'estimation</h2>
            <span className={styles.formule}>
              {estimation.formule === 'formule_0' ? 'Formule Gratuite' : 
               estimation.formule === 'formule_1' ? 'Formule Standard' : 
               'Formule Premium'}
            </span>
          </div>
          
          <div className={styles.bienInfo}>
            <h3>Informations du bien</h3>
            <p><strong>Adresse :</strong> {estimation.adresse_bien}</p>
            <p><strong>Type :</strong> {formatTypeBien(estimation.type_bien)}</p>
            <p><strong>Surface :</strong> {estimation.surface} m²</p>
            {estimation.nb_pieces && <p><strong>Nombre de pièces :</strong> {estimation.nb_pieces}</p>}
          </div>
          
          {estimation_moyenne && (
            <div className={styles.estimation}>
              <h3>Estimation de valeur</h3>
              <div className={styles.fourchette}>
                <div className={styles.range}>
                  <span className={styles.label}>Fourchette :</span>
                  <span className={styles.value}>
                    {formatPrice(estimation_basse)} - {formatPrice(estimation_haute)}
                  </span>
                </div>
                <div className={styles.moyenne}>
                  <span className={styles.label}>Valeur moyenne estimée :</span>
                  <span className={styles.valuePrimary}>{formatPrice(estimation_moyenne)}</span>
                </div>
              </div>
            </div>
          )}
          
          {estimation.pdf_path && estimation.download_token && (
            <div className={styles.pdfSection}>
              <h3>Rapport PDF</h3>
              <p>Votre rapport d'estimation détaillé est disponible :</p>
              <a 
                href={`/api/estimation/${id}/download?token=${estimation.download_token}`}
                className={styles.pdfButton}
              >
                📄 Télécharger le rapport PDF
              </a>
              <p className={styles.pdfNote}>
                ⚠️ Ce lien est unique et sécurisé. Ne le partagez pas.
              </p>
            </div>
          )}
          
          {estimation.formule === 'formule_0' && (
            <div className={styles.disclaimer}>
              <p><strong>Important :</strong> Cette estimation est purement indicative et automatique. 
              Elle n'a aucune valeur juridique et ne remplace pas une expertise professionnelle.</p>
              <p>Pour une estimation plus précise avec visite sur place et valeur juridique, 
              découvrez nos <a href="/estimation">formules payantes</a>.</p>
            </div>
          )}
          
          {estimation.formule === 'formule_2' && estimation.statut === 'PAID' && (
            <div className={styles.nextSteps}>
              <h3>Prochaines étapes</h3>
              <p>Nous allons vous contacter dans les plus brefs délais pour organiser la visite sur place.</p>
              <p>Un email de confirmation vous a été envoyé à : <strong>{estimation.email}</strong></p>
            </div>
          )}
          
          <div className={styles.contact}>
            <p>Des questions ? Contactez-nous :</p>
            <p>📧 contact@jurabreak.fr | 📞 06 XX XX XX XX</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTypeBien(type) {
  const types = {
    'maison': 'Maison',
    'appartement': 'Appartement',
    'terrain': 'Terrain',
    'local_commercial': 'Local commercial',
    'autre': 'Autre'
  }
  return types[type] || type
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(price)
}
