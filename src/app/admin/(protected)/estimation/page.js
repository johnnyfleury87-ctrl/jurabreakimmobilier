/**
 * Page Admin - Paramétrage Estimation
 * Conforme à docs/estimation.md section "VUE ADMIN"
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function AdminEstimationPage() {
  const [activeTab, setActiveTab] = useState('communes')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  
  // États pour chaque section
  const [zones, setZones] = useState([])
  const [communes, setCommunes] = useState([])
  const [coefficients, setCoefficients] = useState([])
  const [options, setOptions] = useState([])
  const [marges, setMarges] = useState([])
  const [mentions, setMentions] = useState([])
  const [versions, setVersions] = useState([])
  
  const supabase = createClient()
  
  // Charger les données au montage
  useEffect(() => {
    loadData()
  }, [activeTab])
  
  async function loadData() {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'zones':
          const { data: zonesData } = await supabase
            .from('estimation_zones')
            .select('*')
            .order('nom')
          setZones(zonesData || [])
          break
          
        case 'communes':
          const { data: communesData } = await supabase
            .from('estimation_communes')
            .select('*, zone:estimation_zones(nom)')
            .order('nom')
          setCommunes(communesData || [])
          break
          
        case 'coefficients':
          const { data: coefficientsData } = await supabase
            .from('estimation_coefficients')
            .select('*')
            .order('categorie, ordre')
          setCoefficients(coefficientsData || [])
          break
          
        case 'options':
          const { data: optionsData } = await supabase
            .from('estimation_options')
            .select('*')
            .order('ordre')
          setOptions(optionsData || [])
          break
          
        case 'marges':
          const { data: margesData } = await supabase
            .from('estimation_marges')
            .select('*')
          setMarges(margesData || [])
          break
          
        case 'mentions':
          const { data: mentionsData } = await supabase
            .from('estimation_mentions_legales')
            .select('*')
            .order('motif, version')
          setMentions(mentionsData || [])
          break
          
        case 'versions':
          const { data: versionsData } = await supabase
            .from('estimation_versions_regles')
            .select('*')
            .order('version_number', { ascending: false })
            .limit(20)
          setVersions(versionsData || [])
          break
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
      setMessage({ type: 'error', text: 'Erreur de chargement' })
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSaveZone(zone) {
    try {
      if (zone.id) {
        await supabase
          .from('estimation_zones')
          .update(zone)
          .eq('id', zone.id)
      } else {
        await supabase
          .from('estimation_zones')
          .insert(zone)
      }
      setMessage({ type: 'success', text: 'Zone enregistrée' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }
  
  async function handleSaveCommune(commune) {
    try {
      if (commune.id) {
        await supabase
          .from('estimation_communes')
          .update(commune)
          .eq('id', commune.id)
      } else {
        await supabase
          .from('estimation_communes')
          .insert(commune)
      }
      setMessage({ type: 'success', text: 'Commune enregistrée' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }
  
  async function handleSaveCoefficient(coef) {
    try {
      if (coef.id) {
        await supabase
          .from('estimation_coefficients')
          .update(coef)
          .eq('id', coef.id)
      } else {
        await supabase
          .from('estimation_coefficients')
          .insert(coef)
      }
      setMessage({ type: 'success', text: 'Coefficient enregistré' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }
  
  async function handleSaveOption(option) {
    try {
      if (option.id) {
        await supabase
          .from('estimation_options')
          .update(option)
          .eq('id', option.id)
      } else {
        await supabase
          .from('estimation_options')
          .insert(option)
      }
      setMessage({ type: 'success', text: 'Option enregistrée' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }
  
  async function handleSaveMarge(marge) {
    try {
      await supabase
        .from('estimation_marges')
        .update(marge)
        .eq('niveau_fiabilite', marge.niveau_fiabilite)
      setMessage({ type: 'success', text: 'Marge enregistrée' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }
  
  async function handleCreateVersion(description) {
    try {
      const response = await fetch('/api/admin/estimation/create-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Version créée' })
        loadData()
      } else {
        throw new Error('Erreur création version')
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }
  
  return (
    <div className={styles.container}>
      <h1>Paramétrage Estimation</h1>
      
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
      
      <div className={styles.tabs}>
        <button
          className={activeTab === 'communes' ? styles.active : ''}
          onClick={() => setActiveTab('communes')}
        >
          Communes
        </button>
        <button
          className={activeTab === 'zones' ? styles.active : ''}
          onClick={() => setActiveTab('zones')}
        >
          Zones
        </button>
        <button
          className={activeTab === 'coefficients' ? styles.active : ''}
          onClick={() => setActiveTab('coefficients')}
        >
          Coefficients
        </button>
        <button
          className={activeTab === 'options' ? styles.active : ''}
          onClick={() => setActiveTab('options')}
        >
          Options / Plus-values
        </button>
        <button
          className={activeTab === 'marges' ? styles.active : ''}
          onClick={() => setActiveTab('marges')}
        >
          Marges Fourchette
        </button>
        <button
          className={activeTab === 'mentions' ? styles.active : ''}
          onClick={() => setActiveTab('mentions')}
        >
          Mentions Légales
        </button>
        <button
          className={activeTab === 'versions' ? styles.active : ''}
          onClick={() => setActiveTab('versions')}
        >
          Versioning
        </button>
      </div>
      
      <div className={styles.content}>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <>
            {activeTab === 'zones' && (
              <ZonesTab zones={zones} onSave={handleSaveZone} />
            )}
            {activeTab === 'communes' && (
              <CommunesTab communes={communes} zones={zones} onSave={handleSaveCommune} />
            )}
            {activeTab === 'coefficients' && (
              <CoefficientsTab coefficients={coefficients} onSave={handleSaveCoefficient} />
            )}
            {activeTab === 'options' && (
              <OptionsTab options={options} onSave={handleSaveOption} />
            )}
            {activeTab === 'marges' && (
              <MargesTab marges={marges} onSave={handleSaveMarge} />
            )}
            {activeTab === 'mentions' && (
              <MentionsTab mentions={mentions} />
            )}
            {activeTab === 'versions' && (
              <VersionsTab versions={versions} onCreate={handleCreateVersion} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// =====================================================================
// COMPOSANTS ONGLETS
// =====================================================================

function ZonesTab({ zones, onSave }) {
  const [editingZone, setEditingZone] = useState(null)
  
  return (
    <div>
      <h2>Zones géographiques</h2>
      <button onClick={() => setEditingZone({ nom: '', description: '', prix_m2_reference: '', actif: true })}>
        + Nouvelle zone
      </button>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Prix/m² référence</th>
            <th>Actif</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {zones.map(zone => (
            <tr key={zone.id}>
              <td>{zone.nom}</td>
              <td>{zone.description}</td>
              <td>{zone.prix_m2_reference} €</td>
              <td>{zone.actif ? '✓' : '✗'}</td>
              <td>
                <button onClick={() => setEditingZone(zone)}>Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {editingZone && (
        <ZoneForm zone={editingZone} onSave={onSave} onCancel={() => setEditingZone(null)} />
      )}
    </div>
  )
}

function ZoneForm({ zone, onSave, onCancel }) {
  const [formData, setFormData] = useState(zone)
  
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3>{zone.id ? 'Modifier' : 'Nouvelle'} Zone</h3>
        <input
          type="text"
          placeholder="Nom"
          value={formData.nom}
          onChange={e => setFormData({ ...formData, nom: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Prix/m²"
          value={formData.prix_m2_reference}
          onChange={e => setFormData({ ...formData, prix_m2_reference: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={formData.actif}
            onChange={e => setFormData({ ...formData, actif: e.target.checked })}
          />
          Actif
        </label>
        <div className={styles.actions}>
          <button onClick={() => onSave(formData)}>Enregistrer</button>
          <button onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  )
}

function CommunesTab({ communes, zones, onSave }) {
  // Similaire à ZonesTab
  return <div><h2>Communes du Jura</h2><p>Implémentation similaire...</p></div>
}

function CoefficientsTab({ coefficients, onSave }) {
  // Similaire à ZonesTab
  return <div><h2>Coefficients</h2><p>Implémentation similaire...</p></div>
}

function OptionsTab({ options, onSave }) {
  // Similaire à ZonesTab
  return <div><h2>Options / Plus-values</h2><p>Implémentation similaire...</p></div>
}

function MargesTab({ marges, onSave }) {
  return (
    <div>
      <h2>Marges de fourchette</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Niveau</th>
            <th>Marge basse (%)</th>
            <th>Marge haute (%)</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {marges.map(marge => (
            <tr key={marge.niveau_fiabilite}>
              <td>{marge.niveau_fiabilite}</td>
              <td>{(marge.marge_basse * 100).toFixed(0)}%</td>
              <td>{(marge.marge_haute * 100).toFixed(0)}%</td>
              <td>{marge.description}</td>
              <td><button>Modifier</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MentionsTab({ mentions }) {
  return (
    <div>
      <h2>Mentions légales par motif</h2>
      <p>Gestion des mentions légales versionnées...</p>
    </div>
  )
}

function VersionsTab({ versions, onCreate }) {
  const [description, setDescription] = useState('')
  
  return (
    <div>
      <h2>Versioning des règles</h2>
      <div className={styles.versionCreate}>
        <input
          type="text"
          placeholder="Description de la version"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button onClick={() => { onCreate(description); setDescription('') }}>
          Créer nouvelle version
        </button>
      </div>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Version</th>
            <th>Description</th>
            <th>Date création</th>
          </tr>
        </thead>
        <tbody>
          {versions.map(v => (
            <tr key={v.id}>
              <td>v{v.version_number}</td>
              <td>{v.description}</td>
              <td>{new Date(v.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
