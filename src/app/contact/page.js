'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageContainer, SectionTitle, Card, CardContent, Button } from '@/components/ui'
import styles from './page.module.css'

function ContactForm() {
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
    <PageContainer spacing="lg" maxWidth="xl" background="gray">
      <SectionTitle 
        level="h1" 
        align="center"
        subtitle="Nous sommes à votre disposition pour répondre à toutes vos questions"
        spacing="lg"
      >
        Nous Contacter
      </SectionTitle>
      
      <div className={styles.content}>
        <Card hoverable padding="lg" className={styles.infoCard}>
          <CardContent>
            <h2 className={styles.infoTitle}>Coordonnées</h2>
            <div className={styles.infoItem}>
              <h3 className={styles.infoLabel}>📧 Email</h3>
              <p className={styles.infoValue}>contact@jurabreak.fr</p>
            </div>
            <div className={styles.infoItem}>
              <h3 className={styles.infoLabel}>📞 Téléphone</h3>
              <p className={styles.infoValue}>06 XX XX XX XX</p>
            </div>
            <div className={styles.infoItem}>
              <h3 className={styles.infoLabel}>🏢 Adresse</h3>
              <p className={styles.infoValue}>Jura, France</p>
            </div>
          </CardContent>
        </Card>
        
        <Card padding="lg" className={styles.formCard}>
          <CardContent>
            <h2 className={styles.formTitle}>
              {annonceId ? 'Demander une visite' : 'Envoyez-nous un message'}
            </h2>
            
            {status.message && (
              <div className={`${styles.alert} ${styles[status.type]}`}>
                {status.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={styles.form}>
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
              
              <Button 
                type="submit" 
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<PageContainer><div>Chargement...</div></PageContainer>}>
      <ContactForm />
    </Suspense>
  )
}
