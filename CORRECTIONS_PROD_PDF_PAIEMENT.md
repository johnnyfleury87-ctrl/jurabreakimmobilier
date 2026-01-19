# CORRECTIONS PRODUCTION - PDF Test + Route Paiement
## Date : 19 janvier 2026

---

## 🔴 PROBLÈMES IDENTIFIÉS

### A) Route `/estimation/paiement/[id]` → 404
- **Symptôme** : Page "This page could not be found" en production
- **Cause** : Route Next.js inexistante dans l'App Router
- **Impact** : Utilisateurs bloqués après choix formule payante

### B) Admin "Estimations (Test PDF)" → Liste vide
- **Symptôme** : "Aucune estimation trouvée" même si estimations existent
- **Cause** : RLS Supabase bloque la requête client-side
- **Impact** : Impossible de tester génération PDF

### C) Génération PDF test → Erreurs muettes
- **Symptôme** : Erreur 500 sans détails exploitables
- **Cause** : Logs insuffisants, erreurs non catchées
- **Impact** : Impossible de déboguer les problèmes

### D) Pas d'estimation de test
- **Symptôme** : Liste vide et pas de moyen rapide de créer une estimation
- **Impact** : Impossible de tester le workflow complet

---

## ✅ SOLUTIONS IMPLÉMENTÉES

### A) Route Paiement créée

**Fichier** : `/src/app/estimation/paiement/[id]/page.js`

```javascript
'use client'
export default function PaiementEstimationPage() {
  // Charge l'estimation
  // Affiche récapitulatif + prix
  // Crée session Stripe Checkout
  // Redirige vers Stripe
}
```

**Features** :
- ✅ Chargement estimation depuis DB
- ✅ Vérification formule (gratuite → redirection résultat)
- ✅ Affichage récap (bien, formule, prix)
- ✅ Bouton paiement Stripe
- ✅ Gestion erreurs avec messages clairs
- ✅ Loading states
- ✅ Design moderne avec gradient

**Routes actives** :
- `/estimation/paiement/[uuid]` → Page paiement
- Redirection auto si gratuite ou déjà payée

---

### B) Liste Admin via Service Role

**Problème RLS** : La requête client-side était bloquée par Row Level Security.

**Solution** : Endpoint admin avec `SUPABASE_SERVICE_ROLE_KEY`

**Fichier** : `/src/app/api/admin/estimation/list/route.js`

```javascript
export async function GET(request) {
  // 1. Vérifier auth + role admin avec client normal
  // 2. Utiliser service role pour lister TOUTES les estimations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  const { data: estimations } = await supabaseAdmin
    .from('estimations')
    .select('*, profiles(email, nom, prenom)')
    .order('created_at', { ascending: false })
    .limit(100)
}
```

**Modification admin UI** :
```javascript
// Avant (bloqué par RLS)
const { data } = await supabase.from('estimations').select('*')

// Après (via API admin)
const response = await fetch('/api/admin/estimation/list')
const data = await response.json()
setEstimations(data.estimations)
```

---

### C) Logs détaillés génération PDF

**Endpoint amélioré** : `/api/admin/estimation/[id]/generate-pdf-test`

**Logs par étape** :
```javascript
const logPrefix = `[ADMIN TEST ${id.slice(0, 8)}]`

console.log(`${logPrefix} === DÉBUT GÉNÉRATION PDF TEST ===`)
console.log(`${logPrefix} Étape 1: Vérification authentification...`)
console.log(`${logPrefix} ✅ User authentifié: ${user.id}`)
console.log(`${logPrefix} Étape 2: Vérification mode test...`)
console.log(`${logPrefix} ✅ Mode test activé`)
console.log(`${logPrefix} Étape 3: Chargement estimation...`)
console.log(`${logPrefix} ✅ Estimation chargée - Formule: ${formule}`)
console.log(`${logPrefix} Étape 4: Génération PDF...`)
console.log(`${logPrefix} ✅ PDF généré: ${pdf_path}`)
console.log(`${logPrefix} Étape 5: MAJ base de données...`)
console.log(`${logPrefix} ✅ DB mise à jour`)
console.log(`${logPrefix} === SUCCÈS ===`)
```

**En cas d'erreur** :
```javascript
console.error(`${logPrefix} ❌ Erreur chargement estimation:`, error)
return NextResponse.json({ 
  error: 'Erreur chargement estimation',
  details: error.message,
  step: 'Étape 3'
}, { status: 500 })
```

**Service PDF** : `/api/pdf/generate`

Logs similaires :
```javascript
[PDF TEST] === DÉBUT GÉNÉRATION ===
[PDF TEST] Estimation ID: 12345678
[PDF TEST] Mode: TEST (admin)
[PDF TEST] Chargement estimation...
[PDF TEST] ✅ Estimation chargée - Formule: gratuite
[PDF TEST] Génération PDF...
[PDF TEST] ✅ PDF généré (45231 bytes)
[PDF TEST] Upload vers Storage: estimations/TEST_estimation_...pdf
[PDF TEST] ✅ Upload réussi
[PDF TEST] === SUCCÈS ===
```

---

### D) Création estimation de test

**Endpoint** : `/api/admin/estimation/create-test`

**Fonctionnement** :
```javascript
export async function POST(request) {
  // 1. Vérifier admin
  // 2. Utiliser service role
  // 3. Récupérer commune au hasard
  // 4. Créer estimation minimale valide
  
  const testEstimation = {
    user_id: user.id,
    motif: 'curiosite',
    type_bien: 'maison',
    surface_habitable: 120,
    surface_terrain: 500,
    commune_id: commune.id,
    commune_nom: commune.nom,
    code_postal: commune.code_postal,
    annee_construction: 2010,
    etat_bien: 'bon',
    formule: 'gratuite',
    consentement_accepte: true,
    calcul_detail: { test: true }
  }
}
```

**UI Admin** :
```jsx
{estimations.length === 0 ? (
  <div>
    <p>Aucune estimation trouvée</p>
    <button onClick={handleCreateTestEstimation}>
      ➕ Créer une estimation de test
    </button>
  </div>
) : (
  <table>...</table>
)}
```

---

## 📊 RÉCAPITULATIF DES FICHIERS

### Fichiers créés ✨

| Fichier | Description |
|---------|-------------|
| `src/app/estimation/paiement/[id]/page.js` | Page paiement Stripe |
| `src/app/estimation/paiement/[id]/page.module.css` | Styles page paiement |
| `src/app/api/admin/estimation/list/route.js` | Liste estimations (service role) |
| `src/app/api/admin/estimation/create-test/route.js` | Créer estimation test |

### Fichiers modifiés 🔧

| Fichier | Modifications |
|---------|---------------|
| `src/app/admin/(protected)/estimation/page.js` | Appel API `/list`, bouton création test |
| `src/app/api/admin/estimation/[id]/generate-pdf-test/route.js` | Logs détaillés étape par étape |
| `src/app/api/pdf/generate/route.js` | Logs détaillés génération PDF |

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Route paiement
```bash
# Visiter URL
https://votre-site.com/estimation/paiement/[uuid-valide]

# Attendu :
✅ Page s'affiche
✅ Récapitulatif visible
✅ Bouton "Payer XX€" présent
✅ Pas de 404
```

### Test 2 : Liste estimations admin
```bash
# Se connecter admin
# Aller dans Admin > Estimation > Estimations (Test PDF)

# Attendu :
✅ Liste d'estimations affichée (ou bouton création test)
✅ Pas de "Aucune estimation trouvée" si estimations existent
✅ Colonnes : ID, Client, Formule, PDF, Date, Actions
```

### Test 3 : Création estimation test
```bash
# Si liste vide, cliquer "Créer une estimation de test"

# Attendu :
✅ Message "Estimation test créée"
✅ Liste se rafraîchit
✅ Nouvelle ligne apparaît
```

### Test 4 : Génération PDF test
```bash
# Activer "Mode test PDF (admin)" dans Paramètres Globaux
# Cliquer "🧪 Générer PDF (test)" sur une estimation

# Attendu :
✅ Message "PDF test généré avec succès"
✅ Badge "TEST" apparaît
✅ Bouton "📥 Télécharger" activé
✅ Logs détaillés dans la console serveur
```

### Test 5 : Logs serveur
```bash
# Vérifier logs Vercel/console

# Attendu :
[ADMIN TEST 12345678] === DÉBUT GÉNÉRATION PDF TEST ===
[ADMIN TEST 12345678] Étape 1: Vérification authentification...
[ADMIN TEST 12345678] ✅ User authentifié
[ADMIN TEST 12345678] Étape 2: Vérification mode test...
[ADMIN TEST 12345678] ✅ Mode test activé
[ADMIN TEST 12345678] Étape 3: Chargement estimation...
[ADMIN TEST 12345678] ✅ Estimation chargée - Formule: gratuite
[ADMIN TEST 12345678] Étape 4: Génération PDF...
[PDF TEST] === DÉBUT GÉNÉRATION ===
[PDF TEST] Mode: TEST (admin)
[PDF TEST] ✅ PDF généré (45231 bytes)
[PDF TEST] ✅ Upload réussi: TEST_estimation_...pdf
[ADMIN TEST 12345678] Étape 5: MAJ base de données...
[ADMIN TEST 12345678] === SUCCÈS ===
```

### Test 6 : Téléchargement PDF
```bash
# Cliquer "📥 Télécharger"

# Attendu :
✅ Fichier PDF téléchargé
✅ Nom : estimation_[uuid].pdf
✅ PDF s'ouvre
✅ Watermark "MODE TEST" visible
✅ Bandeau rouge en haut
```

---

## 🔐 VARIABLES D'ENVIRONNEMENT REQUISES

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # ⚠️ SECRET - service role

# Site
NEXT_PUBLIC_SITE_URL=https://votre-site.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**⚠️ IMPORTANT** : `SUPABASE_SERVICE_ROLE_KEY` doit être configurée dans Vercel pour que les endpoints admin fonctionnent.

---

## 📝 CHECKLIST DÉPLOIEMENT

### Avant push
- [x] Route paiement créée avec styles
- [x] Endpoint `/api/admin/estimation/list` créé
- [x] Endpoint `/api/admin/estimation/create-test` créé
- [x] Logs détaillés ajoutés partout
- [x] Bouton création test dans UI admin
- [x] Compilation sans erreurs

### Après push
- [ ] Vérifier `SUPABASE_SERVICE_ROLE_KEY` dans Vercel
- [ ] Tester route `/estimation/paiement/[id]`
- [ ] Tester liste admin
- [ ] Tester création estimation test
- [ ] Tester génération PDF test
- [ ] Vérifier logs Vercel

### Commandes
```bash
# Push
git add .
git commit -m "fix: route paiement 404 + liste admin RLS + logs PDF détaillés"
git push origin main

# Vérifier env Vercel
vercel env ls

# Ajouter service role key si manquante
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Coller la clé depuis Supabase Dashboard > Settings > API
# Sélectionner : Production + Preview

# Redéployer
vercel --prod
```

---

## 🐛 DÉBOGAGE

### Erreur : "Aucune estimation trouvée"
**Cause** : Service role key manquante ou invalide  
**Solution** :
```bash
# Vérifier dans Vercel Dashboard
Settings > Environment Variables > SUPABASE_SERVICE_ROLE_KEY

# Tester endpoint directement
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://votre-site.com/api/admin/estimation/list
```

### Erreur : "Mode test PDF désactivé"
**Cause** : Paramètre `mode_test_pdf_admin` = false  
**Solution** :
1. Admin > Estimation > Paramètres Globaux
2. Activer switch "🧪 Mode test PDF (admin)"
3. Vérifier en DB :
```sql
SELECT * FROM estimation_parametres_globaux 
WHERE cle = 'mode_test_pdf_admin';
```

### Erreur : "Estimation introuvable"
**Cause** : UUID invalide ou estimation supprimée  
**Solution** :
1. Vérifier UUID correct
2. Créer estimation test via bouton admin
3. Vérifier en DB :
```sql
SELECT id, formule, created_at 
FROM estimations 
ORDER BY created_at DESC 
LIMIT 10;
```

### Erreur : "Upload Storage échoué"
**Cause** : Bucket `estimations` inexistant ou policies incorrectes  
**Solution** :
1. Supabase Dashboard > Storage
2. Vérifier bucket `estimations` existe
3. Vérifier policies :
```sql
-- Admin/service role peut tout faire
CREATE POLICY "Admin full access" ON storage.objects
FOR ALL USING (bucket_id = 'estimations' AND auth.role() = 'service_role');
```

---

## 📚 DOCUMENTATION LIÉE

- [MODE_TEST_PDF_ADMIN.md](MODE_TEST_PDF_ADMIN.md) - Mode test PDF complet
- [RESTRUCTURATION_FONDAMENTALE_FORMULE.md](RESTRUCTURATION_FONDAMENTALE_FORMULE.md) - Ordre des étapes
- [GUIDE_TEST_ESTIMATION_RESTRUCTURE.md](GUIDE_TEST_ESTIMATION_RESTRUCTURE.md) - Tests estimation

---

**Date** : 19 janvier 2026  
**Statut** : ✅ Corrections implémentées, prêtes pour déploiement  
**Next step** : Appliquer migration 0014 + tester en production
