# RESTRUCTURATION MODULE ESTIMATION - DOCUMENTATION

**Date** : 19 janvier 2026  
**Objectif** : Module estimation cohérent, testable et pilotable côté admin

---

## 🎯 PROBLÈME RÉSOLU

### Avant
- PDF généré même pour la formule gratuite → erreurs serveur
- Formule choisie trop tard (après consentement)
- Aucun contrôle admin pour PDF/email
- Module non pilotable

### Après
✅ Formule choisie AVANT le consentement  
✅ PDF bloqué pour la formule gratuite  
✅ Contrôle admin pour activer/désactiver PDF et email  
✅ Module testable sans spam ni erreurs  

---

## 📋 NOUVEAU PARCOURS CLIENT (6 ÉTAPES)

### Étape 1 : Inscription / Connexion
- Identique à avant
- Compte obligatoire

### Étape 2 : Motif d'estimation
- Identique à avant
- 6 motifs disponibles

### Étape 3 : Données du bien
- Identique à avant
- Type, surfaces, commune, état

### ⭐ Étape 4 : **CHOIX DE LA FORMULE** (NOUVEAU)
**Placement stratégique** : AVANT le consentement

#### 🟢 Formule GRATUITE
- Estimation affichée à l'écran uniquement
- Fourchette de prix visible
- **PAS de PDF généré**
- **PAS d'envoi email**
- Données minimales uniquement

#### 🔵 Formule STANDARD (49€)
- Estimation complète
- **PDF généré** (si autorisé admin)
- PDF accessible dans l'espace client
- **Email optionnel** (piloté par admin)

#### ⭐ Formule PREMIUM (149€)
- Estimation complète
- **Champs supplémentaires obligatoires** :
  - Nombre de pièces
  - Nombre de chambres
  - Environnement
  - Travaux récents
- **PDF généré** (si autorisé admin)
- **Email automatique** (si activé admin)

### Étape 5 : Consentement légal
- APRÈS le choix de formule
- Texte légal identique
- Enregistre : formule + date + IP

### Étape 6 : Options / Champs premium
- **Champs premium** : requis uniquement si formule premium
- **Options** : facultatives pour toutes formules

---

## 🔐 CONTRÔLE ADMIN (NOUVEAU)

### Page Admin → Paramètres Globaux

#### 1. Paramètres Globaux
```
⬜ service_actif
   Activer/désactiver le service d'estimation en ligne

⬜ generation_pdf_active
   Autoriser la génération de PDF (formules payantes)

⬜ envoi_email_auto_actif
   Activer l'envoi automatique des PDFs par email
```

#### 2. Configuration par Formule

**Formule GRATUITE**
- ✅ PDF autorisé : **NON** (bloqué)
- ✅ Email autorisé : **NON** (bloqué)
- ⚠️ Avertissement : Ne doit JAMAIS générer de PDF

**Formule STANDARD**
- ✅ PDF autorisé : **OUI** (par défaut)
- ✅ Email autorisé : **OUI** (si paramètre global activé)

**Formule PREMIUM**
- ✅ PDF autorisé : **OUI** (par défaut)
- ✅ Email autorisé : **OUI** (si paramètre global activé)
- ⭐ Champs premium requis : **OUI**

---

## 🔧 MODIFICATIONS TECHNIQUES

### 1. Base de données (Migration 0013)

#### Nouvelle table : `estimation_parametres_globaux`
```sql
- cle (text, unique)
- valeur (boolean)
- description (text)
```

#### Nouvelle table : `estimation_config_formules`
```sql
- formule (text, unique)
- nom_affichage (text)
- prix (decimal)
- pdf_autorise (boolean)
- email_autorise (boolean)
- champs_premium_requis (boolean)
- actif (boolean)
```

#### Table `estimations` - Nouvelles colonnes
```sql
- nb_pieces (integer)
- nb_chambres (integer)
- environnement (text)
- travaux (text)
```

### 2. Fichiers modifiés

#### Frontend
- `src/components/estimation/EstimationForm.js` ✅
  - Réorganisation des étapes
  - Step4Formule (nouveau)
  - Step6OptionsEtPremium (mis à jour)
  - Validation champs premium
  
- `src/components/estimation/EstimationForm.module.css` ✅
  - Styles pour Step4Formule
  - Styles champs premium

#### Backend API
- `src/app/api/estimation/route.js` ✅
  - Vérification config formule
  - Validation champs premium
  - Indication explicite no_pdf pour gratuite
  
- `src/app/api/admin/estimation/parametres/route.js` ✅ (NOUVEAU)
  - GET : récupère paramètres et config
  - PUT : met à jour paramètres/config

- `src/app/api/webhooks/stripe/route.js` ✅
  - Vérification isPdfAutoriseForFormule()
  - Vérification isEmailAutoriseForFormule()
  - Ne génère pas de PDF si non autorisé

#### Helpers
- `src/lib/estimation/permissions.js` ✅ (NOUVEAU)
  - isPdfAutoriseForFormule()
  - isEmailAutoriseForFormule()
  - isServiceEstimationActif()
  - getConfigFormule()

#### Admin
- `src/app/admin/(protected)/estimation/page.js` ✅
  - Nouvel onglet "Paramètres Globaux"
  - Component ParametresTab
  - Gestion switches et checkboxes
  
- `src/app/admin/(protected)/estimation/page.module.css` ✅
  - Styles switches
  - Styles cartes formules
  - Styles logique produit

---

## 📊 LOGIQUE DE GÉNÉRATION PDF

### Avant
```javascript
// ❌ PROBLÈME : PDF généré pour toutes formules
if (estimation) {
  const pdfBuffer = await generateEstimationPDF(estimation, formule)
  // Upload...
}
```

### Après
```javascript
// ✅ SOLUTION : Vérification avant génération
const pdfAutorise = await isPdfAutoriseForFormule(estimation.formule)

if (!pdfAutorise) {
  console.log(`PDF NOT AUTHORIZED for formule: ${estimation.formule}`)
  // Ne pas générer de PDF
} else {
  const pdfBuffer = await generateEstimationPDF(estimation, formule)
  // Upload...
  
  // Vérifier si email autorisé
  const emailAutorise = await isEmailAutoriseForFormule(estimation.formule)
  if (emailAutorise) {
    // Envoyer email
  }
}
```

---

## 🧪 TESTS À EFFECTUER

### 1. Parcours Formule Gratuite
✅ Sélectionner formule gratuite à l'étape 4  
✅ Accepter consentement à l'étape 5  
✅ Compléter étape 6 (options facultatives)  
✅ Soumettre le formulaire  
✅ Vérifier : estimation créée, pas de PDF, affichage écran uniquement  

### 2. Parcours Formule Standard
✅ Sélectionner formule standard à l'étape 4  
✅ Accepter consentement  
✅ Compléter étape 6  
✅ Paiement Stripe  
✅ Vérifier : PDF généré, pas d'email si désactivé admin  

### 3. Parcours Formule Premium
✅ Sélectionner formule premium à l'étape 4  
✅ Accepter consentement  
✅ Compléter étape 6 avec champs obligatoires :
   - nb_pieces
   - nb_chambres
   - environnement
   - travaux  
✅ Paiement Stripe  
✅ Vérifier : PDF généré, email envoyé si activé admin  

### 4. Tests Admin
✅ Désactiver `generation_pdf_active` → Aucun PDF généré  
✅ Désactiver `envoi_email_auto_actif` → Aucun email envoyé  
✅ Désactiver formule → Formule non disponible client  
✅ Modifier pdf_autorise formule → Impact génération PDF  

---

## 🚀 DÉPLOIEMENT

### 1. Appliquer la migration
```bash
psql <connection_string> -f supabase/migrations/0013_estimation_parametres_admin.sql
```

### 2. Vérifier les paramètres par défaut
```sql
SELECT * FROM estimation_parametres_globaux;
SELECT * FROM estimation_config_formules ORDER BY ordre;
```

### 3. Configurer selon besoin
**Phase de test** :
- ✅ `generation_pdf_active` = true
- ❌ `envoi_email_auto_actif` = false (éviter spam)

**Phase production** :
- ✅ `generation_pdf_active` = true
- ✅ `envoi_email_auto_actif` = true

---

## 📝 NOTES IMPORTANTES

### Pour les développeurs
- La formule est maintenant choisie à l'**étape 4** (pas 6)
- Le consentement vient **après** la formule (étape 5)
- Les champs premium sont validés côté serveur
- La génération PDF est conditionnelle (vérification permissions)

### Pour l'admin
- Tester visuellement les PDFs **avant** d'activer l'email
- La formule gratuite ne doit **JAMAIS** avoir PDF/email activés
- Les paramètres sont en temps réel (pas de cache)

### Pour la production
- Surveiller les logs de génération PDF
- Vérifier les emails envoyés
- Auditer les paramètres globaux régulièrement

---

## ✅ CHECKLIST VALIDATION

- [x] Migration 0013 créée et testée
- [x] Étape 4 "Choix formule" avant consentement
- [x] Étape 5 "Consentement" après formule
- [x] Étape 6 "Options + Premium" conditionnels
- [x] API estimation vérifie config formule
- [x] Webhook Stripe vérifie permissions PDF/email
- [x] Helper permissions.js implémenté
- [x] Page admin paramètres globaux ajoutée
- [x] Styles CSS pour nouveaux composants
- [x] Formule gratuite ne génère pas de PDF
- [x] Champs premium validés si formule premium
- [ ] Tests end-to-end (à faire)
- [ ] Documentation utilisateur mise à jour

---

**Confirmer quand prêt pour les tests** ✅
