'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('password') // 'password' ou 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Mode DEV BYPASS détecté
  const devBypass = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === 'true'
  
  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      
      if (error) {
        setError(error.message)
      } else {
        // Connexion réussie
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }
  
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
        <p className={styles.subtitle}>
          {mode === 'password' ? 'Connexion par mot de passe' : 'Connexion par lien magique'}
        </p>
        
        {devBypass && (
          <div style={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            ⚠️ MODE DEV BYPASS ACTIF<br/>
            <small style={{ fontWeight: 'normal' }}>L'accès admin est ouvert sans authentification</small>
          </div>
        )}
        
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
          <>
            {/* MODE PASSWORD */}
            {mode === 'password' ? (
              <form onSubmit={handlePasswordLogin}>
                <div className={styles.field}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="lolita@jurabreak.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                
                <div className={styles.field}>
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
                
                <button type="submit" disabled={loading} className={styles.button}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setMode('magic')}
                  className={styles.buttonSecondary}
                  style={{ marginTop: '0.5rem' }}
                >
                  Utiliser un lien magique à la place
                </button>
              </form>
            ) : (
              /* MODE MAGIC LINK */
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
                
                <button 
                  type="button"
                  onClick={() => setMode('password')}
                  className={styles.buttonSecondary}
                  style={{ marginTop: '0.5rem' }}
                >
                  Utiliser mot de passe à la place
                </button>
                
                <p className={styles.info}>
                  Un email contenant un lien de connexion sécurisé sera envoyé à votre adresse.
                </p>
              </form>
            )}
          </>
        )}
        
        <a href="/" className={styles.backLink}>
          ← Retour au site
        </a>
      </div>
    </div>
  )
}
