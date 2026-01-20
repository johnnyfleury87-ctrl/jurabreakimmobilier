/**
 * Page Paiement Estimation
 * Route : /estimation/paiement/[id]
 * 
 * Gère le paiement Stripe pour une estimation
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function PaiementEstimationPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  
  const [estimation, setEstimation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  
  const supabase = createClient()
  
  useEffect(() => {
    if (id) {
      loadEstimation()
    }
  }, [id])
  
  async function loadEstimation() {
    try {
      const { data, error } = await supabase
        .from('estimations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      if (!data) {
        setError('Estimation introuvable')
        return
      }
      
      // Vérifier que l'estimation nécessite un paiement
      if (data.formule === 'gratuite') {
        router.push(`/estimation/resultat/${id}`)
        return
      }
      
      // Si déjà payé, rediriger vers résultat
      if (data.statut_paiement === 'paid') {
        router.push(`/estimation/resultat/${id}`)
        return
      }
      
      setEstimation(data)
    } catch (err) {
      console.error('Erreur chargement estimation:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  async function handlePaiement() {
    setProcessing(true)
    setError(null)
    
    try {
      // TODO: Intégration Stripe à venir
      // Pour l'instant, simuler le paiement pour les tests
      setError('Paiement Stripe en cours de configuration. Veuillez contacter l\'administrateur.')
      setProcessing(false)
      
      /* Code Stripe à activer après configuration :
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimation_id: id,
          formule: estimation.formule,
          amount: estimation.formule === 'standard' ? 4900 : 14900
        })
      })
      
      const session = await response.json()
      if (!response.ok) throw new Error(session.error)
      
      window.location.href = session.url
      */
      
    } catch (err) {
      console.error('Erreur paiement:', err)
      setError(err.message)
      setProcessing(false)
    }
  }
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>❌ Erreur</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/estimation')}>
            ← Retour
          </button>
        </div>
      </div>
    )
  }
  
  if (!estimation) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Estimation introuvable</h2>
          <button onClick={() => router.push('/estimation')}>
            ← Retour
          </button>
        </div>
      </div>
    )
  }
  
  const prix = estimation.formule === 'standard' ? 49 : 149
  const formuleNom = estimation.formule === 'standard' ? 'Standard' : 'Premium'
  
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>💳 Paiement Estimation {formuleNom}</h1>
        
        <div className={styles.recap}>
          <h2>Récapitulatif</h2>
          <div className={styles.recapItem}>
            <span>Formule :</span>
            <strong>{formuleNom}</strong>
          </div>
          <div className={styles.recapItem}>
            <span>Bien :</span>
            <strong>{estimation.type_bien} - {estimation.surface_habitable} m²</strong>
          </div>
          <div className={styles.recapItem}>
            <span>Commune :</span>
            <strong>{estimation.commune_nom}</strong>
          </div>
          <div className={styles.recapItem}>
            <span>Montant :</span>
            <strong className={styles.prix}>{prix}€ TTC</strong>
          </div>
        </div>
        
        <div className={styles.services}>
          <h3>✓ Services inclus :</h3>
          <ul>
            <li>📄 Estimation complète et détaillée</li>
            <li>💾 PDF généré et téléchargeable</li>
            <li>📧 Envoi par email</li>
            <li>🔒 Accès sécurisé dans votre espace client</li>
            {estimation.formule === 'premium' && (
              <>
                <li>⭐ Analyse approfondie avec tous les critères</li>
                <li>📊 Rapport détaillé</li>
              </>
            )}
          </ul>
        </div>
        
        <div className={styles.actions}>
          <button
            onClick={handlePaiement}
            disabled={processing}
            className={styles.btnPay}
          >
            {processing ? (
              <>
                <span className={styles.spinner}></span>
                Redirection vers le paiement...
              </>
            ) : (
              <>💳 Payer {prix}€</>
            )}
          </button>
          
          <button
            onClick={() => router.push(`/estimation/resultat/${id}`)}
            className={styles.btnCancel}
            disabled={processing}
          >
            Annuler
          </button>
        </div>
        
        <div className={styles.security}>
          <p>🔒 Paiement sécurisé par Stripe</p>
          <p className={styles.small}>Vos données bancaires sont protégées et cryptées</p>
        </div>
      </div>
    </div>
  )
}
