'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { calculerHonoraires, formatterHonoraires } from '@/lib/honoraires'
import { 
  TYPE_TRANSACTION, 
  getStatutsAutorises, 
  getStatutParDefaut,
  corrigerStatut
} from '@/lib/annonces-config'
import styles from './page.module.css'

export default function NewAnnoncePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  
  const [formData, setFormData] = useState({
    // IDENTITÉ
    titre: '',
    type_bien: 'maison',
    description: '',
    points_forts: '',
    
    // LOCALISATION
    ville: '',
    code_postal: '',
    secteur: '',
    adresse: '',
    latitude: '',
    longitude: '',
    
    // PRIX & FINANCE
    prix: '',
    devise: 'EUR',
    charges: '',
    taxe_fonciere: '',
    type_transaction: 'VENTE',
    loyer_hc: '',
    
    // CARACTÉRISTIQUES
    surface_m2: '',
    terrain_m2: '',
    nb_pieces: '',
    nb_chambres: '',
    nb_salles_bain: '',
    nb_salles_eau: '',
    etage: '',
    nb_etages_immeuble: '',
    annee_construction: '',
    
    // ÉQUIPEMENTS
    chauffage: '',
    type_chauffage: '',
    climatisation: false,
    ascenseur: false,
    balcon: false,
    terrasse: false,
    jardin: false,
    garage: false,
    parking: false,
    cave: false,
    piscine: false,
    
    // DIAGNOSTICS
    dpe: '',
    ges: '',
    
    // MEDIA
    video_url: '',
    visite_virtuelle_url: '',
    mode_affichage: 'statique',
    
    // STATUT
    statut: 'A_VENDRE',
    visible: true
  })

  const [photos, setPhotos] = useState([])
  const [honoraires, setHonoraires] = useState(null)

  // Calculer les honoraires automatiquement
  useEffect(() => {
    const result = calculerHonoraires({
      typeTransaction: formData.type_transaction,
      typeBien: formData.type_bien,
      prix: parseFloat(formData.prix) || 0,
      loyerHC: parseFloat(formData.loyer_hc) || 0,
      surfaceM2: parseFloat(formData.surface_m2) || 0
    })
    setHonoraires(result)
  }, [formData.type_transaction, formData.type_bien, formData.prix, formData.loyer_hc, formData.surface_m2])

  // Corriger automatiquement le statut si incohérent avec type_transaction
  useEffect(() => {
    const statutCorrige = corrigerStatut(formData.type_transaction, formData.statut)
    if (statutCorrige !== formData.statut) {
      setFormData(prev => ({
        ...prev,
        statut: statutCorrige
      }))
    }
  }, [formData.type_transaction, formData.statut])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files)
    setPhotos(prev => [...prev, ...files])
  }

  function removePhoto(index) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1) Créer l'annonce
      const annonceData = {
        ...formData,
        points_forts: formData.points_forts.split('\n').filter(p => p.trim()),
        prix: parseFloat(formData.prix) || 0,
        charges: formData.charges ? parseFloat(formData.charges) : null,
        taxe_fonciere: formData.taxe_fonciere ? parseFloat(formData.taxe_fonciere) : null,
        loyer_hc: formData.loyer_hc ? parseFloat(formData.loyer_hc) : null,
        surface_m2: formData.surface_m2 ? parseFloat(formData.surface_m2) : null,
        terrain_m2: formData.terrain_m2 ? parseFloat(formData.terrain_m2) : null,
        nb_pieces: formData.nb_pieces ? parseInt(formData.nb_pieces) : null,
        nb_chambres: formData.nb_chambres ? parseInt(formData.nb_chambres) : null,
        nb_salles_bain: formData.nb_salles_bain ? parseInt(formData.nb_salles_bain) : null,
        nb_salles_eau: formData.nb_salles_eau ? parseInt(formData.nb_salles_eau) : null,
        etage: formData.etage ? parseInt(formData.etage) : null,
        nb_etages_immeuble: formData.nb_etages_immeuble ? parseInt(formData.nb_etages_immeuble) : null,
        annee_construction: formData.annee_construction ? parseInt(formData.annee_construction) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        
        // Ajouter les honoraires calculés
        honoraires_transaction: honoraires?.honorairesTransaction || null,
        honoraires_location: honoraires?.honorairesLocation || null,
        honoraires_etat_lieux: honoraires?.honorairesEtatLieux || null
      }

      const response = await fetch('/api/admin/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(annonceData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création')
      }

      const { annonce } = await response.json()

      // 2) Upload des photos
      if (photos.length > 0) {
        setUploadingPhotos(true)
        for (let i = 0; i < photos.length; i++) {
          const formDataPhoto = new FormData()
          formDataPhoto.append('file', photos[i])
          formDataPhoto.append('position', i.toString())
          formDataPhoto.append('is_cover', i === 0 ? 'true' : 'false')

          await fetch(`/api/admin/annonces/${annonce.id}/photos`, {
            method: 'POST',
            credentials: 'include',
            body: formDataPhoto
          })
        }
      }

      // Rediriger vers la liste des annonces
      router.push('/admin/annonces')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setLoading(false)
      setUploadingPhotos(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Nouvelle annonce</h1>
        <button 
          type="button"
          onClick={() => router.back()}
          className={styles.btnBack}
        >
          ← Retour
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* IDENTITÉ */}
        <section className={styles.section}>
          <h2>Identité du bien</h2>
          
          <div className={styles.field}>
            <label htmlFor="titre">Titre de l'annonce *</label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              required
              placeholder="Ex: Belle maison familiale avec jardin"
            />
          </div>

          <div className={styles.fieldRow}>
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
                <option value="immeuble">Immeuble</option>
                <option value="local_commercial">Local commercial</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="type_transaction">Type de transaction *</label>
              <select
                id="type_transaction"
                name="type_transaction"
                value={formData.type_transaction}
                onChange={handleChange}
                required
              >
                <option value="VENTE">Vente</option>
                <option value="LOCATION">Location</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Description détaillée du bien..."
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="points_forts">Points forts (un par ligne)</label>
            <textarea
              id="points_forts"
              name="points_forts"
              value={formData.points_forts}
              onChange={handleChange}
              rows={4}
              placeholder="Proche commodités&#10;Grand jardin&#10;Rénové récemment"
            />
          </div>
        </section>

        {/* LOCALISATION */}
        <section className={styles.section}>
          <h2>Localisation</h2>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="ville">Ville *</label>
              <input
                type="text"
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="code_postal">Code postal *</label>
              <input
                type="text"
                id="code_postal"
                name="code_postal"
                value={formData.code_postal}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="secteur">Secteur / Quartier</label>
            <input
              type="text"
              id="secteur"
              name="secteur"
              value={formData.secteur}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="adresse">Adresse (optionnel, masqué par défaut)</label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* PRIX */}
        <section className={styles.section}>
          <h2>Prix & Finance</h2>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="prix">
                {formData.type_transaction === 'VENTE' ? 'Prix de vente *' : 'Loyer HC *'}
              </label>
              <input
                type="number"
                id="prix"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>

            {formData.type_transaction === 'LOCATION' && (
              <div className={styles.field}>
                <label htmlFor="charges">Charges mensuelles</label>
                <input
                  type="number"
                  id="charges"
                  name="charges"
                  value={formData.charges}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
            )}
          </div>

          {formData.type_transaction === 'VENTE' && (
            <div className={styles.field}>
              <label htmlFor="taxe_fonciere">Taxe foncière annuelle</label>
              <input
                type="number"
                id="taxe_fonciere"
                name="taxe_fonciere"
                value={formData.taxe_fonciere}
                onChange={handleChange}
                step="0.01"
              />
            </div>
          )}

          {/* Affichage des honoraires calculés */}
          {honoraires && honoraires.total > 0 && (
            <div className={styles.honorairesBox}>
              <h3>💰 Honoraires calculés automatiquement</h3>
              <p className={styles.honorairesDetail}>{honoraires.detail}</p>
              <p className={styles.honorairesTotal}>
                Total: <strong>{formatterHonoraires(honoraires)}</strong>
              </p>
            </div>
          )}
        </section>

        {/* CARACTÉRISTIQUES */}
        <section className={styles.section}>
          <h2>Caractéristiques</h2>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="surface_m2">Surface (m²)</label>
              <input
                type="number"
                id="surface_m2"
                name="surface_m2"
                value={formData.surface_m2}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="terrain_m2">Terrain (m²)</label>
              <input
                type="number"
                id="terrain_m2"
                name="terrain_m2"
                value={formData.terrain_m2}
                onChange={handleChange}
                step="0.01"
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
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
              <label htmlFor="nb_chambres">Chambres</label>
              <input
                type="number"
                id="nb_chambres"
                name="nb_chambres"
                value={formData.nb_chambres}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="nb_salles_bain">Salles de bain</label>
              <input
                type="number"
                id="nb_salles_bain"
                name="nb_salles_bain"
                value={formData.nb_salles_bain}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="nb_salles_eau">Salles d'eau</label>
              <input
                type="number"
                id="nb_salles_eau"
                name="nb_salles_eau"
                value={formData.nb_salles_eau}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="etage">Étage</label>
              <input
                type="number"
                id="etage"
                name="etage"
                value={formData.etage}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="nb_etages_immeuble">Étages dans l'immeuble</label>
              <input
                type="number"
                id="nb_etages_immeuble"
                name="nb_etages_immeuble"
                value={formData.nb_etages_immeuble}
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
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="chauffage">Type de chauffage</label>
              <input
                type="text"
                id="chauffage"
                name="chauffage"
                value={formData.chauffage}
                onChange={handleChange}
                placeholder="Ex: gaz, électrique, fioul..."
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="type_chauffage">Chauffage</label>
              <select
                id="type_chauffage"
                name="type_chauffage"
                value={formData.type_chauffage}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner --</option>
                <option value="individuel">Individuel</option>
                <option value="collectif">Collectif</option>
              </select>
            </div>
          </div>
        </section>

        {/* ÉQUIPEMENTS */}
        <section className={styles.section}>
          <h2>Équipements</h2>
          
          <div className={styles.checkboxGrid}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="climatisation"
                checked={formData.climatisation}
                onChange={handleChange}
              />
              <span>Climatisation</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="ascenseur"
                checked={formData.ascenseur}
                onChange={handleChange}
              />
              <span>Ascenseur</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="balcon"
                checked={formData.balcon}
                onChange={handleChange}
              />
              <span>Balcon</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="terrasse"
                checked={formData.terrasse}
                onChange={handleChange}
              />
              <span>Terrasse</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="jardin"
                checked={formData.jardin}
                onChange={handleChange}
              />
              <span>Jardin</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="garage"
                checked={formData.garage}
                onChange={handleChange}
              />
              <span>Garage</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="parking"
                checked={formData.parking}
                onChange={handleChange}
              />
              <span>Parking</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="cave"
                checked={formData.cave}
                onChange={handleChange}
              />
              <span>Cave</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="piscine"
                checked={formData.piscine}
                onChange={handleChange}
              />
              <span>Piscine</span>
            </label>
          </div>
        </section>

        {/* DIAGNOSTICS */}
        <section className={styles.section}>
          <h2>Diagnostics énergétiques</h2>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="dpe">DPE</label>
              <select
                id="dpe"
                name="dpe"
                value={formData.dpe}
                onChange={handleChange}
              >
                <option value="">-- Non renseigné --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="ges">GES</label>
              <select
                id="ges"
                name="ges"
                value={formData.ges}
                onChange={handleChange}
              >
                <option value="">-- Non renseigné --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
              </select>
            </div>
          </div>
        </section>

        {/* PHOTOS */}
        <section className={styles.section}>
          <h2>Photos</h2>
          
          <div className={styles.field}>
            <label htmlFor="photos">Ajouter des photos</label>
            <input
              type="file"
              id="photos"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className={styles.fileInput}
            />
            <p className={styles.hint}>
              La première photo sera la photo de couverture
            </p>
          </div>

          {photos.length > 0 && (
            <div className={styles.photosPreview}>
              {photos.map((photo, index) => (
                <div key={index} className={styles.photoItem}>
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt={`Photo ${index + 1}`}
                    className={styles.photoThumb}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className={styles.photoRemove}
                  >
                    ✕
                  </button>
                  {index === 0 && (
                    <span className={styles.coverBadge}>Couverture</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MEDIA */}
        <section className={styles.section}>
          <h2>Médias supplémentaires</h2>
          
          <div className={styles.field}>
            <label htmlFor="video_url">URL Vidéo (YouTube, Vimeo...)</label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="visite_virtuelle_url">URL Visite virtuelle</label>
            <input
              type="url"
              id="visite_virtuelle_url"
              name="visite_virtuelle_url"
              value={formData.visite_virtuelle_url}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="mode_affichage">Mode d'affichage des photos *</label>
            <select
              id="mode_affichage"
              name="mode_affichage"
              value={formData.mode_affichage}
              onChange={handleChange}
              required
            >
              <option value="statique">📷 Statique (photo principale uniquement)</option>
              <option value="dynamique">🔁 Dynamique (carousel discret)</option>
              <option value="film">🎬 Film (défilement continu)</option>
              <option value="focus">✨ Focus alterné (changement fade)</option>
              <option value="hover">👆 Hover only (au survol desktop)</option>
            </select>
            <small className={styles.fieldHint}>
              Définit comment les photos sont présentées sur la page publique
            </small>
          </div>
        </section>

        {/* STATUT */}
        <section className={styles.section}>
          <h2>Statut & Visibilité</h2>
          
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="statut">Statut *</label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                required
              >
                {getStatutsAutorises(formData.type_transaction).map(statutKey => {
                  const labels = {
                    'A_VENDRE': 'À vendre',
                    'SOUS_COMPROMIS': 'Sous compromis',
                    'VENDU': 'Vendu',
                    'EN_LOCATION': 'Disponible à la location',
                    'LOUE': 'Loué',
                    'RETIRE': 'Retiré'
                  }
                  return (
                    <option key={statutKey} value={statutKey}>
                      {labels[statutKey]}
                    </option>
                  )
                })}
              </select>
              <small className={styles.fieldHint}>
                Statuts disponibles pour {formData.type_transaction === 'VENTE' ? 'une vente' : 'une location'}
              </small>
            </div>

            <div className={styles.field}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  name="visible"
                  checked={formData.visible}
                  onChange={handleChange}
                />
                <span>Visible sur le site public</span>
              </label>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.btnSecondary}
            disabled={loading || uploadingPhotos}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading || uploadingPhotos}
          >
            {loading ? 'Création en cours...' : uploadingPhotos ? 'Upload des photos...' : 'Créer l\'annonce'}
          </button>
        </div>
      </form>
    </div>
  )
}
