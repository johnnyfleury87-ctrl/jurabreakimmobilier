# AMÉLIORATIONS UX - CHOIX DE FORMULE

**Date** : 19 janvier 2026  
**Objectif** : Rendre le choix de formule explicite et bloquant dans l'UX

---

## ✅ PROBLÈME RÉSOLU

### Avant
- Formule choisie en fin de parcours
- Pas de feedback visuel clair
- Erreurs génériques

### Après
✅ Formule à l'étape 4 (AVANT consentement)  
✅ Messages contextuels par étape  
✅ Récapitulatif formule à l'étape 5  
✅ Champs premium clairement identifiés  
✅ Erreurs explicites par formule  

---

## 🎨 AMÉLIORATIONS VISUELLES

### Étape 4 : Choix de formule

#### Message d'info si aucune formule sélectionnée
```
┌────────────────────────────────────────────────────┐
│ ℹ️ Important : Votre choix déterminera les services │
│ disponibles et les champs requis pour la suite du   │
│ parcours.                                           │
└────────────────────────────────────────────────────┘
```

#### Cartes formules avec couleurs distinctes
- 🟢 **Gratuite** : Bordure verte
- 🔵 **Standard** : Bordure bleue
- ⭐ **Premium** : Bordure violette

#### Légende explicite en bas
```
🟢 Gratuite : Affichage écran uniquement, pas de PDF généré
🔵 Standard / Premium : PDF généré, envoi email selon paramétrage admin
```

---

### Étape 5 : Consentement

#### Récapitulatif formule choisie
```
┌────────────────────────────────────────────────────┐
│ 🔵 Formule choisie : Standard (49€)                 │
│ PDF généré et téléchargeable                       │
└────────────────────────────────────────────────────┘
```

Affichage différent selon la formule :
- 🟢 **Gratuite** : "Résultat affiché à l'écran uniquement"
- 🔵 **Standard** : "PDF généré et téléchargeable"
- ⭐ **Premium** : "PDF + champs détaillés obligatoires"

---

### Étape 6 : Options et champs premium

#### Message contextuel selon formule

**Formule Gratuite :**
```
┌────────────────────────────────────────────────────┐
│ 🟢 Formule Gratuite : Les champs ci-dessous sont   │
│ tous facultatifs.                                  │
└────────────────────────────────────────────────────┘
```

**Formule Standard :**
```
┌────────────────────────────────────────────────────┐
│ 🔵 Formule Standard : Complétez les options pour   │
│ affiner votre estimation.                          │
└────────────────────────────────────────────────────┘
```

**Formule Premium :**
```
┌────────────────────────────────────────────────────┐
│ ⭐ Formule Premium : Les champs suivants sont       │
│ OBLIGATOIRES pour cette formule.                   │
└────────────────────────────────────────────────────┘

┌─── Champs requis (fond violet clair) ────┐
│ Nombre de pièces *                        │
│ Nombre de chambres *                      │
│ Environnement *                           │
│ Travaux récents *                         │
└───────────────────────────────────────────┘
```

---

## 🚫 MESSAGES D'ERREUR SPÉCIFIQUES

### Par étape

| Étape | Message d'erreur |
|-------|------------------|
| 1 | "Vous devez créer un compte ou vous connecter" |
| 2 | "Veuillez sélectionner un motif d'estimation" |
| 3 | "Veuillez remplir tous les champs obligatoires du bien" |
| **4** | **"⚠️ Vous devez choisir une formule pour continuer"** |
| 5 | "Vous devez accepter les conditions légales" |
| 6 (premium) | "⭐ Formule Premium : tous les champs supplémentaires sont obligatoires" |

---

## 🔒 LOGIQUE DE BLOCAGE

### Étape 4 : Bouton "Suivant" désactivé si...
```javascript
formData.formule === ''  // Aucune formule sélectionnée
```

### Étape 6 : Bouton "Soumettre" désactivé si...
```javascript
// Formule Premium ET champs manquants
formData.formule === 'premium' && (
  !formData.nb_pieces ||
  !formData.nb_chambres ||
  !formData.environnement ||
  !formData.travaux
)
```

---

## 🎯 PARCOURS UTILISATEUR

### Scénario 1 : Formule Gratuite
```
Étape 1 ✅ → Étape 2 ✅ → Étape 3 ✅
    ↓
Étape 4 : Clic "Gratuite" 🟢
    ↓ (bouton "Suivant" activé)
Étape 5 : Voir récapitulatif "Gratuite - Écran uniquement"
          Accepter consentement ✅
    ↓
Étape 6 : Message "Champs facultatifs"
          Options (facultatif)
    ↓
Soumettre → Résultat écran uniquement
            PAS de PDF
```

### Scénario 2 : Formule Premium
```
Étape 1 ✅ → Étape 2 ✅ → Étape 3 ✅
    ↓
Étape 4 : Clic "Premium" ⭐
    ↓ (bouton "Suivant" activé)
Étape 5 : Voir récapitulatif "Premium - PDF + champs détaillés"
          Accepter consentement ✅
    ↓
Étape 6 : Message "Champs OBLIGATOIRES"
          ⚠️ Si champs vides → Bouton "Soumettre" DÉSACTIVÉ
          ✅ Si champs complets → Bouton "Soumettre" ACTIVÉ
    ↓
Soumettre → Paiement → PDF généré
```

---

## 💅 STYLES CSS AJOUTÉS

### `.infoBox`
```css
.infoBox {
  padding: 1rem;
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  color: #1565c0;
}
```

### `.formuleRecap`
```css
.formuleRecap {
  padding: 1rem;
  background-color: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: #0c4a6e;
}
```

---

## ✅ VALIDATION

### Checklist UX
- [x] Formule à l'étape 4 (avant consentement)
- [x] Message info si formule non choisie
- [x] Bouton "Suivant" désactivé si pas de formule
- [x] Récapitulatif formule à l'étape 5
- [x] Messages contextuels étape 6 selon formule
- [x] Champs premium clairement identifiés (fond violet)
- [x] Validation premium côté client (bouton désactivé)
- [x] Messages d'erreur spécifiques par étape
- [x] Légende explicite gratuite vs payante

### Cohérence backend
- [x] API vérifie config formule
- [x] Validation champs premium serveur
- [x] Formule gratuite ne génère pas de PDF
- [x] Webhook respecte permissions admin

---

## 🧪 TESTS UX À EFFECTUER

### Test 1 : Blocage étape 4
1. Arriver à l'étape 4
2. Ne PAS sélectionner de formule
3. Cliquer "Suivant"
4. **Attendu** : Message "⚠️ Vous devez choisir une formule"

### Test 2 : Récapitulatif étape 5
1. Choisir "Standard" à l'étape 4
2. Aller à l'étape 5
3. **Attendu** : Voir encadré "🔵 Formule choisie : Standard (49€)"

### Test 3 : Champs premium requis
1. Choisir "Premium" à l'étape 4
2. Aller à l'étape 6
3. Ne PAS remplir les champs premium
4. **Attendu** : Bouton "Soumettre" désactivé
5. Remplir tous les champs premium
6. **Attendu** : Bouton "Soumettre" activé

### Test 4 : Formule gratuite - Pas de champs requis
1. Choisir "Gratuite" à l'étape 4
2. Aller à l'étape 6
3. **Attendu** : Message "Champs facultatifs", pas de section premium

---

## 📊 RÉSUMÉ DES MODIFICATIONS

### Fichiers modifiés
- ✅ `src/components/estimation/EstimationForm.js`
  - Message info étape 4
  - Récapitulatif formule étape 5
  - Messages contextuels étape 6
  - Erreurs spécifiques par étape
  
- ✅ `src/components/estimation/EstimationForm.module.css`
  - Style `.infoBox`
  - Style `.formuleRecap`

### Lignes de code
- **Ajoutées** : ~80 lignes
- **Modifiées** : ~30 lignes

---

## 🎉 CONFIRMATION

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   ✅ UX CHOIX DE FORMULE AMÉLIORÉE                ║
║                                                   ║
║   • Formule étape 4 (AVANT consentement)         ║
║   • Messages explicites à chaque étape           ║
║   • Blocage UI si formule non choisie            ║
║   • Récapitulatif formule étape 5                ║
║   • Champs premium clairement identifiés         ║
║   • Erreurs contextuelles par formule            ║
║                                                   ║
║   🎯 PARCOURS CLIENT PILOTÉ PAR LA FORMULE        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

**Prêt pour les tests UX** ✅
