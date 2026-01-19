/**
 * Page Résultat d'estimation - Conforme à docs/estimation.md
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

export default async function ResultatEstimationPage({ params }) {
  const { id } = params
  const supabase = await createClient()
  
  const { data: estimation, error } = await supabase
    .from('estimations')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !estimation) {
    redirect('/estimation')
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Votre Estimation Immobilière</h1>
        <p className={styles.reference}>Référence : EST-{id.substring(0, 8).toUpperCase()}</p>
      </div>
      
      {/* RÉSULTAT - FOURCHETTE OBLIGATOIRE */}
      <section className={styles.resultatCard}>
        <h2>Fourchette d'estimation</h2>
        <div className={styles.valeurs}>
          <span className={styles.valeurBasse}>{formatPrice(estimation.valeur_basse)}</span>
          <span className={styles.separator}>—</span>
          <span className={styles.valeurHaute}>{formatPrice(estimation.valeur_haute)}</span>
        </div>
        <div className={styles.mediane}>
          Valeur médiane : <strong>{formatPrice(estimation.valeur_mediane)}</strong>
        </div>
        <p className={styles.niveau}>Niveau : {formatNiveauFiabilite(estimation.niveau_fiabilite)}</p>
      </section>
      
      {/* BIEN */}
      <section className={styles.section}>
        <h2>Votre bien</h2>
        <p><strong>{estimation.commune_nom}</strong> • {estimation.surface_habitable} m² • {formatEtatBien(estimation.etat_bien)}</p>
      </section>
      
      {/* PDF */}
      {estimation.download_token && (
        <section className={styles.pdfSection}>
          <a href={`/api/estimation/${id}/download?token=${estimation.download_token}`} className={styles.downloadBtn}>
            📄 Télécharger le rapport PDF
          </a>
          <p className={styles.note}>Lien unique et sécurisé</p>
        </section>
      )}
      
      {/* DISCLAIMER */}
      <div className={styles.disclaimer}>
        <p><strong>⚠️ Cette estimation est indicative</strong> et n'a aucune valeur juridique opposable.</p>
      </div>
      
      <div className={styles.actions}>
        <Link href="/estimation" className={styles.btn}>Nouvelle estimation</Link>
      </div>
    </div>
  )
}

function formatPrice(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function formatEtatBien(etat) {
  const etats = { 'a_renover': 'À rénover', 'correct': 'Correct', 'bon': 'Bon', 'tres_bon': 'Très bon' }
  return etats[etat] || etat
}

function formatNiveauFiabilite(niveau) {
  const niveaux = { 'minimal': 'MINIMAL', 'complet': 'COMPLET', 'tres_complet': 'TRÈS COMPLET' }
  return niveaux[niveau] || niveau
}
