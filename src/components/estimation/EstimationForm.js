/**
 * Formulaire d'estimation - Parcours en 6 étapes RESTRUCTURÉ
 * Strictement conforme à docs/estimation.md
 * 
 * ÉTAPES :
 * 1. Inscription / Connexion (obligatoire)
 * 2. Choix du motif
 * 3. Choix de la formule ⬅️ PLACEMENT CLÉ
 * 4. Données du bien (adaptées à la formule choisie)
 * 5. Consentement légal
 * 6. Résultat / Paiement / PDF
 * 
 * RÈGLE MÉTIER : La formule (étape 3) pilote les champs de l'étape 4
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './EstimationForm.module.css'

export default function EstimationForm() {
  const router = useRouter()
  const supabase = createClient()
  
  // État global
  const [currentStep, setCurrentStep] = useState(1)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Données communes et options (chargées depuis DB)
  const [communes, setCommunes] = useState([])
  const [options, setOptions] = useState([])
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    // Étape 1: User (géré automatiquement)
    user_id: null,
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    
    // Étape 2: Motif
    motif: '',
    motif_autre_detail: '',
    
    // Étape 3: Données du bien
    type_bien: 'maison',
    surface_habitable: '',
    surface_terrain: '',
    commune_id: '',
    commune_nom: '',
    code_postal: '',
    annee_construction: '',
    etat_bien: 'bon',
    
    // Étape 4: Formule
    formule: 'gratuite',
    
    // Étape 5: Consentement
    consentement_accepte: false,
    
    // Étape 6: Options (requis uniquement si premium)
    options_selectionnees: [],
    nb_pieces: '',
    nb_chambres: '',
    environnement: '',
    travaux: ''
  })
  
  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuth()
    loadOptions()
  }, [])
  
  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setFormData(prev => ({
        ...prev,
        user_id: user.id,
        email: user.email
      }))
      setCurrentStep(2) // Passer directement à l'étape 2
    }
  }
  
  // Charger communes selon code postal
  async function loadCommunesByCodePostal(codePostal) {
    if (!codePostal || codePostal.length !== 5) {
      setCommunes([])
      return
    }
    
    try {
      const response = await fetch(`/api/estimation/communes?code_postal=${codePostal}`)
      const data = await response.json()
      
      if (data.success) {
        setCommunes(data.communes || [])
        
        // Si une seule commune, la sélectionner automatiquement
        if (data.communes.length === 1) {
          const commune = data.communes[0]
          setFormData(prev => ({
            ...prev,
            commune_id: commune.id,
            commune_nom: commune.nom
          }))
        }
      }
    } catch (error) {
      console.error('Erreur chargement communes:', error)
      setCommunes([])
    }
  }
  
  async function loadOptions() {
    const { data } = await supabase
      .from('estimation_options')
      .select('*')
      .eq('actif', true)
      .order('ordre')
    
    setOptions(data || [])
  }
  
  // =====================================================================
  // ÉTAPE 1 : INSCRIPTION / CONNEXION
  // =====================================================================
  
  async function handleAuth(mode) {
    setLoading(true)
    setError(null)
    
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nom: formData.nom,
              prenom: formData.prenom
            }
          }
        })
        
        if (error) throw error
        
        if (data.user) {
          setUser(data.user)
          setFormData(prev => ({ ...prev, user_id: data.user.id }))
          setCurrentStep(2)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (error) throw error
        
        if (data.user) {
          setUser(data.user)
          setFormData(prev => ({ ...prev, user_id: data.user.id }))
          setCurrentStep(2)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // =====================================================================
  // NAVIGATION ENTRE ÉTAPES
  // =====================================================================
  
  function canProceed(step) {
    switch (step) {
      case 1:
        return user !== null
      case 2:
        return formData.motif !== '' && (formData.motif !== 'autre' || formData.motif_autre_detail !== '')
      case 3:
        return formData.formule !== '' // Formule AVANT données du bien
      case 4:
        // Validation adaptée à la formule choisie
        const baseFields = formData.type_bien && formData.surface_habitable && formData.commune_nom && formData.code_postal && formData.etat_bien
        
        if (formData.formule === 'gratuite') {
          // Gratuite : champs minimaux uniquement
          return baseFields
        } else if (formData.formule === 'standard') {
          // Standard : + année construction + surface terrain
          return baseFields && formData.annee_construction && formData.surface_terrain
        } else if (formData.formule === 'premium') {
          // Premium : tous les champs
          return baseFields && formData.annee_construction && formData.surface_terrain && 
                 formData.nb_pieces && formData.nb_chambres && formData.environnement && formData.travaux
        }
        return baseFields
      case 5:
        return formData.consentement_accepte
      case 6:
        return true // Étape finale : validation côté backend
      default:
        return true
    }
  }
  
  function nextStep() {
    if (canProceed(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6))
      setError(null)
    } else {
      // Messages d'erreur spécifiques par étape
      switch (currentStep) {
        case 1:
          setError('Vous devez créer un compte ou vous connecter')
          break
        case 2:
          setError('Veuillez sélectionner un motif d\'estimation')
          break
        case 3:
          setError('⚠️ Vous devez choisir une formule pour continuer')
          break
        case 4:
          if (formData.formule === 'gratuite') {
            setError('Veuillez remplir les champs de base du bien')
          } else if (formData.formule === 'standard') {
            setError('Formule Standard : année de construction et surface terrain requises')
          } else if (formData.formule === 'premium') {
            setError('⭐ Formule Premium : tous les champs sont obligatoires')
          } else {
            setError('Veuillez remplir tous les champs obligatoires du bien')
          }
          break
        case 5:
          setError('Vous devez accepter les conditions légales')
          break
        case 6:
          setError('Vérifiez tous les champs requis')
          break
        default:
          setError('Veuillez remplir tous les champs obligatoires')
      }
    }
  }
  
  function prevStep() {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError(null)
  }
  
  // =====================================================================
  // SOUMISSION FINALE
  // =====================================================================
  
  async function handleSubmit() {
    if (!canProceed(6)) {
      setError('Veuillez compléter tous les champs requis')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/estimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création')
      }
      
      // Si formule gratuite : afficher résultat uniquement à l'écran
      if (result.formule === 'gratuite') {
        router.push(`/estimation/resultat/${result.estimation_id}`)
      }
      // Si formule payante : rediriger vers paiement
      else if (result.requires_payment) {
        router.push(`/estimation/paiement/${result.estimation_id}`)
      }
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // =====================================================================
  // RENDU
  // =====================================================================
  
  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        <div className={styles.progressBar} style={{ width: `${(currentStep / 6) * 100}%` }}></div>
      </div>
      
      <div className={styles.steps}>
        {[1, 2, 3, 4, 5, 6].map(step => (
          <div
            key={step}
            className={`${styles.stepIndicator} ${step <= currentStep ? styles.active : ''}`}
          >
            {step}
          </div>
        ))}
      </div>
      
      <div className={styles.formContent}>
        {error && <div className={styles.error}>{error}</div>}
        
        {/* ÉTAPE 1 : INSCRIPTION / CONNEXION */}
        {currentStep === 1 && (
          <Step1Auth
            formData={formData}
            setFormData={setFormData}
            onAuth={handleAuth}
            loading={loading}
          />
        )}
        
        {/* ÉTAPE 2 : MOTIF */}
        {currentStep === 2 && (
          <Step2Motif
            formData={formData}
            setFormData={setFormData}
          />
        )}
        
        {/* ÉTAPE 3 : CHOIX DE LA FORMULE */}
        {currentStep === 3 && (
          <Step3Formule
            formData={formData}
            setFormData={setFormData}
          />
        )}
        
        {/* ÉTAPE 4 : DONNÉES DU BIEN (adaptées à la formule) */}
        {currentStep === 4 && (
          <Step4Bien
            formData={formData}
            setFormData={setFormData}
            communes={communes}
            onLoadCommunes={loadCommunesByCodePostal}
          />
        )}
        
        {/* ÉTAPE 5 : CONSENTEMENT */}
        {currentStep === 5 && (
          <Step5Consentement
            formData={formData}
            setFormData={setFormData}
          />
        )}
        
        {/* ÉTAPE 6 : RÉSULTAT / PAIEMENT */}
        {currentStep === 6 && (
          <Step6Resultat
            formData={formData}
            setFormData={setFormData}
            options={options}
          />
        )}
      </div>
      
      <div className={styles.navigation}>
        {currentStep > 1 && (
          <button onClick={prevStep} disabled={loading}>
            ← Précédent
          </button>
        )}
        
        {currentStep < 6 && (
          <button
            onClick={nextStep}
            disabled={!canProceed(currentStep) || loading}
            className={styles.primary}
          >
            Suivant →
          </button>
        )}
        
        {currentStep === 6 && (
          <button
            onClick={handleSubmit}
            disabled={!canProceed(5) || loading}
            className={styles.primary}
          >
            {loading ? 'Traitement...' : formData.formule === 'gratuite' ? 'Obtenir mon estimation' : 'Procéder au paiement'}
          </button>
        )}
      </div>
    </div>
  )
}

// =====================================================================
// COMPOSANTS ÉTAPES
// =====================================================================

function Step1Auth({ formData, setFormData, onAuth, loading }) {
  const [mode, setMode] = useState('signin')
  
  return (
    <div className={styles.step}>
      <h2>Étape 1 : Identification</h2>
      <p>Un compte est obligatoire pour obtenir votre estimation</p>
      
      <div className={styles.tabs}>
        <button
          className={mode === 'signin' ? styles.active : ''}
          onClick={() => setMode('signin')}
        >
          Connexion
        </button>
        <button
          className={mode === 'signup' ? styles.active : ''}
          onClick={() => setMode('signup')}
        >
          Inscription
        </button>
      </div>
      
      {mode === 'signup' && (
        <>
          <input
            type="text"
            placeholder="Nom *"
            value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Prénom *"
            value={formData.prenom}
            onChange={e => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
        </>
      )}
      
      <input
        type="email"
        placeholder="Email *"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe *"
        value={formData.password || ''}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
        required
      />
      
      <button
        onClick={() => onAuth(mode)}
        disabled={loading}
        className={styles.authButton}
      >
        {loading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
      </button>
    </div>
  )
}

function Step2Motif({ formData, setFormData }) {
  const motifs = [
    { value: 'curiosite', label: 'Curiosité / Information' },
    { value: 'vente', label: 'Projet de vente' },
    { value: 'divorce', label: 'Divorce / Séparation' },
    { value: 'succession', label: 'Succession' },
    { value: 'notaire', label: 'Discussion notariale' },
    { value: 'autre', label: 'Autre' }
  ]
  
  return (
    <div className={styles.step}>
      <h2>Étape 2 : Motif de l'estimation</h2>
      <p>Pourquoi souhaitez-vous estimer ce bien ? (impacte le wording légal)</p>
      
      <div className={styles.radioGroup}>
        {motifs.map(motif => (
          <label key={motif.value} className={styles.radioLabel}>
            <input
              type="radio"
              name="motif"
              value={motif.value}
              checked={formData.motif === motif.value}
              onChange={e => setFormData({ ...formData, motif: e.target.value })}
            />
            <span>{motif.label}</span>
          </label>
        ))}
      </div>
      
      {formData.motif === 'autre' && (
        <textarea
          placeholder="Précisez votre motif *"
          value={formData.motif_autre_detail}
          onChange={e => setFormData({ ...formData, motif_autre_detail: e.target.value })}
          rows="3"
          required
        />
      )}
    </div>
  )
}

function Step4Bien({ formData, setFormData, communes, onLoadCommunes }) {
  // Déterminer les champs à afficher selon la formule
  const isGratuite = formData.formule === 'gratuite'
  const isStandard = formData.formule === 'standard'
  const isPremium = formData.formule === 'premium'
  
  return (
    <div className={styles.step}>
      <h2>Étape 4 : Données du bien</h2>
      
      {/* Infobox formule choisie */}
      {isGratuite && (
        <div className={styles.infoBox} style={{ background: '#d1fae5', borderColor: '#10b981' }}>
          🟢 <strong>Formule Gratuite :</strong> Champs de base uniquement
        </div>
      )}
      {isStandard && (
        <div className={styles.infoBox} style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
          🔵 <strong>Formule Standard :</strong> Année de construction et surface terrain requises
        </div>
      )}
      {isPremium && (
        <div className={styles.infoBox} style={{ background: '#ede9fe', borderColor: '#8b5cf6' }}>
          ⭐ <strong>Formule Premium :</strong> Tous les champs sont obligatoires
        </div>
      )}
      
      <label>Type de bien *</label>
      <select
        value={formData.type_bien}
        onChange={e => setFormData({ ...formData, type_bien: e.target.value })}
        required
      >
        <option value="maison">Maison</option>
        <option value="appartement">Appartement</option>
        <option value="autre">Autre</option>
      </select>
      
      <label>Surface habitable (m²) *</label>
      <input
        type="number"
        step="0.01"
        value={formData.surface_habitable}
        onChange={e => setFormData({ ...formData, surface_habitable: e.target.value })}
        required
      />
      
      <label>Surface terrain (m²) {!isGratuite && '*'}</label>
      <input
        type="number"
        step="0.01"
        value={formData.surface_terrain}
        onChange={e => setFormData({ ...formData, surface_terrain: e.target.value })}
        required={!isGratuite}
      />
      
      <label>Code postal *</label>
      <input
        type="text"
        pattern="[0-9]{5}"
        maxLength="5"
        placeholder="39000"
        value={formData.code_postal}
        onChange={e => {
          const cp = e.target.value
          setFormData({ ...formData, code_postal: cp, commune_id: '', commune_nom: '' })
          if (cp.length === 5) {
            onLoadCommunes(cp)
          }
        }}
        required
      />
      
      <label>Commune *</label>
      <select
        value={formData.commune_id}
        onChange={e => {
          const commune = communes.find(c => c.id === e.target.value)
          setFormData({
            ...formData,
            commune_id: e.target.value,
            commune_nom: commune?.nom || ''
          })
        }}
        disabled={!formData.code_postal || communes.length === 0}
        required
      >
        <option value="">
          {!formData.code_postal 
            ? 'Saisissez d\'abord le code postal' 
            : communes.length === 0 
            ? 'Aucune commune trouvée'
            : 'Sélectionnez une commune'}
        </option>
        {communes.map(c => (
          <option key={c.id} value={c.id}>{c.nom}</option>
        ))}
      </select>
      
      <label>Année de construction {!isGratuite && '*'}</label>
      <input
        type="number"
        value={formData.annee_construction}
        onChange={e => setFormData({ ...formData, annee_construction: e.target.value })}
        min="1800"
        max={new Date().getFullYear()}
        required={!isGratuite}
      />
      
      <label>État du bien *</label>
      <select
        value={formData.etat_bien}
        onChange={e => setFormData({ ...formData, etat_bien: e.target.value })}
        required
      >
        <option value="a_renover">À rénover</option>
        <option value="correct">Correct</option>
        <option value="bon">Bon</option>
        <option value="tres_bon">Très bon / Récent</option>
      </select>
      
      {/* CHAMPS PREMIUM UNIQUEMENT */}
      {isPremium && (
        <>
          <hr style={{ margin: '2rem 0', borderColor: '#8b5cf6' }} />
          <h3 style={{ color: '#8b5cf6' }}>⭐ Champs Premium (obligatoires)</h3>
          
          <label>Nombre de pièces *</label>
          <input
            type="number"
            value={formData.nb_pieces}
            onChange={e => setFormData({ ...formData, nb_pieces: e.target.value })}
            min="1"
            required
          />
          
          <label>Nombre de chambres *</label>
          <input
            type="number"
            value={formData.nb_chambres}
            onChange={e => setFormData({ ...formData, nb_chambres: e.target.value })}
            min="0"
            required
          />
          
          <label>Environnement *</label>
          <select
            value={formData.environnement}
            onChange={e => setFormData({ ...formData, environnement: e.target.value })}
            required
          >
            <option value="">-- Sélectionnez --</option>
            <option value="ville">Ville</option>
            <option value="campagne">Campagne</option>
            <option value="montagne">Montagne</option>
          </select>
          
          <label>État des travaux *</label>
          <select
            value={formData.travaux}
            onChange={e => setFormData({ ...formData, travaux: e.target.value })}
            required
          >
            <option value="">-- Sélectionnez --</option>
            <option value="aucun">Aucun travaux nécessaire</option>
            <option value="leger">Travaux légers (peinture, sols...)</option>
            <option value="moyen">Rénovation partielle</option>
            <option value="complet">Rénovation complète (-5 ans)</option>
          </select>
        </>
      )}
    </div>
  )
}

function Step3Formule({ formData, setFormData }) {
  const formules = [
    {
      value: 'gratuite',
      nom: 'Formule Gratuite',
      prix: 'Gratuit',
      features: [
        '✓ Estimation affichée à l\'écran uniquement',
        '✓ Fourchette de prix visible',
        '✗ Pas de PDF',
        '✗ Pas d\'envoi par email',
        '✓ Données minimales'
      ],
      color: '#10b981'
    },
    {
      value: 'standard',
      nom: 'Formule Standard',
      prix: '49€',
      features: [
        '✓ Estimation complète',
        '✓ PDF généré et téléchargeable',
        '✓ Accessible dans votre espace client',
        '✓ Envoi email (si activé)',
        '✓ Analyse détaillée'
      ],
      color: '#3b82f6'
    },
    {
      value: 'premium',
      nom: 'Formule Premium',
      prix: '149€',
      features: [
        '✓ Estimation complète',
        '✓ PDF généré et téléchargeable',
        '✓ Champs supplémentaires obligatoires',
        '✓ Envoi email automatique',
        '✓ Rapport détaillé avec photos'
      ],
      color: '#8b5cf6'
    }
  ]
  
  return (
    <div className={styles.step}>
      <h2>Étape 3 : Choisissez votre formule</h2>
      <p>⚠️ <strong>Ce choix détermine les champs requis à l'étape suivante</strong></p>
      
      {!formData.formule && (
        <div className={styles.infoBox}>
          ℹ️ <strong>Important :</strong> Votre choix déterminera les services disponibles et les champs requis pour la suite du parcours.
        </div>
      )}
      
      <div className={styles.formules}>
        {formules.map(formule => (
          <div
            key={formule.value}
            className={`${styles.formuleCard} ${formData.formule === formule.value ? styles.selected : ''}`}
            onClick={() => setFormData({ ...formData, formule: formule.value })}
            style={{ borderColor: formData.formule === formule.value ? formule.color : '#ddd' }}
          >
            <h3>{formule.nom}</h3>
            <div className={styles.prix} style={{ color: formule.color }}>{formule.prix}</div>
            <ul>
              {formule.features.map((f, i) => (
                <li key={i} style={{ color: f.startsWith('✗') ? '#999' : '#333' }}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className={styles.formuleLegend}>
        <p><strong>🟢 Gratuite :</strong> Affichage écran uniquement, pas de PDF généré</p>
        <p><strong>🔵 Standard / Premium :</strong> PDF généré, envoi email selon paramétrage admin</p>
      </div>
    </div>
  )
}

function Step5Consentement({ formData, setFormData }) {
  // Mention selon motif
  const mentions = {
    curiosite: "Cette estimation est purement indicative et constitue une aide à la décision.",
    vente: "Cette estimation constitue un document préparatoire pour votre projet de vente.",
    divorce: "Ce document ne constitue pas une expertise opposable devant une juridiction.",
    succession: "Ce document ne constitue pas une expertise opposable devant une juridiction.",
    notaire: "Cette estimation constitue un document préparatoire pour vos échanges notariaux.",
    autre: "Cette estimation est purement indicative et constitue une aide à la décision."
  }
  
  const mention = mentions[formData.motif] || mentions.curiosite
  
  // Infos formule pour récapitulatif
  const formulesInfo = {
    gratuite: { nom: 'Gratuite', emoji: '🟢', info: 'Résultat affiché à l\'écran uniquement' },
    standard: { nom: 'Standard (49€)', emoji: '🔵', info: 'PDF généré et téléchargeable' },
    premium: { nom: 'Premium (149€)', emoji: '⭐', info: 'PDF + champs détaillés obligatoires' }
  }
  
  const formuleChoisie = formulesInfo[formData.formule] || formulesInfo.gratuite
  
  return (
    <div className={styles.step}>
      <h2>Étape 5 : Consentement légal</h2>
      
      {/* Récapitulatif formule */}
      <div className={styles.formuleRecap}>
        <strong>{formuleChoisie.emoji} Formule choisie :</strong> {formuleChoisie.nom}
        <br />
        <small>{formuleChoisie.info}</small>
      </div>
      
      <div className={styles.legalNotice}>
        <h3>Information importante</h3>
        <p><strong>{mention}</strong></p>
        <p>Elle ne remplace pas une expertise professionnelle.</p>
        <p>Cette estimation est basée sur les données que vous avez déclarées et des paramètres de marché automatisés.</p>
        <p><strong>Elle n'a aucune valeur juridique opposable.</strong></p>
      </div>
      
      <label className={styles.consentLabel}>
        <input
          type="checkbox"
          checked={formData.consentement_accepte}
          onChange={e => setFormData({ ...formData, consentement_accepte: e.target.checked })}
          required
        />
        <span>
          <strong>J'ai compris et j'accepte *</strong><br />
          Je comprends que cette estimation est indicative, non opposable juridiquement, 
          et qu'elle ne constitue pas une expertise immobilière.
        </span>
      </label>
    </div>
  )
}

function Step6Resultat({ formData, setFormData, options }) {
  function toggleOption(code) {
    const selected = formData.options_selectionnees || []
    if (selected.includes(code)) {
      setFormData({
        ...formData,
        options_selectionnees: selected.filter(o => o !== code)
      })
    } else {
      setFormData({
        ...formData,
        options_selectionnees: [...selected, code]
      })
    }
  }
  
  const formulesInfo = {
    gratuite: { nom: 'Gratuite', emoji: '🟢', color: '#10b981' },
    standard: { nom: 'Standard (49€)', emoji: '🔵', color: '#3b82f6' },
    premium: { nom: 'Premium (149€)', emoji: '⭐', color: '#8b5cf6' }
  }
  
  const formuleChoisie = formulesInfo[formData.formule] || formulesInfo.gratuite
  
  return (
    <div className={styles.step}>
      <h2>Étape 6 : Récapitulatif et validation</h2>
      
      {/* Récap formule */}
      <div className={styles.formuleRecap} style={{ borderColor: formuleChoisie.color }}>
        <strong>{formuleChoisie.emoji} Formule choisie :</strong> {formuleChoisie.nom}
      </div>
      
      {/* MESSAGE SELON LA FORMULE */}
      {formData.formule === 'gratuite' && (
        <div className={styles.infoBox} style={{ background: '#d1fae5', borderColor: '#10b981' }}>
          🟢 <strong>Formule Gratuite :</strong> Résultat affiché à l'écran uniquement, pas de PDF généré.
        </div>
      )}
      
      {formData.formule === 'standard' && (
        <div className={styles.infoBox} style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
          🔵 <strong>Formule Standard :</strong> PDF généré après paiement de 49€.
        </div>
      )}
      
      {formData.formule === 'premium' && (
        <div className={styles.infoBox} style={{ background: '#ede9fe', borderColor: '#8b5cf6' }}>
          ⭐ <strong>Formule Premium :</strong> PDF détaillé après paiement de 149€.
        </div>
      )}
      
      {/* OPTIONS FACULTATIVES */}
      <div className={styles.optionsSection}>
        <h3>Options / Plus-values (facultatif)</h3>
        <p>Sélectionnez les éléments présents pour affiner l'estimation</p>
        
        <div className={styles.checkboxGroup}>
          {options.map(option => (
            <label key={option.code} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={(formData.options_selectionnees || []).includes(option.code)}
                onChange={() => toggleOption(option.code)}
              />
              <span>{option.libelle}</span>
              <span className={styles.optionValue}>
                {option.type_valeur === 'fixe' ? `+${option.valeur}€` : `+${option.valeur}%`}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
