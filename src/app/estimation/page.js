'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function EstimationPage() {
  const router = useRouter()
  const [selectedFormule, setSelectedFormule] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse_bien: '',
    type_bien: 'maison',
    surface: '',
    nb_pieces: '',
    annee_construction: '',
    etat_general: '',
    travaux: '',
    environnement: ''
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const formules = [
    {
      id: 'formule_0',
      nom: 'Formule 0 - Gratuite',
      prix: 'Gratuit',
      description: 'Estimation indicative rapide',
      features: [
        'Estimation automatique',
        'Rapport simplifié',
        'Résultat immédiat',
        'Aucune valeur juridique'
      ]
    },
    {
      id: 'formule_1',
      nom: 'Formule 1 - Standard',
      prix: '49€',
      description: 'Estimation détaillée avec PDF',
      features: [
        'Analyse du marché local',
        'Rapport PDF détaillé',
        'Comparaison avec biens similaires',
        'Valeur indicative'
      ]
    },
    {
      id: 'formule_2',
      nom: 'Formule 2 - Premium',
      prix: '149€',
      description: 'Estimation juridiquement viable',
      features: [
        'Visite sur place',
        'Rapport PDF signé',
        'Valeur juridiquement reconnue',
        'Conseil personnalisé'
      ]
    }
  ]
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Validation CGV pour formules payantes
    if ((selectedFormule === 'formule_1' || selectedFormule === 'formule_2') && !termsAccepted) {
      setError('Vous devez accepter les conditions générales de vente pour continuer.')
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/estimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          formule: selectedFormule,
          termsAccepted: termsAccepted
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (selectedFormule === 'formule_0') {
          // Gratuit: afficher résultat directement
          router.push(`/estimation/resultat/${data.id}`)
        } else {
          // Payant: rediriger vers Stripe
          router.push(data.checkoutUrl)
        }
      } else {
        throw new Error('Erreur lors de la création de l\'estimation')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.estimation}>
      <div className="container">
        <h1>Estimation de votre bien</h1>
        <p className={styles.intro}>
          Obtenez une estimation de votre bien immobilier en quelques clics.
        </p>
        
        {!selectedFormule ? (
          <div className={styles.formules}>
            <h2 className={styles.formTitle}>Choisissez votre formule</h2>
            <div className={styles.grid}>
              {formules.map((formule) => (
                <div key={formule.id} className={styles.formuleCard}>
                  <h3>{formule.nom}</h3>
                  <div className={styles.prix}>{formule.prix}</div>
                  <p className={styles.description}>{formule.description}</p>
                  <ul className={styles.features}>
                    {formule.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelectedFormule(formule.id)}
                    className={styles.selectButton}
                  >
                    Choisir cette formule
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.form}>
            <div className={styles.formuleSelected}>
              <p>Formule sélectionnée: <strong>{formules.find(f => f.id === selectedFormule)?.nom}</strong></p>
              <button 
                onClick={() => setSelectedFormule(null)}
                className={styles.changeFormule}
              >
                Changer de formule
              </button>
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <h2>Vos informations</h2>
              
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
              
              <h2 className={styles.formTitle}>Votre bien</h2>
              
              <div className={styles.field}>
                <label htmlFor="adresse_bien">Adresse du bien *</label>
                <input
                  type="text"
                  id="adresse_bien"
                  name="adresse_bien"
                  value={formData.adresse_bien}
                  onChange={handleChange}
                  placeholder="Rue, ville, code postal"
                  required
                />
              </div>
              
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="type_bien">Type de bien *</label>
                  <select
                    id="type_bien"
                    name="type_bien"
                    value={formData.type_bien}
                    onChange={handleChange}
                    required
                  >
                    <option value="maison">Maison</option>
                    <option value="appartement">Appartement</option>
                    <option value="terrain">Terrain</option>
                    <option value="local_commercial">Local commercial</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                
                <div className={styles.field}>
                  <label htmlFor="surface">Surface (m²) *</label>
                  <input
                    type="number"
                    id="surface"
                    name="surface"
                    value={formData.surface}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="nb_pieces">Nombre de pièces</label>
                  <input
                    type="number"
                    id="nb_pieces"
                    name="nb_pieces"
                    value={formData.nb_pieces}
                    onChange={handleChange}
                  />
                </div>
                
                <div className={styles.field}>
                  <label htmlFor="annee_construction">Année de construction</label>
                  <input
                    type="number"
                    id="annee_construction"
                    name="annee_construction"
                    value={formData.annee_construction}
                    onChange={handleChange}
                    placeholder="Ex: 1990"
                  />
                </div>
              </div>
              
              <div className={styles.field}>
                <label htmlFor="etat_general">État général</label>
                <select
                  id="etat_general"
                  name="etat_general"
                  value={formData.etat_general}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez...</option>
                  <option value="neuf">Neuf</option>
                  <option value="excellent">Excellent</option>
                  <option value="bon">Bon</option>
                  <option value="moyen">Moyen</option>
                  <option value="a_renover">À rénover</option>
                </select>
              </div>
              
              <div className={styles.field}>
                <label htmlFor="travaux">Travaux récents ou prévus</label>
                <textarea
                  id="travaux"
                  name="travaux"
                  rows="3"
                  value={formData.travaux}
                  onChange={handleChange}
                  placeholder="Décrivez les travaux effectués ou à prévoir"
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="environnement">Environnement / Proximités</label>
                <textarea
                  id="environnement"
                  name="environnement"
                  rows="3"
                  value={formData.environnement}
                  onChange={handleChange}
                  placeholder="Commerces, écoles, transports..."
                />
              </div>
              
              {(selectedFormule === 'formule_1' || selectedFormule === 'formule_2') && (
                <div className={styles.termsCheckbox}>
                  <label>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                    />
                    <span>
                      J'accepte les <a href="/mentions-legales" target="_blank" rel="noopener noreferrer">Conditions Générales de Vente</a> et autorise JuraBreak Immobilier à traiter mes données personnelles dans le cadre de cette estimation. *
                    </span>
                  </label>
                </div>
              )}
              
              <div className={styles.disclaimer}>
                <p><strong>Disclaimer:</strong> {
                  selectedFormule === 'formule_0'
                    ? 'Cette estimation est purement indicative et n\'a aucune valeur juridique. Elle est basée sur des données automatiques et ne remplace pas une expertise professionnelle.'
                    : selectedFormule === 'formule_1'
                    ? 'Cette estimation est basée sur une analyse détaillée du marché mais reste indicative. Pour une estimation juridiquement reconnue, optez pour la Formule 2.'
                    : 'Cette estimation inclut une visite sur place et génère un rapport juridiquement viable, signé par un professionnel.'
                }</p>
              </div>
              
              <button 
                type="submit" 
                className={styles.submit}
                disabled={loading}
              >
                {loading ? 'Traitement...' : selectedFormule === 'formule_0' ? 'Obtenir mon estimation' : 'Procéder au paiement'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
