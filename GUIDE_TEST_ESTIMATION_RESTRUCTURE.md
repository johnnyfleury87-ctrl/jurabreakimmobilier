# GUIDE DE TEST - MODULE ESTIMATION RESTRUCTURÉ

## 🚀 DÉMARRAGE RAPIDE

### 1. Appliquer la migration
```bash
# Option A : Avec script automatique
./scripts/apply-migration-0013.sh

# Option B : Manuellement
export SUPABASE_DB_URL='postgresql://...'
psql $SUPABASE_DB_URL -f supabase/migrations/0013_estimation_parametres_admin.sql
```

### 2. Démarrer le serveur de développement
```bash
npm run dev
```

### 3. Ouvrir l'application
```
http://localhost:3000
```

---

## 🧪 TESTS FONCTIONNELS

### TEST 1 : Formule Gratuite (Pas de PDF)

**Objectif** : Vérifier que la formule gratuite n'essaie pas de générer de PDF

#### Étapes
1. Aller sur `http://localhost:3000/estimation`
2. **Étape 1** : Se connecter ou créer un compte
3. **Étape 2** : Choisir "Curiosité"
4. **Étape 3** : Remplir les données du bien
   - Type : Maison
   - Surface : 120 m²
   - Code postal : 39000
   - Commune : Lons-le-Saunier
   - État : Bon
5. **✨ Étape 4 : CHOISIR "Formule Gratuite"**
6. **Étape 5** : Accepter le consentement
7. **Étape 6** : Options (facultatives)
8. **Soumettre** : Cliquer "Obtenir mon estimation"

#### Résultat attendu
✅ Estimation affichée à l'écran  
✅ Fourchette de prix visible  
✅ **PAS de PDF généré**  
✅ **PAS d'erreur serveur**  
✅ Aucun email envoyé  

---

### TEST 2 : Formule Standard (PDF avec contrôle admin)

**Objectif** : Vérifier que le PDF est généré uniquement si autorisé admin

#### Étapes
1. **D'abord : Vérifier les paramètres admin**
   - Aller sur `http://localhost:3000/admin/estimation`
   - Onglet "⚙️ Paramètres Globaux"
   - Vérifier que `generation_pdf_active` = **ON** ✅
   - Vérifier que `envoi_email_auto_actif` = **OFF** ❌ (pour éviter spam en test)

2. **Parcours client**
   - Étapes 1-3 identiques au TEST 1
   - **Étape 4** : Choisir "Formule Standard" (49€)
   - Étape 5 : Accepter consentement
   - Étape 6 : Options (facultatives)
   - Soumettre → Redirection vers paiement Stripe

3. **Simuler paiement**
   - Utiliser carte de test Stripe : `4242 4242 4242 4242`
   - Date : n'importe quelle date future
   - CVC : 123

#### Résultat attendu
✅ Paiement confirmé  
✅ **PDF généré** et stocké  
✅ PDF téléchargeable depuis l'espace client  
❌ **PAS d'email envoyé** (car désactivé admin)  

---

### TEST 3 : Formule Premium (Champs obligatoires)

**Objectif** : Vérifier que les champs premium sont requis

#### Étapes
1. Parcours standard jusqu'à l'étape 4
2. **Étape 4** : Choisir "Formule Premium" (149€)
3. Étape 5 : Accepter consentement
4. **Étape 6** : Compléter les champs **obligatoires** :
   - Nombre de pièces : 5
   - Nombre de chambres : 3
   - Environnement : Centre-ville
   - Travaux récents : Travaux mineurs
   - Options : Garage, Terrasse (facultatif)
5. Soumettre → Paiement

#### Résultat attendu
✅ Si champs premium incomplets → Erreur validation  
✅ Si champs premium complets → Redirection paiement  
✅ Après paiement : PDF généré avec infos premium  

---

### TEST 4 : Contrôle Admin - Désactiver PDF

**Objectif** : Vérifier que désactiver `generation_pdf_active` empêche la génération

#### Étapes
1. **Admin** : `http://localhost:3000/admin/estimation`
2. Onglet "⚙️ Paramètres Globaux"
3. **Désactiver** `generation_pdf_active` (switch OFF)
4. **Client** : Faire un parcours Formule Standard avec paiement
5. Webhook Stripe reçu

#### Résultat attendu
✅ Paiement enregistré  
❌ **Aucun PDF généré** (bloqué par paramètre admin)  
✅ Log console : `PDF generation NOT AUTHORIZED`  

---

### TEST 5 : Contrôle Admin - Activer Email

**Objectif** : Vérifier que l'envoi email est conditionnel

#### Étapes
1. **Admin** : Activer `envoi_email_auto_actif` (switch ON)
2. **Admin** : Vérifier que Formule Standard a `email_autorise` = ON
3. **Client** : Parcours Formule Standard + paiement

#### Résultat attendu
✅ PDF généré  
✅ Email envoyé automatiquement (si service email configuré)  
✅ Log console : `Email AUTHORIZED for formule: standard`  

---

### TEST 6 : Formule Gratuite - Vérification Admin

**Objectif** : S'assurer que la config gratuite est correcte

#### Étapes
1. **Admin** : `http://localhost:3000/admin/estimation`
2. Onglet "⚙️ Paramètres Globaux"
3. Vérifier la carte "Formule Gratuite"

#### Résultat attendu
✅ PDF autorisé : **NON** (décoché et grisé)  
✅ Email autorisé : **NON** (décoché et grisé)  
✅ Avertissement visible : "⚠️ La formule gratuite ne doit JAMAIS..."  

---

## 📊 VÉRIFICATIONS BASE DE DONNÉES

### Vérifier les paramètres globaux
```sql
SELECT * FROM estimation_parametres_globaux ORDER BY cle;
```

**Attendu** :
```
service_actif              | true
generation_pdf_active      | true
envoi_email_auto_actif     | false (par défaut)
```

### Vérifier la config des formules
```sql
SELECT formule, pdf_autorise, email_autorise, champs_premium_requis
FROM estimation_config_formules
ORDER BY ordre;
```

**Attendu** :
```
gratuite  | false | false | false
standard  | true  | true  | false
premium   | true  | true  | true
```

### Vérifier une estimation gratuite
```sql
SELECT id, formule, pdf_path, valeur_mediane
FROM estimations
WHERE formule = 'gratuite'
ORDER BY created_at DESC
LIMIT 5;
```

**Attendu** :
- `pdf_path` doit être **NULL** pour toutes les estimations gratuites

### Vérifier une estimation payante
```sql
SELECT id, formule, pdf_path, pdf_generated_at, statut_paiement
FROM estimations
WHERE formule IN ('standard', 'premium')
  AND statut_paiement = 'PAID'
ORDER BY created_at DESC
LIMIT 5;
```

**Attendu** :
- `pdf_path` doit être **non NULL** si PDF autorisé
- `pdf_generated_at` doit avoir une date

---

## 🐛 DEBUGGING

### Logs à surveiller

#### Console serveur (terminal Next.js)
```
✅ "Generating PDF for estimation XXX (formule: standard)"
❌ "PDF generation NOT AUTHORIZED for formule: gratuite"
✅ "Email AUTHORIZED for formule: premium"
❌ "Email NOT AUTHORIZED for formule: standard"
```

#### Logs Stripe Webhook
```bash
# Voir les logs du webhook
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Erreurs courantes

#### Erreur : "Champs supplémentaires requis pour la formule Premium"
**Cause** : Champs premium manquants  
**Solution** : Remplir nb_pieces, nb_chambres, environnement, travaux à l'étape 6

#### Erreur : "Formule non disponible"
**Cause** : Formule désactivée dans la config admin  
**Solution** : Admin → Paramètres → Activer la formule

#### PDF généré pour gratuite
**Cause** : Config formule incorrecte  
**Solution** : Vérifier que `pdf_autorise = false` pour formule gratuite

---

## ✅ CHECKLIST COMPLÈTE

### Configuration initiale
- [ ] Migration 0013 appliquée avec succès
- [ ] Paramètres globaux créés
- [ ] Config formules créée
- [ ] Formule gratuite : PDF et Email désactivés

### Tests Parcours Client
- [ ] TEST 1 : Formule gratuite → Pas de PDF ✅
- [ ] TEST 2 : Formule standard → PDF généré (si autorisé) ✅
- [ ] TEST 3 : Formule premium → Champs obligatoires ✅

### Tests Admin
- [ ] TEST 4 : Désactiver PDF → Aucun PDF généré ✅
- [ ] TEST 5 : Activer Email → Email envoyé ✅
- [ ] TEST 6 : Config gratuite correcte ✅

### Vérifications DB
- [ ] Paramètres globaux présents
- [ ] Config formules présentes
- [ ] Estimations gratuites sans PDF
- [ ] Estimations payantes avec PDF

### Production Ready
- [ ] Tous les tests passés
- [ ] Logs sans erreurs
- [ ] Email désactivé en test
- [ ] Prêt pour activation email en prod

---

## 🎯 VALIDATION FINALE

Une fois TOUS les tests passés :

1. ✅ La formule gratuite n'essaie plus de générer de PDF
2. ✅ Le choix de formule est AVANT le consentement
3. ✅ L'admin peut activer/désactiver PDF et email
4. ✅ Les champs premium sont validés
5. ✅ Le module est testable sans spam

**→ Module prêt pour la production** 🚀

---

## 📞 SUPPORT

En cas de problème, vérifier :
1. Migration appliquée : `SELECT * FROM estimation_config_formules;`
2. Logs serveur : Rechercher "PDF" et "Email"
3. Config admin : Onglet "Paramètres Globaux"
4. Documentation : `RESTRUCTURATION_ESTIMATION_COMPLETE.md`
