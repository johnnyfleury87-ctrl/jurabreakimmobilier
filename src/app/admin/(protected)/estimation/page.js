/**
 * Page Admin - Paramétrage Estimation
 * Conforme à docs/estimation.md section "VUE ADMIN"
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function AdminEstimationPage() {
  const [activeTab, setActiveTab] = useState('parametres')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  
  // États pour chaque section
  const [parametresGlobaux, setParametresGlobaux] = useState([])
  const [configFormules, setConfigFormules] = useState([])
  const [zones, setZones] = useState([])
  const [communes, setCommunes] = useState([])
  const [coefficients, setCoefficients] = useState([])
  const [options, setOptions] = useState([])
  const [marges, setMarges] = useState([])
  const [mentions, setMentions] = useState([])
  const [versions, setVersions] = useState([])
  const [estimations, setEstimations] = useState([])
  
  const supabase = createClient()
  
  // Charger les données au montage
  useEffect(() => {
    loadData()
  }, [activeTab])
  
  async function loadData() {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'parametres':
          // Charger paramètres globaux et config formules
          const response = await fetch('/api/admin/estimation/parametres')
          const data = await response.json()
          if (data.success) {
            setParametresGlobaux(data.parametres_globaux || [])
            setConfigFormules(data.config_formules || [])
          }
          break
          
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
          
        case 'estimations':
          // Utiliser endpoint admin avec service role pour contourner RLS
          const responseEst = await fetch('/api/admin/estimation/list')
          const dataEst = await responseEst.json()
          
          if (!responseEst.ok) {
            throw new Error(dataEst.error || 'Erreur chargement estimations')
          }
          
          console.log('[ADMIN UI] Estimations chargées:', dataEst.count)
          setEstimations(dataEst.estimations || [])
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
  
  async function handleUpdateParametreGlobal(cle, valeur) {
    try {
      const response = await fetch('/api/admin/estimation/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'parametre_global',
          cle,
          valeur
        })
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Paramètre mis à jour' })
        loadData()
      } else {
        throw new Error('Erreur mise à jour')
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }
  
  async function handleUpdateConfigFormule(formule, updates) {
    try {
      const response = await fetch('/api/admin/estimation/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'config_formule',
          formule,
          updates
        })
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration formule mise à jour' })
        loadData()
      } else {
        throw new Error('Erreur mise à jour')
      }
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
      <h1 className={styles.title}>Paramétrage Estimation</h1>
      
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
      
      <div className={styles.tabs}>
        <button
          className={activeTab === 'parametres' ? styles.active : ''}
          onClick={() => setActiveTab('parametres')}
        >
          ⚙️ Paramètres Globaux
        </button>
        <button
          className={activeTab === 'estimations' ? styles.active : ''}
          onClick={() => setActiveTab('estimations')}
        >
          📄 Estimations (Test PDF)
        </button>
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
            {activeTab === 'parametres' && (
              <ParametresTab
                parametresGlobaux={parametresGlobaux}
                configFormules={configFormules}
                onUpdateParametre={handleUpdateParametreGlobal}
                onUpdateFormule={handleUpdateConfigFormule}
              />
            )}
            {activeTab === 'estimations' && (
              <EstimationsTab 
                estimations={estimations} 
                onReload={loadData}
                setMessage={setMessage}
              />
            )}
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

function ParametresTab({ parametresGlobaux, configFormules, onUpdateParametre, onUpdateFormule }) {
  return (
    <div>
      <h2>⚙️ Paramètres Globaux</h2>
      
      <div className={styles.parametresSection}>
        <h3>Contrôles du Service</h3>
        <p className={styles.helpText}>
          Ces paramètres permettent d'activer/désactiver le module et de contrôler la génération PDF et l'envoi email.
        </p>
        
        <div className={styles.parametresList}>
          {parametresGlobaux.map(param => {
            const isTestMode = param.cle === 'mode_test_pdf_admin'
            return (
              <div key={param.cle} className={`${styles.parametreItem} ${isTestMode ? styles.testModeParam : ''}`}>
                <div className={styles.parametreInfo}>
                  <h4>
                    {isTestMode && '🧪 '}
                    {param.cle.replace(/_/g, ' ').toUpperCase()}
                  </h4>
                  <p>{param.description}</p>
                  {isTestMode && (
                    <div className={styles.warning} style={{ marginTop: '0.5rem' }}>
                      ⚠️ Mode réservé aux admins. Permet de générer des PDFs test même pour formule gratuite.
                    </div>
                  )}
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={param.valeur === true}
                    onChange={(e) => onUpdateParametre(param.cle, e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className={styles.formulesSection}>
        <h3>Configuration des Formules</h3>
        <p className={styles.helpText}>
          Définissez les autorisations PDF et Email pour chaque formule.
        </p>
        
        <div className={styles.formulesGrid}>
          {configFormules.map(formule => (
            <div key={formule.formule} className={styles.formuleConfig}>
              <div className={styles.formuleHeader}>
                <h4>{formule.nom_affichage}</h4>
                <span className={styles.prix}>{formule.prix}€</span>
              </div>
              
              <p className={styles.description}>{formule.description}</p>
              
              <div className={styles.formuleControls}>
                <label className={styles.checkboxControl}>
                  <input
                    type="checkbox"
                    checked={formule.pdf_autorise}
                    onChange={(e) => onUpdateFormule(formule.formule, { pdf_autorise: e.target.checked })}
                  />
                  <span>✅ PDF autorisé</span>
                </label>
                
                <label className={styles.checkboxControl}>
                  <input
                    type="checkbox"
                    checked={formule.email_autorise}
                    onChange={(e) => onUpdateFormule(formule.formule, { email_autorise: e.target.checked })}
                  />
                  <span>📧 Email autorisé</span>
                </label>
                
                <label className={styles.checkboxControl}>
                  <input
                    type="checkbox"
                    checked={formule.champs_premium_requis}
                    onChange={(e) => onUpdateFormule(formule.formule, { champs_premium_requis: e.target.checked })}
                  />
                  <span>⭐ Champs premium requis</span>
                </label>
                
                <label className={styles.checkboxControl}>
                  <input
                    type="checkbox"
                    checked={formule.actif}
                    onChange={(e) => onUpdateFormule(formule.formule, { actif: e.target.checked })}
                  />
                  <span>🟢 Formule active</span>
                </label>
              </div>
              
              {formule.formule === 'gratuite' && (
                <div className={styles.warning}>
                  ⚠️ La formule gratuite ne doit JAMAIS générer de PDF ni envoyer d'email
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.logicSection}>
        <h3>📋 Logique Produit</h3>
        <div className={styles.logicGrid}>
          <div className={styles.logicItem}>
            <h4>🟢 Gratuite</h4>
            <ul>
              <li>✓ Affichage écran uniquement</li>
              <li>✓ Fourchette visible</li>
              <li>✗ Pas de PDF</li>
              <li>✗ Pas d'email</li>
            </ul>
          </div>
          
          <div className={styles.logicItem}>
            <h4>🔵 Standard</h4>
            <ul>
              <li>✓ PDF généré</li>
              <li>✓ Téléchargeable</li>
              <li>✓ Email si activé</li>
              <li>✓ Données complètes</li>
            </ul>
          </div>
          
          <div className={styles.logicItem}>
            <h4>⭐ Premium</h4>
            <ul>
              <li>✓ PDF généré</li>
              <li>✓ Champs supplémentaires</li>
              <li>✓ Email automatique</li>
              <li>✓ Rapport détaillé</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function ZonesTab({ zones, onSave }) {
  const [editingZone, setEditingZone] = useState(null)
  
  return (
    <div>
      <h2 className={styles.subtitle}>Zones géographiques</h2>
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
        <h3 className={styles.modalTitle}>{zone.id ? 'Modifier' : 'Nouvelle'} Zone</h3>
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

// =====================================================================
// COMPOSANT : ESTIMATIONS (avec génération PDF test)
// =====================================================================

function EstimationsTab({ estimations, onReload, setMessage }) {
  const [generatingPDF, setGeneratingPDF] = useState(null)
  const [downloadingPDF, setDownloadingPDF] = useState(null)
  const [creatingTest, setCreatingTest] = useState(false)
  const supabase = createClient()

  async function handleCreateTestEstimation() {
    setCreatingTest(true)
    try {
      const response = await fetch('/api/admin/estimation/create-test', {
        method: 'POST'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur création estimation test')
      }

      setMessage({ 
        type: 'success', 
        text: `✅ Estimation test créée : #${result.estimation_id.slice(0, 8)}` 
      })
      
      // Recharger la liste
      onReload()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setCreatingTest(false)
    }
  }

  async function handleGeneratePDFTest(estimationId) {
    setGeneratingPDF(estimationId)
    try {
      const response = await fetch(`/api/admin/estimation/${estimationId}/generate-pdf-test`, {
        method: 'POST'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur génération PDF')
      }

      setMessage({ 
        type: 'success', 
        text: `✅ ${result.message} - ${result.warning}` 
      })
      
      // Recharger la liste
      onReload()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setGeneratingPDF(null)
    }
  }

  async function handleDownloadPDF(estimation) {
    if (!estimation.pdf_path) {
      setMessage({ type: 'error', text: 'Aucun PDF généré pour cette estimation' })
      return
    }

    setDownloadingPDF(estimation.id)
    try {
      const { data, error } = await supabase.storage
        .from('estimations')
        .download(estimation.pdf_path)

      if (error) throw error

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `estimation_${estimation.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: 'PDF téléchargé' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setDownloadingPDF(null)
    }
  }

  function getFormuleBadge(formule) {
    const badges = {
      gratuite: { text: '🟢 Gratuite', color: '#10b981' },
      standard: { text: '🔵 Standard', color: '#3b82f6' },
      premium: { text: '⭐ Premium', color: '#8b5cf6' }
    }
    const badge = badges[formule] || badges.gratuite
    return <span style={{ color: badge.color, fontWeight: 'bold' }}>{badge.text}</span>
  }

  function getPDFModeBadge(mode) {
    if (mode === 'test') {
      return <span style={{ background: '#ff0000', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '0.8em' }}>TEST</span>
    }
    return <span style={{ background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '0.8em' }}>PROD</span>
  }

  return (
    <div>
      <h2>📄 Estimations - Génération PDF Test</h2>
      <p className={styles.helpText}>
        🧪 <strong>Mode Test PDF Admin :</strong> Générez des PDFs test pour valider le rendu sans paiement. 
        Les PDFs test sont marqués clairement et ne doivent pas être utilisés en production.
      </p>

      {estimations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Aucune estimation trouvée</p>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Créez une estimation de test pour tester la génération PDF
          </p>
          <button
            onClick={handleCreateTestEstimation}
            disabled={creatingTest}
            className={styles.btnTest}
            style={{ marginTop: '1.5rem' }}
          >
            {creatingTest ? '⏳ Création...' : '➕ Créer une estimation de test'}
          </button>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Formule</th>
              <th>PDF</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {estimations.map(est => (
              <tr key={est.id}>
                <td>#{est.id.slice(0, 8)}</td>
                <td>
                  {est.profiles?.nom} {est.profiles?.prenom}
                  <br />
                  <small>{est.profiles?.email}</small>
                </td>
                <td>{getFormuleBadge(est.formule)}</td>
                <td>
                  {est.pdf_path ? (
                    <div>
                      ✅ Généré {getPDFModeBadge(est.pdf_mode)}
                      <br />
                      <small>{new Date(est.pdf_generated_at).toLocaleString()}</small>
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>❌ Aucun PDF</span>
                  )}
                </td>
                <td>
                  <small>{new Date(est.created_at).toLocaleString()}</small>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <button
                      onClick={() => handleGeneratePDFTest(est.id)}
                      disabled={generatingPDF === est.id}
                      className={styles.btnTest}
                    >
                      {generatingPDF === est.id ? '⏳ Génération...' : '🧪 Générer PDF (test)'}
                    </button>
                    {est.pdf_path && (
                      <button
                        onClick={() => handleDownloadPDF(est)}
                        disabled={downloadingPDF === est.id}
                        className={styles.btnDownload}
                      >
                        {downloadingPDF === est.id ? '⏳...' : '📥 Télécharger'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
