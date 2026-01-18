# 📋 Logique Métier Transaction/Statut

## 🎯 Principe fondamental

**Séparation stricte des responsabilités :**
- `type_transaction` = **ce que c'est** (nature du bien)
- `statut` = **où ça en est** (état de publication)

Ces deux champs doivent être cohérents mais **jamais mélangés**.

## 📊 Structure de données

### Type de transaction (immutable après création)
```sql
type_transaction TEXT NOT NULL CHECK (type_transaction IN ('VENTE', 'LOCATION'))
```

| Valeur | Description |
|--------|-------------|
| `VENTE` | Bien en vente |
| `LOCATION` | Bien en location |

### Statut (évolutif)
```sql
statut TEXT NOT NULL CHECK (statut IN (
  'A_VENDRE', 'SOUS_COMPROMIS', 'VENDU',
  'EN_LOCATION', 'LOUE', 'RETIRE'
))
```

## 🔗 Mapping type_transaction → statuts autorisés

### Pour une VENTE
| Statut | Label public | CSS Class | Visible public |
|--------|--------------|-----------|----------------|
| `A_VENDRE` | À vendre | `disponible` | ✅ |
| `SOUS_COMPROMIS` | Sous compromis | `compromis` | ✅ |
| `VENDU` | Vendu | `indisponible` | ❌ |
| `RETIRE` | Retiré | `retire` | ❌ |

### Pour une LOCATION
| Statut | Label public | CSS Class | Visible public |
|--------|--------------|-----------|----------------|
| `EN_LOCATION` | Disponible | `disponible` | ✅ |
| `LOUE` | Loué | `indisponible` | ❌ |
| `RETIRE` | Retiré | `retire` | ❌ |

## 🧠 Règles de cohérence

### ✅ Combinaisons valides
- `VENTE` + `A_VENDRE` → ✅
- `VENTE` + `SOUS_COMPROMIS` → ✅
- `VENTE` + `VENDU` → ✅
- `LOCATION` + `EN_LOCATION` → ✅
- `LOCATION` + `LOUE` → ✅
- `*` + `RETIRE` → ✅ (commun aux deux)

### ❌ Combinaisons invalides (auto-corrigées)
- `VENTE` + `EN_LOCATION` → ❌ corrigé en `A_VENDRE`
- `VENTE` + `LOUE` → ❌ corrigé en `A_VENDRE`
- `LOCATION` + `A_VENDRE` → ❌ corrigé en `EN_LOCATION`
- `LOCATION` + `SOUS_COMPROMIS` → ❌ corrigé en `EN_LOCATION`
- `LOCATION` + `VENDU` → ❌ corrigé en `EN_LOCATION`

## 💻 Implémentation technique

### Configuration centralisée
Fichier : [`src/lib/annonces-config.js`](../src/lib/annonces-config.js)

**Exports principaux :**
```javascript
// Types
export const TYPE_TRANSACTION = { VENTE: 'VENTE', LOCATION: 'LOCATION' }
export const STATUT = { A_VENDRE, SOUS_COMPROMIS, VENDU, EN_LOCATION, LOUE, RETIRE }

// Mapping
export const STATUTS_PAR_TRANSACTION = {
  VENTE: [A_VENDRE, SOUS_COMPROMIS, VENDU, RETIRE],
  LOCATION: [EN_LOCATION, LOUE, RETIRE]
}

// Labels d'affichage
export const STATUT_LABELS = { ... }
export const STATUT_CSS_CLASSES = { ... }

// Fonctions utilitaires
getStatutsAutorises(typeTransaction)
isStatutCoherent(typeTransaction, statut)
corrigerStatut(typeTransaction, statut)
getStatutLabel(statut)
getStatutCssClass(statut)
isAnnonceVisiblePublic(annonce)
```

### Interface Admin

**Comportement automatique :**
1. Le select `statut` est **filtré dynamiquement** selon `type_transaction`
2. Si on change `type_transaction`, le `statut` est **auto-corrigé** s'il devient incohérent
3. Impossible de sauvegarder une combinaison invalide

**Fichiers concernés :**
- [`src/app/admin/(protected)/annonces/new/page.js`](../src/app/admin/(protected)/annonces/new/page.js)
- [`src/app/admin/(protected)/annonces/[id]/edit/page.js`](../src/app/admin/(protected)/annonces/[id]/edit/page.js)

**Code clé :**
```javascript
// Import
import { getStatutsAutorises, corrigerStatut } from '@/lib/annonces-config'

// Auto-correction
useEffect(() => {
  const statutCorrige = corrigerStatut(formData.type_transaction, formData.statut)
  if (statutCorrige !== formData.statut) {
    setFormData(prev => ({ ...prev, statut: statutCorrige }))
  }
}, [formData.type_transaction, formData.statut])

// Select dynamique
<select value={formData.statut}>
  {getStatutsAutorises(formData.type_transaction).map(statutKey => (
    <option key={statutKey} value={statutKey}>
      {LABELS[statutKey]}
    </option>
  ))}
</select>
```

### Affichage Public

**Badge de statut :**
```javascript
import { getStatutLabel, getStatutCssClass } from '@/lib/annonces-config'

<div className={`${styles.badge} ${styles[getStatutCssClass(annonce.statut)]}`}>
  {getStatutLabel(annonce.statut)}
</div>
```

**Classes CSS disponibles :**
- `.badge.disponible` → Vert (À vendre / En location)
- `.badge.compromis` → Orange (Sous compromis)
- `.badge.indisponible` → Rouge (Vendu / Loué)
- `.badge.retire` → Gris (Retiré)

**Fichier concerné :**
- [`src/app/annonces/page.js`](../src/app/annonces/page.js)
- [`src/app/annonces/page.module.css`](../src/app/annonces/page.module.css)

## 🎨 Wording public vs Admin

| Statut BDD | Label Admin | Label Public |
|------------|-------------|--------------|
| `A_VENDRE` | À vendre | À vendre |
| `SOUS_COMPROMIS` | Sous compromis | Sous compromis |
| `VENDU` | Vendu | Vendu |
| `EN_LOCATION` | Disponible à la location | Disponible |
| `LOUE` | Loué | Loué |
| `RETIRE` | Retiré | Retiré |

> **Note :** Le wording est légèrement différent pour l'admin (plus explicite) et le public (plus concis).

## 🔐 Validation côté API

**À implémenter si nécessaire :**
```javascript
// Dans /api/admin/annonces/route.js
import { isStatutCoherent, corrigerStatut } from '@/lib/annonces-config'

// Validation
if (!isStatutCoherent(body.type_transaction, body.statut)) {
  body.statut = corrigerStatut(body.type_transaction, body.statut)
  console.warn('Statut auto-corrigé pour cohérence')
}
```

## 🧪 Tests de cohérence

**Scénarios à tester :**

1. **Création d'annonce**
   - Créer vente → vérifier que seuls statuts VENTE sont disponibles
   - Créer location → vérifier que seuls statuts LOCATION sont disponibles

2. **Édition type_transaction**
   - Passer de VENTE à LOCATION → statut doit s'auto-corriger
   - Passer de LOCATION à VENTE → statut doit s'auto-corriger

3. **Affichage public**
   - Badge affiche le bon label
   - Badge a la bonne couleur
   - Annonces VENDU/LOUE ne sont pas visibles (sauf si explicitement configuré)

## 🚫 Interdictions

❌ **NE JAMAIS :**
- Coder des statuts "en dur" dans le JSX
- Afficher un statut incohérent avec type_transaction
- Fusionner type_transaction et statut
- Modifier la structure sans mettre à jour `annonces-config.js`

## ✅ Checklist maintenance

Lors de l'ajout d'un nouveau statut :
- [ ] Ajouter dans `STATUT` constant
- [ ] Mettre à jour `STATUTS_PAR_TRANSACTION`
- [ ] Ajouter label dans `STATUT_LABELS`
- [ ] Ajouter classe CSS dans `STATUT_CSS_CLASSES`
- [ ] Définir visibilité dans `STATUT_VISIBLE_PUBLIC`
- [ ] Mettre à jour contrainte SQL
- [ ] Tester dans admin et public

## 📚 Références

- Configuration : [`src/lib/annonces-config.js`](../src/lib/annonces-config.js)
- Migration SQL : [`supabase/migrations/0007_refactor_annonces_complet.sql`](../supabase/migrations/0007_refactor_annonces_complet.sql)
- Admin création : [`src/app/admin/(protected)/annonces/new/page.js`](../src/app/admin/(protected)/annonces/new/page.js)
- Admin édition : [`src/app/admin/(protected)/annonces/[id]/edit/page.js`](../src/app/admin/(protected)/annonces/[id]/edit/page.js)
- Public : [`src/app/annonces/page.js`](../src/app/annonces/page.js)
