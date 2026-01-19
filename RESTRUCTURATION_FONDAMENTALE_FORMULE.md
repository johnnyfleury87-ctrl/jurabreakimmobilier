# RESTRUCTURATION FONDAMENTALE - MODULE ESTIMATION
## Correction du parcours logique (19 janvier 2026)

---

## ❌ PROBLÈME IDENTIFIÉ

**Malentendu critique** : L'ordre initial des étapes empêchait la logique métier de fonctionner correctement.

### Ancien ordre (INCORRECT) :
1. Infos client
2. Motif
3. **Données du bien** ⚠️ (champs fixes)
4. **Choix de la formule** ⛔ (trop tard)
5. Consentement
6. Options

**Conséquences** :
- ⛔ Les champs de l'étape 3 ne pouvaient pas s'adapter à la formule
- ⛔ Impossible de bloquer le PDF pour la formule gratuite
- ⛔ Logique métier complètement cassée
- ⛔ Tous les champs visibles quelle que soit la formule

---

## ✅ SOLUTION APPLIQUÉE

### Nouvel ordre (CORRECT) :

```
1️⃣ Infos client
   ↓
2️⃣ Motif de l'estimation
   ↓
3️⃣ Choix de la formule ⬅️ ÉTAPE CLÉ
   ↓ (pilote les champs suivants)
4️⃣ Données du bien (adaptées à la formule)
   ↓
5️⃣ Consentement légal
   ↓
6️⃣ Récapitulatif / Validation
```

---

## 🎯 RÈGLE MÉTIER ABSOLUE

**La formule choisie à l'étape 3 détermine les champs requis à l'étape 4**

### 🟢 Formule GRATUITE
**Champs minimum uniquement** :
- ✅ Type de bien (obligatoire)
- ✅ Surface habitable (obligatoire)
- ✅ Code postal + commune (obligatoire)
- ✅ État du bien (obligatoire)
- ❌ Surface terrain (facultatif)
- ❌ Année construction (facultatif)
- ❌ Champs premium (invisibles)

**Résultat** :
- Affichage écran uniquement
- **PAS de génération PDF**
- PAS d'envoi email

---

### 🔵 Formule STANDARD (49€)
**Champs de base + champs standard** :
- ✅ Tous les champs gratuits
- ✅ **Surface terrain (OBLIGATOIRE)**
- ✅ **Année de construction (OBLIGATOIRE)**
- ❌ Champs premium (invisibles)

**Résultat** :
- PDF généré après paiement
- Envoi email (si activé par admin)

---

### ⭐ Formule PREMIUM (149€)
**Tous les champs obligatoires** :
- ✅ Tous les champs standard
- ✅ **Nombre de pièces (OBLIGATOIRE)**
- ✅ **Nombre de chambres (OBLIGATOIRE)**
- ✅ **Environnement (OBLIGATOIRE)**
- ✅ **Travaux récents (OBLIGATOIRE)**

**Résultat** :
- PDF détaillé après paiement
- Envoi email automatique
- Rapport enrichi avec tous les critères

---

## 🔧 MODIFICATIONS TECHNIQUES

### 1. EstimationForm.js - Ordre des étapes

**Anciens noms** → **Nouveaux noms** :
- `Step3Bien` → `Step4Bien` (données du bien à l'étape 4)
- `Step4Formule` → `Step3Formule` (formule à l'étape 3)
- `Step6OptionsEtPremium` → `Step6Resultat` (récapitulatif final)

### 2. Step3Formule (choix de la formule)

```javascript
function Step3Formule({ formData, setFormData }) {
  return (
    <div className={styles.step}>
      <h2>Étape 3 : Choisissez votre formule</h2>
      <p>⚠️ <strong>Ce choix détermine les champs requis à l'étape suivante</strong></p>
      
      {/* 3 cartes : Gratuite, Standard, Premium */}
      {/* Clic sur une carte → formData.formule = 'gratuite' | 'standard' | 'premium' */}
    </div>
  )
}
```

### 3. Step4Bien (données du bien DYNAMIQUES)

```javascript
function Step4Bien({ formData, setFormData, communes, onLoadCommunes }) {
  const isGratuite = formData.formule === 'gratuite'
  const isStandard = formData.formule === 'standard'
  const isPremium = formData.formule === 'premium'
  
  return (
    <div className={styles.step}>
      <h2>Étape 4 : Données du bien</h2>
      
      {/* Infobox selon formule */}
      {isGratuite && <InfoBoxGratuite />}
      {isStandard && <InfoBoxStandard />}
      {isPremium && <InfoBoxPremium />}
      
      {/* CHAMPS DE BASE (toutes formules) */}
      <input name="type_bien" required />
      <input name="surface_habitable" required />
      <input name="code_postal" required />
      <select name="commune" required />
      <select name="etat_bien" required />
      
      {/* CHAMPS STANDARD (Standard + Premium) */}
      <input name="surface_terrain" required={!isGratuite} />
      <input name="annee_construction" required={!isGratuite} />
      
      {/* CHAMPS PREMIUM (Premium uniquement) */}
      {isPremium && (
        <>
          <input name="nb_pieces" required />
          <input name="nb_chambres" required />
          <select name="environnement" required />
          <select name="travaux" required />
        </>
      )}
    </div>
  )
}
```

### 4. Validation adaptative (canProceed)

```javascript
function canProceed(step) {
  switch (step) {
    case 1: return user !== null
    case 2: return formData.motif !== ''
    case 3: return formData.formule !== '' // Formule AVANT données
    
    case 4: // Validation selon formule
      const baseFields = formData.type_bien && formData.surface_habitable && 
                        formData.commune_nom && formData.code_postal && formData.etat_bien
      
      if (formData.formule === 'gratuite') {
        return baseFields // Champs minimum
      } else if (formData.formule === 'standard') {
        return baseFields && formData.annee_construction && formData.surface_terrain
      } else if (formData.formule === 'premium') {
        return baseFields && formData.annee_construction && formData.surface_terrain &&
               formData.nb_pieces && formData.nb_chambres && 
               formData.environnement && formData.travaux
      }
      return baseFields
      
    case 5: return formData.consentement_accepte
    case 6: return true
  }
}
```

### 5. Messages d'erreur contextuels

```javascript
function nextStep() {
  if (!canProceed(currentStep)) {
    switch (currentStep) {
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
        }
        break
    }
  } else {
    setCurrentStep(prev => Math.min(prev + 1, 6))
  }
}
```

---

## ✅ RÉSULTAT OBTENU

### Avant (❌)
- Formule choisie en dernier
- Champs figés quelle que soit la formule
- PDF généré systématiquement (même gratuit)
- Logique incohérente et non testable

### Après (✅)
- **Formule choisie en 3ème position**
- **Champs dynamiques selon la formule**
- **PDF uniquement si formule ≠ gratuite**
- **Validation adaptée à chaque formule**
- **Messages contextuels clairs**

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Parcours Gratuit
1. Choisir "Formule Gratuite" à l'étape 3
2. À l'étape 4 : vérifier que seuls les champs de base sont requis
3. Surface terrain et année construction doivent être **facultatifs**
4. Champs premium doivent être **invisibles**
5. Valider et vérifier : **pas de génération PDF**

### Test 2 : Parcours Standard
1. Choisir "Formule Standard" à l'étape 3
2. À l'étape 4 : vérifier que surface terrain et année sont **obligatoires**
3. Champs premium doivent être **invisibles**
4. Après paiement : **PDF généré**

### Test 3 : Parcours Premium
1. Choisir "Formule Premium" à l'étape 3
2. À l'étape 4 : vérifier que **tous les champs** sont obligatoires et visibles
3. Impossible de passer à l'étape 5 sans remplir nb_pieces, nb_chambres, environnement, travaux
4. Après paiement : **PDF détaillé généré**

---

## 📊 IMPACT SUR LES AUTRES FICHIERS

### Fichiers modifiés :
- ✅ `/src/components/estimation/EstimationForm.js` (restructuration complète)

### Fichiers compatibles (pas de modification) :
- ✅ `/src/app/api/estimation/route.js` (déjà prêt avec validation formule)
- ✅ `/src/app/api/webhooks/stripe/route.js` (déjà protégé avec isPdfAutoriseForFormule)
- ✅ `/src/lib/estimation/permissions.js` (helper functions déjà en place)
- ✅ `/supabase/migrations/0013_estimation_parametres_admin.sql` (structure DB correcte)

---

## 🎯 CONFIRMATION FINALE

### ✅ Ordre des étapes corrigé
- Étape 3 = Choix de la formule
- Étape 4 = Données du bien (adaptées)

### ✅ Champs dynamiques selon formule
- Gratuite : champs minimum
- Standard : champs de base + standard
- Premium : tous les champs

### ✅ Validation contextuelle
- Étape 3 bloquante si pas de formule
- Étape 4 validation selon formule choisie
- Messages d'erreur adaptés

---

## 🚀 PROCHAINES ÉTAPES

1. **Appliquer la migration 0013** (créer tables admin)
2. **Tester les 3 parcours** (gratuit, standard, premium)
3. **Vérifier génération PDF** (uniquement standard/premium)
4. **Valider UX** (affichage conditionnel des champs)

---

**Date de restructuration** : 19 janvier 2026  
**Statut** : ✅ Implémenté et compilé sans erreurs  
**Prêt pour tests** : OUI
