'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const handleMagicLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      })
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBox}>
        <h1>Administration</h1>
        <p className={styles.subtitle}>Connexion sécurisée par lien magique</p>
        
        {error && (
          <div className={styles.error}>
            <strong>Erreur :</strong> {error}
          </div>
        )}
        
        {success ? (
          <div className={styles.success}>
            <h3>✓ Email envoyé !</h3>
            <p>
              Vérifiez votre boîte de réception <strong>{email}</strong>
            </p>
            <p className={styles.instructions}>
              Cliquez sur le lien dans l&apos;email pour vous connecter.
              Le lien est valide pendant 1 heure.
            </p>
            <button 
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
              className={styles.buttonSecondary}
            >
              Renvoyer un lien
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink}>
            <div className={styles.field}>
              <label htmlFor="email">Adresse email professionnelle</label>
              <input
                type="email"
                id="email"
                placeholder="votre.email@jurabreak.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Envoi en cours...' : 'Recevoir le lien de connexion'}
            </button>
            
            <p className={styles.info}>
              Un email contenant un lien de connexion sécurisé sera envoyé à votre adresse.
            </p>
          </form>
        )}
        
        <a href="/" className={styles.backLink}>
          ← Retour au site
        </a>
      </div>
    </div>
  )
}
