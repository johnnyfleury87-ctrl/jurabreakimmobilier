'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import AnnonceMedia from '@/components/AnnonceMedia'
import { Card } from '@/components/ui'
import { calculerHonoraires, formatterHonoraires } from '@/lib/honoraires'
import styles from './page.module.css'

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredAnnonces, setFilteredAnnonces] = useState([])
  
  // Filtres
  const [filters, setFilters] = useState({
    type_bien: 'all',
    type_transaction: 'all',
    statut: 'all',
    ville: 'all',
    prix_min: '',
    prix_max: '',
    surface_min: ''
  })

  const [villes, setVilles] = useState([])
  const [sortBy, setSortBy] = useState('recent') // recent, prix_asc, prix_desc, surface

  useEffect(() => {
    fetchAnnonces()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [annonces, filters, sortBy])

  async function fetchAnnonces() {
    try {
      setLoading(true)
      
      // Appeler l'API publique (à créer)
      const response = await fetch('/api/annonces')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des annonces')
      }
      
      const data = await response.json()
      setAnnonces(data.annonces || [])
      
      // Extraire les villes uniques
      const uniqueVilles = [...new Set(data.annonces.map(a => a.ville))].sort()
      setVilles(uniqueVilles)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...annonces]

    // Filtre type de bien
    if (filters.type_bien !== 'all') {
      filtered = filtered.filter(a => a.type_bien === filters.type_bien)
    }

    // Filtre type transaction
    if (filters.type_transaction !== 'all') {
      filtered = filtered.filter(a => a.type_transaction === filters.type_transaction)
    }

    // Filtre statut
    if (filters.statut !== 'all') {
      filtered = filtered.filter(a => a.statut === filters.statut)
    }

    // Filtre ville
    if (filters.ville !== 'all') {
      filtered = filtered.filter(a => a.ville === filters.ville)
    }

    // Filtre prix
    if (filters.prix_min) {
      filtered = filtered.filter(a => a.prix >= parseFloat(filters.prix_min))
    }
    if (filters.prix_max) {
      filtered = filtered.filter(a => a.prix <= parseFloat(filters.prix_max))
    }

    // Filtre surface
    if (filters.surface_min) {
      filtered = filtered.filter(a => a.surface_m2 >= parseFloat(filters.surface_min))
    }

    // Tri
    switch (sortBy) {
      case 'prix_asc':
        filtered.sort((a, b) => a.prix - b.prix)
        break
      case 'prix_desc':
        filtered.sort((a, b) => b.prix - a.prix)
        break
      case 'surface':
        filtered.sort((a, b) => (b.surface_m2 || 0) - (a.surface_m2 || 0))
        break
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        break
    }

    setFilteredAnnonces(filtered)
  }

  function handleFilterChange(name, value) {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  function resetFilters() {
    setFilters({
      type_bien: 'all',
      type_transaction: 'all',
      statut: 'all',
      ville: 'all',
      prix_min: '',
      prix_max: '',
      surface_min: ''
    })
    setSortBy('recent')
  }

  if (loading) {
    return (
      <div className={styles.annoncesPage}>
        <HeroSection
          title="Nos Annonces"
          subtitle="Découvrez notre sélection de biens immobiliers dans le Jura"
          buttons={[
            { href: '/contact', label: 'Nous contacter', variant: 'primary' },
            { href: '/estimation', label: 'Demander une estimation', variant: 'secondary' }
          ]}
          imageSrc="/images/branding/annonce.png"
          imageAlt="Annonces JuraBreak Immobilier"
          minHeight="60vh"
        />
        <div className={styles.mainContent}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            Chargement des annonces...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.annoncesPage}>
      {/* HERO SECTION - Identique à Honoraires */}
      <HeroSection
        title="Nos Annonces"
        subtitle="Découvrez notre sélection de biens immobiliers dans le Jura"
        buttons={[
          { href: '/contact', label: 'Nous contacter', variant: 'primary' },
          { href: '/estimation', label: 'Demander une estimation', variant: 'secondary' }
        ]}
        imageSrc="/images/branding/annonce.png"
        imageAlt="Annonces JuraBreak Immobilier"
        minHeight="60vh"
      />

      {/* CONTENU PRINCIPAL */}
      <div className={styles.mainContent}>
        {/* FILTRES */}
        <div className={styles.filtersContainer}>
          <div className={styles.filtersGrid}>
            <select 
              value={filters.type_bien}
              onChange={(e) => handleFilterChange('type_bien', e.target.value)}
              className={styles.select}
            >
              <option value="all">Tous les types</option>
              <option value="maison">Maison</option>
              <option value="appartement">Appartement</option>
              <option value="terrain">Terrain</option>
              <option value="immeuble">Immeuble</option>
              <option value="local_commercial">Local commercial</option>
            </select>

            <select 
              value={filters.type_transaction}
              onChange={(e) => handleFilterChange('type_transaction', e.target.value)}
              className={styles.select}
            >
              <option value="all">Vente & Location</option>
              <option value="VENTE">Vente</option>
              <option value="LOCATION">Location</option>
            </select>

            <select 
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              className={styles.select}
            >
              <option value="all">Tous les statuts</option>
              <option value="A_VENDRE">À vendre</option>
              <option value="SOUS_COMPROMIS">Sous compromis</option>
              <option value="EN_LOCATION">En location</option>
              <option value="LOUE">Loué</option>
            </select>

            {villes.length > 0 && (
              <select 
                value={filters.ville}
                onChange={(e) => handleFilterChange('ville', e.target.value)}
                className={styles.select}
              >
                <option value="all">Toutes les villes</option>
                {villes.map(ville => (
                  <option key={ville} value={ville}>{ville}</option>
                ))}
              </select>
            )}

            <input
              type="number"
              placeholder="Prix min"
              value={filters.prix_min}
              onChange={(e) => handleFilterChange('prix_min', e.target.value)}
              className={styles.input}
            />

            <input
              type="number"
              placeholder="Prix max"
              value={filters.prix_max}
              onChange={(e) => handleFilterChange('prix_max', e.target.value)}
              className={styles.input}
            />

            <input
              type="number"
              placeholder="Surface min (m²)"
              value={filters.surface_min}
              onChange={(e) => handleFilterChange('surface_min', e.target.value)}
              className={styles.input}
            />

            <button onClick={resetFilters} className={styles.resetBtn}>
              Réinitialiser
            </button>
          </div>

          <div className={styles.sortBar}>
            <span className={styles.resultsCount}>
              {filteredAnnonces.length} résultat{filteredAnnonces.length > 1 ? 's' : ''}
            </span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.select}
            >
              <option value="recent">Plus récentes</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="surface">Surface décroissante</option>
            </select>
          </div>
        </div>
      
        {filteredAnnonces.length === 0 ? (
          <Card padding="lg" className={styles.emptyCard}>
            <p className={styles.empty}>
              Aucune annonce ne correspond à vos critères.
            </p>
            <button onClick={resetFilters} className={styles.resetBtnLarge}>
              Voir toutes les annonces
            </button>
          </Card>
        ) : (
          <div className={styles.grid}>
          {filteredAnnonces.map((annonce, index) => {
            // Calculer les honoraires pour affichage
            const honoraires = calculerHonoraires({
              typeTransaction: annonce.type_transaction,
              typeBien: annonce.type_bien,
              prix: annonce.prix,
              loyerHC: annonce.loyer_hc,
              surfaceM2: annonce.surface_m2
            })
            
            return (
              <Link 
                key={annonce.id} 
                href={`/annonces/${annonce.slug}`}
                className={styles.cardLink}
              >
                <Card hoverable clickable padding="none" className={styles.annonceCard} style={{ animationDelay: `${index * 50}ms` }}>
                  {annonce.annonce_photos && annonce.annonce_photos.length > 0 && (
                    <div className={styles.imageContainer}>
                      <AnnonceMedia
                        photos={annonce.annonce_photos.sort((a, b) => a.position - b.position)}
                        mode={annonce.mode_affichage || 'statique'}
                        alt={annonce.titre}
                      />
                      <div className={`${styles.badge} ${styles[annonce.statut?.toLowerCase()]}`}>
                        {annonce.statut?.replace('_', ' ')}
                      </div>
                      <div className={styles.transactionBadge}>
                        {annonce.type_transaction === 'VENTE' ? '💰 Vente' : '🏠 Location'}
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.cardContent}>
                    <h2 className={styles.title}>{annonce.titre}</h2>
                    <p className={styles.location}>
                      📍 {annonce.ville} ({annonce.code_postal})
                    </p>
                    <p className={styles.price}>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(annonce.prix)}
                      {annonce.type_transaction === 'LOCATION' && <span className={styles.perMonth}> /mois HC</span>}
                    </p>
                    
                    <div className={styles.details}>
                      {annonce.surface_m2 && <span>📐 {annonce.surface_m2} m²</span>}
                      {annonce.nb_pieces && <span>🚪 {annonce.nb_pieces} pièces</span>}
                      {annonce.nb_chambres && <span>🛏️ {annonce.nb_chambres} ch.</span>}
                    </div>

                    {honoraires && honoraires.total > 0 && (
                      <div className={styles.honoraires}>
                        Honoraires: {formatterHonoraires(honoraires)}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
        )}
      </div>
    </div>
  )
}
