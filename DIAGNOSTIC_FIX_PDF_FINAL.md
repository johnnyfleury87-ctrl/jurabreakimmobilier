# 🎯 DIAGNOSTIC ET FIX FINAL - GÉNÉRATION PDF

**Date:** 20 janvier 2026  
**Commit:** `27be36c`  
**Status:** ✅ Corrigé - Prêt pour test

---

## 🚨 PROBLÈME MAJEUR IDENTIFIÉ

### ❌ Cause racine du 500 INTERNAL_ERROR

**Ancienne architecture (cassée):**
```javascript
// Route: /api/admin/estimation/[id]/generate-pdf-test
const pdfUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/pdf/generate`
const response = await fetch(pdfUrl, { ... })  // ❌ Appel HTTP interne
```

**Problèmes causés:**
1. **`NEXT_PUBLIC_SITE_URL` peut être undefined** en local ou mal configuré
2. **Timeout possible** sur l'appel HTTP interne (30s limit Vercel)
3. **Headers auth non transmis** entre les 2 routes
4. **Double gestion d'erreur** complexe
5. **Logs fragmentés** (logs dans 2 routes différentes)

---

## ✅ SOLUTION APPLIQUÉE

### 🔧 Architecture simplifiée

**Nouvelle approche (directe):**
```javascript
// Route: /api/admin/estimation/[id]/generate-pdf-test
import { generateEstimationPDF } from '@/lib/pdfGenerator'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 1. Générer PDF directement
const pdfBuffer = await generateEstimationPDF(estimation, formule, { testMode: true })

// 2. Upload avec service role
const supabaseAdmin = createSupabaseClient(...)
await supabaseAdmin.storage.from('estimations').upload(filePath, pdfBuffer)

// 3. Update DB avec service role
await supabaseAdmin.from('estimations').update({ pdf_path, ... })
```

**Avantages:**
- ✅ Pas de dépendance HTTP interne
- ✅ Pas de timeout possible
- ✅ Logs dans une seule route
- ✅ Service role utilisé partout (bypass RLS)
- ✅ Code plus simple et maintenable

---

## 🔍 PISTES EXPLORÉES ET RÉPONSES

### PISTE 1 ✅ Mode test mal interprété

**Question:** Le mode test ignore-t-il vraiment le statut paiement ?

**Réponse:** OUI, maintenant explicite
```javascript
console.log(`${logPrefix} ⚠️ MODE TEST = IGNORE STATUT PAIEMENT`)
// Aucune vérification de statut_paiement en mode test
```

### PISTE 2 ✅ Session/Auth/Role

**Question:** L'auth admin fonctionne-t-elle ?

**Réponse:** OUI, vérifications en place
```javascript
console.log(`${logPrefix} ✅ User authentifié: ${user.id}`)
console.log(`${logPrefix} ✅ Role admin confirmé`)
```

**Logs ajoutés:**
- User ID
- Role récupéré depuis profiles
- Erreur si non admin

### PISTE 3 ✅ Service role mal utilisé

**Question:** Service role utilisé partout ?

**Réponse:** OUI, maintenant pour tout
```javascript
// Créé une seule fois dans la route
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Utilisé pour:
// - Générer PDF (lecture estimation)
// - Upload storage
// - Update DB (bypass RLS)
```

**Logs ajoutés:**
```javascript
console.log(`🔑 Service role présente: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`)
console.log(`🔑 Supabase URL: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`)
```

### PISTE 4 ✅ Génération PDF elle-même

**Question:** Le pdfGenerator peut-il crasher sur données manquantes ?

**Réponse:** NON, fallbacks ajoutés
```javascript
const safeEstimation = {
  nom: estimation?.nom || 'Non renseigné',
  prenom: estimation?.prenom || 'Non renseigné',
  email: estimation?.email || 'noreply@jurabreakimmobilier.com',
  commune_nom: estimation?.commune_nom || 'Non renseignée',
  code_postal: estimation?.code_postal || '39000',
  surface_habitable: estimation?.surface_habitable || 0,
  // ... etc
}
```

**Try/catch autour génération:**
```javascript
try {
  pdfBuffer = await generateEstimationPDF(estimation, formule, { testMode: true })
  console.log(`✅ PDF buffer généré: ${pdfBuffer.length} bytes`)
} catch (pdfError) {
  console.error(`❌ ERREUR GÉNÉRATION PDF:`, pdfError)
  console.error(`Stack PDF:`, pdfError.stack)
  return NextResponse.json({ error: { code: 'PDF_RENDER_ERROR', ... }})
}
```

### PISTE 5 ✅ Storage Supabase

**Question:** Upload peut-il échouer silencieusement ?

**Réponse:** NON, logs ultra-détaillés
```javascript
console.log(`📁 Upload path: ${filePath}`)
const { data, error } = await supabaseAdmin.storage.from('estimations').upload(...)

if (uploadError) {
  console.error(`❌ Erreur upload storage:`, uploadError)
  console.error(`Upload error détails:`, JSON.stringify(uploadError, null, 2))
  return NextResponse.json({ 
    error: { 
      code: 'STORAGE_ERROR', 
      hint: uploadError.hint,
      ...
    }
  })
}

console.log(`✅ Upload réussi:`, uploadData)
```

### PISTE 6 ✅ État estimation inattendu

**Question:** Dépendance à statut PAID ou CALCULATED ?

**Réponse:** NON, mode test fonctionne sur toute estimation
```javascript
// AUCUNE vérification de:
// - statut_paiement
// - statut (DRAFT/CALCULATED)
// - version_regles_id

// En mode test: si estimation existe → PDF autorisé
```

---

## 📋 LOGS DISPONIBLES

### Flux complet dans console

```
[ADMIN TEST abcd1234] === DÉBUT GÉNÉRATION PDF TEST ===
[ADMIN TEST abcd1234] Étape 1: Vérification authentification...
[ADMIN TEST abcd1234] ✅ User authentifié: uuid-user-id
[ADMIN TEST abcd1234] ✅ Role admin confirmé
[ADMIN TEST abcd1234] Étape 2: Vérification mode test...
[ADMIN TEST abcd1234] ✅ Mode test activé
[ADMIN TEST abcd1234] Étape 3: Chargement estimation...
[ADMIN TEST abcd1234] ✅ Estimation chargée - Formule: gratuite
[ADMIN TEST abcd1234] Champs présents: id, nom, prenom, email, ...
[ADMIN TEST abcd1234] Statut paiement: PENDING
[ADMIN TEST abcd1234] ⚠️ MODE TEST = IGNORE STATUT PAIEMENT
[ADMIN TEST abcd1234] Étape 4: Génération PDF directe...
[ADMIN TEST abcd1234] 🔑 Service role présente: true
[ADMIN TEST abcd1234] 🔑 Supabase URL: true
[ADMIN TEST abcd1234] Appel generateEstimationPDF...
[pdfGenerator] Début génération
[pdfGenerator] Test mode: true
[pdfGenerator] Estimation fields: id, nom, prenom, email, ...
[pdfGenerator] Safe estimation: uuid-estimation-id
[pdfGenerator] Finalisation du PDF
[pdfGenerator] PDF terminé, taille: 15234
[ADMIN TEST abcd1234] ✅ PDF buffer généré: 15234 bytes
[ADMIN TEST abcd1234] Étape 5: Upload sur Storage...
[ADMIN TEST abcd1234] 📁 Upload path: estimations/TEST_estimation_xxx_123456.pdf
[ADMIN TEST abcd1234] ✅ Upload réussi: {...}
[ADMIN TEST abcd1234] 📄 PDF Path: estimations/TEST_estimation_xxx_123456.pdf
[ADMIN TEST abcd1234] Étape 6: MAJ base de données avec service role...
[ADMIN TEST abcd1234] ✅ DB mise à jour: [{...}]
[ADMIN TEST abcd1234] === SUCCÈS COMPLET ===
```

### En cas d'erreur

Chaque étape retourne:
```json
{
  "ok": false,
  "error": {
    "message": "Message clair",
    "details": "Détails techniques",
    "code": "PDF_RENDER_ERROR | STORAGE_ERROR | ...",
    "stack": "Stack trace complète",
    "hint": "Indice Supabase si applicable"
  }
}
```

---

## 🧪 TEST LOCAL

### Commandes

```bash
# 1. Démarrer local
npm run dev

# 2. Dans un autre terminal, tester avec un ID réel
curl -X POST http://localhost:3000/api/admin/estimation/[VOTRE_ID]/generate-pdf-test \
  -H "Cookie: sb-xxx=..." \
  -H "Content-Type: application/json" \
  -v

# 3. Observer les logs dans le terminal du serveur
# Chaque étape sera loggée avec [ADMIN TEST ...]
```

### Vérifications attendues

✅ **Console logs:**
- Voir toutes les étapes 1-6
- Voir "✅ PDF buffer généré: XXX bytes"
- Voir "✅ Upload réussi"
- Voir "✅ DB mise à jour"
- Voir "=== SUCCÈS COMPLET ==="

✅ **Réponse HTTP:**
```json
{
  "ok": true,
  "data": {
    "pdf_path": "estimations/TEST_estimation_xxx_123456.pdf",
    "pdf_mode": "test",
    "formule": "gratuite",
    "file_size": 15234
  },
  "message": "PDF test généré avec succès",
  "warning": "⚠️ Ce PDF est en MODE TEST..."
}
```

✅ **Base de données:**
```sql
SELECT id, pdf_path, pdf_mode, pdf_generated_at 
FROM estimations 
WHERE id = 'votre-id';

-- Résultat attendu:
-- pdf_path: estimations/TEST_estimation_xxx_123456.pdf
-- pdf_mode: test
-- pdf_generated_at: 2026-01-20T...
```

✅ **Storage Supabase:**
- Dashboard > Storage > estimations
- Voir fichier: `TEST_estimation_xxx_123456.pdf`
- Taille: ~15 Ko

---

## 🚀 DÉPLOIEMENT PROD

### Variables ENV Vercel obligatoires

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # ⚠️ CRITIQUE
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Vérification Vercel

```bash
# CLI
vercel env ls

# Ou Dashboard
Settings > Environment Variables
```

### Bucket Storage

```sql
-- Vérifier existence
SELECT * FROM storage.buckets WHERE id = 'estimations';

-- Si absent, créer
INSERT INTO storage.buckets (id, name, public)
VALUES ('estimations', 'estimations', false);

-- Policy service_role upload
CREATE POLICY "Service role can upload PDFs" 
ON storage.objects
FOR INSERT 
TO service_role
WITH CHECK (bucket_id = 'estimations');
```

---

## ✅ DÉFINITION DE "RÉSOLU"

La génération PDF est considérée résolue quand:

1. ✅ Clic sur "Générer PDF (test)" dans admin
2. ✅ Retour HTTP 200 avec `ok: true`
3. ✅ Champ `pdf_path` rempli dans DB
4. ✅ Champ `pdf_mode` = "test"
5. ✅ Fichier visible dans Supabase Storage
6. ✅ Badge "TEST" affiché dans UI admin
7. ✅ Aucune redirection vers paiement
8. ✅ Logs console montrent "=== SUCCÈS COMPLET ==="

---

## 📊 RÉCAPITULATIF

**Problème initial:** 500 INTERNAL_ERROR  
**Cause trouvée:** Appel HTTP fetch() interne qui échoue  
**Solution:** Génération PDF directe dans la route admin  
**Commit:** `27be36c`  
**Fichiers modifiés:**
- `src/app/api/admin/estimation/[id]/generate-pdf-test/route.js` (refactoré)
- `src/lib/pdfGenerator.js` (ajout fallbacks depuis branche fix)

**Status:** ✅ Prêt pour test local puis prod
