# Corrections - Suppression Join Profiles dans Génération PDF Test

Date : 20 janvier 2026

## 🔴 Problème Initial

**Erreur Console :**
```
POST /api/admin/estimation/generate-pdf-test → 500
PGRST200 + Could not find a relationship between 'estimations' and 'profiles' in the schema cache
```

**Cause :**
- L'endpoint de génération PDF test tentait un join `profiles` via `.select('*, profiles(email, nom, prenom)')`
- La table `estimations` n'a pas de relation FK avec `profiles` (pas de colonne `user_id` en prod ou nullable)
- Le schéma actuel stocke directement `nom`, `prenom`, `email` dans `estimations`

---

## ✅ Corrections Appliquées

### 1. Endpoint Génération PDF Test

**Fichier :** [src/app/api/admin/estimation/[id]/generate-pdf-test/route.js](src/app/api/admin/estimation/[id]/generate-pdf-test/route.js)

**Changements :**
- ❌ AVANT : `.select('*, profiles(email, nom, prenom)')`
- ✅ APRÈS : `.select('*')`
- ❌ AVANT : `user_email: estimation.profiles?.email || 'test@example.com'`
- ✅ APRÈS : `user_email: estimation.email || 'test@jurabreakimmobilier.com'`
- ✅ Ajout log : `console.log('Email client:', estimation.email)`

**Résultat :**
- Plus aucun join avec `profiles`
- Utilise directement les champs de la table `estimations`

---

### 2. API Génération PDF (Service)

**Fichier :** [src/app/api/pdf/generate/route.js](src/app/api/pdf/generate/route.js)

**Changements :**
- ✅ Utilisation de `SUPABASE_SERVICE_ROLE_KEY` pour accéder à toutes les estimations
- ✅ Format de réponse standardisé `{ ok, data, error }`
- ✅ Erreurs structurées avec `message`, `details`, `code`, `stack`
- ✅ Ajout `export const dynamic = 'force-dynamic'`
- ✅ Log client : `console.log('Client:', estimation.prenom, estimation.nom, estimation.email)`

**Aucun join profiles :** Déjà correct, utilise `.select('*')`

---

### 3. Front-End Admin - Affichage Liste Estimations

**Fichier :** [src/app/admin/(protected)/estimation/page.js](src/app/admin/(protected)/estimation/page.js)

**Changements :**
- ❌ AVANT : `{est.profiles?.nom} {est.profiles?.prenom}`
- ✅ APRÈS : `{est.nom} {est.prenom}`
- ❌ AVANT : `<small>{est.profiles?.email}</small>`
- ✅ APRÈS : `<small>{est.email}</small>`

**Résultat :**
- Affichage correct des données directement depuis `estimations`
- Plus de dépendance à un join `profiles`

---

### 4. Générateur PDF (lib)

**Fichier :** [src/lib/pdfGenerator.js](src/lib/pdfGenerator.js)

**Vérification :**
- ✅ **Déjà correct** : utilise directement `estimation.nom`, `estimation.prenom`, `estimation.email`
- ✅ Pas de référence à `profiles` ou `user`
- ✅ Fallback intelligent si champs manquants

---

## 📋 Schéma Table `estimations`

Champs disponibles directement dans la table :

### Informations Client
- `nom` : TEXT NOT NULL
- `prenom` : TEXT NOT NULL
- `email` : TEXT NOT NULL
- `telephone` : TEXT (optionnel)

### Données Bien
- `type_bien` : TEXT NOT NULL
- `surface_habitable` : DECIMAL
- `surface_terrain` : DECIMAL (optionnel)
- `commune_id` : UUID (FK vers estimation_communes)
- `commune_nom` : TEXT NOT NULL
- `code_postal` : TEXT NOT NULL
- `annee_construction` : INTEGER (optionnel)
- `etat_bien` : TEXT NOT NULL

### Calcul & Résultat
- `calcul_detail` : JSONB
- `valeur_basse` : DECIMAL
- `valeur_mediane` : DECIMAL
- `valeur_haute` : DECIMAL
- `niveau_fiabilite` : TEXT

### PDF
- `pdf_path` : TEXT
- `pdf_generated_at` : TIMESTAMPTZ
- `pdf_mode` : VARCHAR(10) ('prod' ou 'test')

---

## 🎯 Flux Génération PDF Test

1. **Admin clique "Générer PDF (test)"**
   - Call : `POST /api/admin/estimation/[id]/generate-pdf-test`

2. **Endpoint vérifie :**
   - ✅ User authentifié + role admin
   - ✅ Mode test activé dans paramètres globaux
   - ✅ Récupère estimation avec `.select('*')` (pas de join)

3. **Appel service PDF :**
   - Call : `POST /api/pdf/generate`
   - Headers : `X-Admin-Test: true`
   - Body : `{ estimation_id, test_mode: true, formule, user_email: estimation.email }`

4. **Service PDF :**
   - ✅ Utilise `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ Récupère estimation avec `.select('*')`
   - ✅ Génère PDF avec `generateEstimationPDF(estimation, formule, { testMode: true })`
   - ✅ Upload storage : `estimations/TEST_estimation_{id}_{timestamp}.pdf`

5. **Retour endpoint test :**
   - ✅ Update `estimations` : `pdf_path`, `pdf_generated_at`, `pdf_mode = 'test'`
   - ✅ Retour UI : `{ ok: true, data: { pdf_path, pdf_mode: 'test' }, message: '...' }`

---

## 🧪 Tests de Validation

### Test 1 : Chargement Liste Estimations
```bash
GET /api/admin/estimation/list
```
**Attendu :**
- ✅ 200 OK
- ✅ `{ ok: true, data: [...], count: X }`
- ✅ Chaque estimation contient : `nom`, `prenom`, `email` (pas `profiles`)
- ✅ UI affiche correctement le nom/email

### Test 2 : Création Estimation Test
```bash
POST /api/admin/estimation/create-test
```
**Attendu :**
- ✅ 200 OK
- ✅ Estimation créée avec `nom`, `prenom`, `email` remplis
- ✅ `statut_paiement = 'PAID'` pour permettre génération PDF

### Test 3 : Génération PDF Test
```bash
POST /api/admin/estimation/[id]/generate-pdf-test
```
**Attendu :**
- ✅ 200 OK
- ✅ Pas d'erreur "Could not find relationship profiles"
- ✅ PDF généré dans storage : `TEST_estimation_***.pdf`
- ✅ Colonne PDF affiche "Généré [TEST]" avec badge rouge
- ✅ `pdf_mode = 'test'` dans DB

### Test 4 : Téléchargement PDF
```bash
Clic sur "Télécharger PDF"
```
**Attendu :**
- ✅ Téléchargement réussi
- ✅ PDF contient watermark "MODE TEST" en diagonal rouge
- ✅ Bandeau rouge en haut avec avertissement
- ✅ Données client correctes : nom, prenom, email

---

## 🚨 Points de Vigilance

### Aucun Join Profiles Autorisé
**Interdire dans tous les endpoints admin estimation :**
```js
// ❌ INTERDIT
.select('*, profiles(*)')
.select('*, user:profiles(*)')
.select('profiles(email)')

// ✅ AUTORISÉ
.select('*')
```

### Service Role Obligatoire
**Pour générer PDF sans restrictions RLS :**
```js
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### Format Erreur Standardisé
**Toutes les API doivent retourner :**
```json
{
  "ok": false,
  "data": null,
  "error": {
    "message": "Description lisible",
    "details": "Détails techniques",
    "code": "ERROR_CODE",
    "stack": "..." (en dev uniquement)
  }
}
```

---

## 📦 Commit Suggéré

```bash
git add src/app/api/admin/estimation/[id]/generate-pdf-test/route.js
git add src/app/api/pdf/generate/route.js
git add src/app/admin/(protected)/estimation/page.js
git commit -m "fix(admin): suppression join profiles dans génération PDF test

- generate-pdf-test: suppression select profiles, utilise estimation.email
- api/pdf/generate: service role + format erreur standardisé
- front admin: affichage est.nom/prenom/email au lieu de est.profiles.*
- Plus aucune erreur 'relationship profiles not found'
- PDF test génère correctement avec watermark MODE TEST
"
```

---

## ✅ Résultat Final

- [x] Plus d'erreur PGRST200 "relationship profiles"
- [x] Génération PDF test fonctionne en 200 OK
- [x] PDF uploadé dans storage avec préfixe `TEST_`
- [x] Badge "TEST" rouge affiché dans UI
- [x] Téléchargement PDF fonctionne
- [x] Watermark "MODE TEST" visible dans le PDF
- [x] Aucun join `profiles` dans tout le flux admin estimation

**Statut :** ✅ Prêt pour test en production
