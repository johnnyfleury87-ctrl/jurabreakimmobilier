# 📝 TODO FRONTEND - PARCOURS ESTIMATION

## ⚠️ NON TRAITÉ DANS CE FIX

Le fix actuel se concentre sur:
- ✅ DB cohérente (migrations + schéma)
- ✅ Backend API (suppression joins, PDF)
- ✅ Calcul fiabilité selon formule
- ✅ Seed communes Jura

**Ce qui reste à faire côté frontend:**

---

## 🎯 OBJECTIF: Formule AVANT Critères

Actuellement dans `EstimationForm.js`, le parcours est:
1. Connexion
2. Motif
3. Critères du bien
4. Options
5. Consentement
6. **Formule** ← Trop tard !
7. Paiement

**Nouveau parcours attendu:**
1. Connexion
2. Motif
3. **Choix formule** ← Déplacer ici
4. Critères adaptatifs (selon formule)
5. Options (si formule le permet)
6. Consentement + paiement

---

## 📋 TÂCHES FRONTEND

### 1. Refactoriser EstimationForm.js

**Fichier:** `src/app/estimation/nouveau/page.js` ou similaire

**Actions:**
```javascript
// Nouvel ordre des étapes
const ETAPES = {
  CONNEXION: 'connexion',
  MOTIF: 'motif',
  FORMULE: 'formule',           // ← DÉPLACER ICI
  CRITERES: 'criteres',         // ← Devient adaptatif
  OPTIONS: 'options',
  CONSENTEMENT: 'consentement',
  PAIEMENT: 'paiement'
}
```

### 2. Créer Composant Choix Formule

**Nouveau fichier:** `src/components/estimation/FormulaSelector.js`

```javascript
export default function FormulaSelector({ onSelect, selectedFormule }) {
  const formules = [
    {
      code: 'gratuite',
      nom: 'Estimation Gratuite',
      prix: 0,
      description: 'Estimation indicative basique',
      fiabilite: '±20%',
      champs: ['surface_habitable', 'type_bien', 'commune', 'etat_bien'],
      pdf: false,
      email: false
    },
    {
      code: 'standard',
      nom: 'Estimation Standard',
      prix: 49,
      description: 'Estimation détaillée avec PDF',
      fiabilite: '±10%',
      champs: ['surface_habitable', 'type_bien', 'commune', 'etat_bien', 
               'nb_pieces', 'annee_construction', 'surface_terrain'],
      pdf: true,
      email: true
    },
    {
      code: 'premium',
      nom: 'Estimation Premium',
      prix: 99,
      description: 'Estimation très complète avec données avancées',
      fiabilite: '±5%',
      champs: ['surface_habitable', 'type_bien', 'commune', 'etat_bien',
               'nb_pieces', 'nb_chambres', 'nb_salles_bain', 'annee_construction',
               'surface_terrain', 'exposition', 'chauffage', 'dpe_classe', 'ges_classe'],
      pdf: true,
      email: true
    }
  ]
  
  return (
    <div className="formule-selector">
      {formules.map(formule => (
        <div 
          key={formule.code}
          className={`formule-card ${selectedFormule === formule.code ? 'selected' : ''}`}
          onClick={() => onSelect(formule)}
        >
          <h3>{formule.nom}</h3>
          <div className="prix">
            {formule.prix === 0 ? 'Gratuit' : `${formule.prix}€`}
          </div>
          <p>{formule.description}</p>
          <div className="fiabilite">Fiabilité: {formule.fiabilite}</div>
          <ul>
            {formule.pdf && <li>✅ PDF professionnel</li>}
            {formule.email && <li>✅ Envoi par email</li>}
            <li>✅ {formule.champs.length} critères</li>
          </ul>
        </div>
      ))}
    </div>
  )
}
```

### 3. Adapter Étape Critères

**Dans `EstimationForm.js`, fonction `renderCriteres()`:**

```javascript
function renderCriteres() {
  // Récupérer la config de la formule sélectionnée
  const formule = formules.find(f => f.code === formData.formule)
  const champsRequis = formule?.champs || []
  
  return (
    <div className="criteres">
      {/* TOUJOURS AFFICHÉS (toutes formules) */}
      <Input 
        label="Surface habitable (m²)"
        name="surface_habitable"
        type="number"
        required
      />
      
      <Select 
        label="Type de bien"
        name="type_bien"
        options={[
          { value: 'maison', label: 'Maison' },
          { value: 'appartement', label: 'Appartement' },
          { value: 'autre', label: 'Autre' }
        ]}
        required
      />
      
      {/* Code postal + communes */}
      <Input 
        label="Code postal"
        name="code_postal"
        onChange={handleCodePostalChange}
        required
      />
      
      <Select 
        label="Commune"
        name="commune_id"
        options={communes}
        disabled={!communes.length}
        required
      />
      
      <Select 
        label="État du bien"
        name="etat_bien"
        options={[
          { value: 'a_renover', label: 'À rénover' },
          { value: 'correct', label: 'Correct' },
          { value: 'bon', label: 'Bon' },
          { value: 'tres_bon', label: 'Très bon / Récent' }
        ]}
        required
      />
      
      {/* CHAMPS STANDARD (si formule ≥ standard) */}
      {champsRequis.includes('nb_pieces') && (
        <Input 
          label="Nombre de pièces"
          name="nb_pieces"
          type="number"
        />
      )}
      
      {champsRequis.includes('annee_construction') && (
        <Input 
          label="Année de construction"
          name="annee_construction"
          type="number"
        />
      )}
      
      {champsRequis.includes('surface_terrain') && (
        <Input 
          label="Surface terrain (m²)"
          name="surface_terrain"
          type="number"
        />
      )}
      
      {/* CHAMPS PREMIUM (si formule = premium) */}
      {champsRequis.includes('nb_chambres') && (
        <>
          <Input 
            label="Nombre de chambres"
            name="nb_chambres"
            type="number"
          />
          <Input 
            label="Nombre de salles de bain"
            name="nb_salles_bain"
            type="number"
          />
          <Select 
            label="Exposition"
            name="exposition"
            options={[
              { value: 'nord', label: 'Nord' },
              { value: 'sud', label: 'Sud' },
              { value: 'est', label: 'Est' },
              { value: 'ouest', label: 'Ouest' }
            ]}
          />
          <Input 
            label="Type de chauffage"
            name="chauffage"
          />
          <Select 
            label="DPE (classe énergétique)"
            name="dpe_classe"
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
              { value: 'D', label: 'D' },
              { value: 'E', label: 'E' },
              { value: 'F', label: 'F' },
              { value: 'G', label: 'G' }
            ]}
          />
          <Select 
            label="GES (émissions de gaz)"
            name="ges_classe"
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
              { value: 'D', label: 'D' },
              { value: 'E', label: 'E' },
              { value: 'F', label: 'F' },
              { value: 'G', label: 'G' }
            ]}
          />
        </>
      )}
    </div>
  )
}
```

### 4. Adapter Étape Options

```javascript
function renderOptions() {
  const formule = formules.find(f => f.code === formData.formule)
  
  // Formule gratuite: pas d'options
  if (formule?.code === 'gratuite') {
    return (
      <div className="options-disabled">
        <p>Les options ne sont disponibles qu'avec les formules Standard et Premium.</p>
        <button onClick={() => setEtape('CONSENTEMENT')}>
          Continuer sans options
        </button>
      </div>
    )
  }
  
  // Standard et Premium: toutes les options
  return (
    <div className="options">
      <h3>Options et plus-values (optionnel)</h3>
      {availableOptions.map(option => (
        <label key={option.code}>
          <input 
            type="checkbox"
            checked={formData.options_selectionnees.includes(option.code)}
            onChange={(e) => handleOptionToggle(option.code, e.target.checked)}
          />
          {option.libelle} 
          <span className="option-value">
            {option.type_valeur === 'fixe' 
              ? `+${option.valeur}€` 
              : `+${option.valeur}%`}
          </span>
        </label>
      ))}
    </div>
  )
}
```

### 5. Validation par Étape

```javascript
function validerEtape(etape) {
  switch(etape) {
    case 'FORMULE':
      return !!formData.formule
      
    case 'CRITERES':
      const formule = formules.find(f => f.code === formData.formule)
      const champsRequis = formule?.champs || []
      
      // Vérifier que tous les champs requis sont remplis
      return champsRequis.every(champ => {
        return formData[champ] !== null && formData[champ] !== undefined && formData[champ] !== ''
      })
      
    // ... autres étapes
  }
}
```

### 6. API Call avec Formule

```javascript
async function soumettre() {
  const payload = {
    // User info
    user_id: user.id,
    nom: formData.nom,
    prenom: formData.prenom,
    email: formData.email,
    telephone: formData.telephone,
    
    // Motif
    motif: formData.motif,
    motif_autre_detail: formData.motif_autre_detail,
    
    // Formule (IMPORTANT)
    formule: formData.formule,
    
    // Critères
    type_bien: formData.type_bien,
    surface_habitable: formData.surface_habitable,
    surface_terrain: formData.surface_terrain,
    commune_id: formData.commune_id,
    commune_nom: formData.commune_nom,
    code_postal: formData.code_postal,
    annee_construction: formData.annee_construction,
    etat_bien: formData.etat_bien,
    
    // Champs premium (si applicable)
    nb_pieces: formData.nb_pieces,
    nb_chambres: formData.nb_chambres,
    nb_salles_bain: formData.nb_salles_bain,
    exposition: formData.exposition,
    chauffage: formData.chauffage,
    dpe_classe: formData.dpe_classe,
    ges_classe: formData.ges_classe,
    
    // Options
    options_selectionnees: formData.options_selectionnees,
    
    // Consentement
    consentement_accepte: true,
    consentement_ip: await getClientIP(),
    consentement_at: new Date().toISOString()
  }
  
  // POST /api/estimation
  const response = await fetch('/api/estimation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  
  const result = await response.json()
  
  if (result.success) {
    // Si gratuite: rediriger vers résultat
    if (formData.formule === 'gratuite') {
      router.push(`/estimation/resultat/${result.data.id}`)
    } else {
      // Si payante: rediriger vers paiement
      router.push(`/estimation/paiement/${result.data.id}`)
    }
  }
}
```

---

## 🎨 STYLES RECOMMANDÉS

```css
/* FormulaSelector.css */
.formule-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.formule-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.formule-card:hover {
  border-color: #2c5282;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.formule-card.selected {
  border-color: #2c5282;
  background: #f0f7ff;
  box-shadow: 0 4px 12px rgba(44,82,130,0.2);
}

.formule-card .prix {
  font-size: 2rem;
  font-weight: bold;
  color: #2c5282;
  margin: 1rem 0;
}

.formule-card .fiabilite {
  background: #e8f4f8;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin: 1rem 0;
  font-weight: 500;
}

.formule-card ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.formule-card ul li {
  padding: 0.5rem 0;
  color: #555;
}
```

---

## 📦 RÉSUMÉ TECHNIQUE

### État avant
- Formule choisie à la fin (étape 6/7)
- Formulaire identique pour toutes les formules
- Pas de différenciation visuelle
- Fiabilité calculée uniquement sur score

### État après
- Formule choisie AVANT critères (étape 3/7)
- Formulaire adaptatif selon formule:
  - Gratuite: 5 champs minimaux
  - Standard: 8 champs
  - Premium: 15 champs
- Choix de formule visuel et clair (cards)
- Fiabilité dépend de formule + données

---

## ⏱️ ESTIMATION EFFORT

- Refactoriser ordre étapes: **2h**
- Créer composant FormulaSelector: **1h**
- Adapter renderCriteres() avec conditions: **2h**
- Adapter renderOptions(): **1h**
- Validation par formule: **1h**
- Tests + ajustements UX: **2h**

**Total: ~9h de dev frontend**

---

## ✅ CRITÈRES DE VALIDATION

- [ ] Étape formule avant critères
- [ ] Cards formules cliquables et visuelles
- [ ] Formulaire critères adapte champs selon formule
- [ ] Gratuite: champs minimaux uniquement
- [ ] Standard: champs intermédiaires
- [ ] Premium: tous les champs avancés
- [ ] Options désactivées pour gratuite
- [ ] Validation bloque si champs requis manquants
- [ ] API reçoit `formule` dans payload
- [ ] Calculator utilise `formule` pour fiabilité

---

**Note:** Backend déjà prêt pour recevoir ces données. Le calculator adapte déjà la fiabilité selon la formule.
