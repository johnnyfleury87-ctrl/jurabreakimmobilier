'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

export default function AdminAnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, visible, hidden, deleted

  useEffect(() => {
    fetchAnnonces()
  }, [])

  async function fetchAnnonces() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/annonces')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des annonces')
      }
      
      const data = await response.json()
      setAnnonces(data.annonces || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, titre) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${titre}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/annonces/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      // Recharger la liste
      fetchAnnonces()
    } catch (err) {
      alert('Erreur: ' + err.message)
    }
  }

  async function handleToggleVisible(annonce) {
    try {
      const response = await fetch(`/api/admin/annonces/${annonce.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...annonce,
          visible: !annonce.visible,
          published_at: !annonce.visible ? new Date().toISOString() : annonce.published_at
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      fetchAnnonces()
    } catch (err) {
      alert('Erreur: ' + err.message)
    }
  }

  async function handleChangeStatut(annonce, newStatut) {
    try {
      const response = await fetch(`/api/admin/annonces/${annonce.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...annonce,
          statut: newStatut
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      fetchAnnonces()
    } catch (err) {
      alert('Erreur: ' + err.message)
    }
  }

  async function createTestAnnonce() {
    if (!confirm('Créer une annonce de test ?')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: `Maison test - ${new Date().toLocaleString('fr-FR')}`,
          type_bien: 'maison',
          type_transaction: 'VENTE',
          description: 'Ceci est une annonce de test créée automatiquement pour valider le système.',
          points_forts: ['Test fonctionnel', 'Création rapide', 'Validation système'],
          ville: 'Lons-le-Saunier',
          code_postal: '39000',
          secteur: 'Centre-ville',
          prix: 250000,
          surface_m2: 120,
          terrain_m2: 500,
          nb_pieces: 5,
          nb_chambres: 3,
          nb_salles_bain: 1,
          statut: 'A_VENDRE',
          visible: true,
          published_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      alert('✅ Annonce test créée avec succès !')
      fetchAnnonces()
    } catch (err) {
      alert('❌ Erreur: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnnonces = annonces.filter(a => {
    if (filter === 'all') return true
    if (filter === 'visible') return a.visible && !a.is_deleted
    if (filter === 'hidden') return !a.visible && !a.is_deleted
    if (filter === 'deleted') return a.is_deleted
    return true
  })

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Erreur: {error}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Gestion des annonces</h1>
          <p className={styles.subtitle}>{filteredAnnonces.length} annonce(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={createTestAnnonce} 
            className={styles.btnSecondary}
            disabled={loading}
          >
            🧪 Annonce test
          </button>
          <Link href="/admin/annonces/new" className={styles.btnPrimary}>
            + Nouvelle annonce
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
        <button 
          className={filter === 'all' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('all')}
        >
          Toutes ({annonces.length})
        </button>
        <button 
          className={filter === 'visible' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('visible')}
        >
          Visibles ({annonces.filter(a => a.visible && !a.is_deleted).length})
        </button>
        <button 
          className={filter === 'hidden' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('hidden')}
        >
          Cachées ({annonces.filter(a => !a.visible && !a.is_deleted).length})
        </button>
        <button 
          className={filter === 'deleted' ? styles.filterActive : styles.filterBtn}
          onClick={() => setFilter('deleted')}
        >
          Supprimées ({annonces.filter(a => a.is_deleted).length})
        </button>
      </div>

      <div className={styles.grid}>
        {filteredAnnonces.map(annonce => {
          const firstPhoto = annonce.annonce_photos?.sort((a, b) => a.position - b.position)[0]

          return (
            <div key={annonce.id} className={styles.card}>
              {firstPhoto && (
                <div className={styles.imageWrapper}>
                  <Image 
                    src={firstPhoto.url} 
                    alt={annonce.titre}
                    width={300}
                    height={200}
                    className={styles.image}
                  />
                  <span className={`${styles.badge} ${styles[annonce.statut?.toLowerCase()]}`}>
                    {annonce.statut?.replace('_', ' ')}
                  </span>
                </div>
              )}

              <div className={styles.cardContent}>
                <h3 className={styles.title}>{annonce.titre}</h3>
                <p className={styles.location}>
                  {annonce.ville} ({annonce.code_postal})
                </p>
                <p className={styles.price}>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(annonce.prix)}
                </p>

                <div className={styles.meta}>
                  {annonce.surface_m2 && <span>{annonce.surface_m2} m²</span>}
                  {annonce.nb_pieces && <span>{annonce.nb_pieces} pièces</span>}
                  {annonce.nb_chambres && <span>{annonce.nb_chambres} ch.</span>}
                </div>

                <div className={styles.status}>
                  <select 
                    value={annonce.statut}
                    onChange={(e) => handleChangeStatut(annonce, e.target.value)}
                    className={styles.select}
                  >
                    <option value="A_VENDRE">À vendre</option>
                    <option value="SOUS_COMPROMIS">Sous compromis</option>
                    <option value="VENDU">Vendu</option>
                    <option value="EN_LOCATION">En location</option>
                    <option value="LOUE">Loué</option>
                    <option value="RETIRE">Retiré</option>
                  </select>
                </div>

                <div className={styles.actions}>
                  <Link 
                    href={`/admin/annonces/${annonce.id}/edit`}
                    className={styles.btnEdit}
                  >
                    ✏️ Modifier
                  </Link>
                  
                  <button
                    onClick={() => handleToggleVisible(annonce)}
                    className={styles.btnToggle}
                    title={annonce.visible ? 'Masquer' : 'Afficher'}
                  >
                    {annonce.visible ? '👁️' : '🔒'}
                  </button>

                  <button
                    onClick={() => handleDelete(annonce.id, annonce.titre)}
                    className={styles.btnDelete}
                    disabled={annonce.is_deleted}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAnnonces.length === 0 && (
        <div className={styles.empty}>
          <p>Aucune annonce dans cette catégorie.</p>
          <Link href="/admin/annonces/new" className={styles.btnPrimary}>
            Créer la première annonce
          </Link>
        </div>
      )}
    </div>
  )
}
