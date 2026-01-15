'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.css'

export default function ContactPage() {
  const searchParams = useSearchParams()
  const annonceId = searchParams.get('annonce')
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    message: '',
    type_demande: annonceId ? 'visite' : 'contact'
  })
  
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          annonce_id: annonceId || null
        })
      })
      
      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
        })
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          message: '',
          type_demande: annonceId ? 'visite' : 'contact'
        })
      } else {
        throw new Error('Erreur lors de l\'envoi')
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Une erreur est survenue. Veuillez réessayer.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.contact}>
      <div className="container">
        <h1>Nous Contacter</h1>
        
        <div className={styles.content}>
          <div className={styles.info}>
            <h2>Coordonnées</h2>
            <div className={styles.infoItem}>
              <h3>📧 Email</h3>
              <p>contact@jurabreak.fr</p>
            </div>
            <div className={styles.infoItem}>
              <h3>📞 Téléphone</h3>
              <p>06 XX XX XX XX</p>
            </div>
            <div className={styles.infoItem}>
              <h3>🏢 Adresse</h3>
              <p>Jura, France</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{annonceId ? 'Demander une visite' : 'Envoyez-nous un message'}</h2>
            
            {status.message && (
              <div className={`${styles.alert} ${styles[status.type]}`}>
                {status.message}
              </div>
            )}
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="prenom">Prénom *</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="telephone">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submit}
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
