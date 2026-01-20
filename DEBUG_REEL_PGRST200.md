# DEBUG RÉEL - PGRST200 Profiles Join

Date : 20 janvier 2026
Commit forcé : `ded3ae9`

## ❌ ERREUR EN PRODUCTION (confirmée)

```
POST /api/admin/estimation/generate-pdf-test → 500
Supabase REST → 400 Bad Request
PGRST200: Could not find a relationship between 'estimations' and 'profiles'
UI: popup violet + bandeau "INTERNAL_ERROR"
```

## ✅ CORRECTIONS APPLIQUÉES EN LOCAL

### Fichiers vérifiés (grep exhaustif)

```bash
grep -r "profiles\(" src/app/api/admin/estimation/
# RÉSULTAT : 0 match ✅

grep -r "profiles\(" src/app/admin/
# RÉSULTAT : 0 match ✅
```

### Code vérifié ligne par ligne

**Fichier :** `src/app/api/admin/estimation/[id]/generate-pdf-test/route.js`

```bash
sed -n '93,95p' src/app/api/admin/estimation/\[id\]/generate-pdf-test/route.js
```

**Résultat :**
```js
const { data: estimation, error: estError } = await supabase
  .from('estimations')
  .select('*')  // ✅ PAS DE JOIN PROFILES
```

**Commit HEAD vérifié :**
```bash
git show HEAD:src/app/api/admin/estimation/\[id\]/generate-pdf-test/route.js | grep "select("
# RÉSULTAT : .select('*') ✅
```

## 🔴 PROBLÈME IDENTIFIÉ

### Hypothèse 1 : Vercel n'a pas déployé le dernier commit

**Action :**
1. Aller sur https://vercel.com/johnnyfleury87-ctrl/jurabreakimmobilier
2. Vérifier l'onglet "Deployments"
3. Confirmer que le commit `ded3ae9` (ou `c8ffb50`) est déployé en **Production**
4. Si le dernier deployment est sur un commit plus ancien → **REDÉPLOYER**

**Comment forcer un redéploiement :**
- Commit vide fait : `ded3ae9`
- Attendre 2-3 minutes que Vercel build
- Vérifier les logs de build pour erreurs

### Hypothèse 2 : Cache Build Vercel

**Action :**
1. Dans Vercel → Projet Settings → General
2. Cliquer "Redeploy" avec option **"Clear build cache"** cochée
3. Attendre le build complet

### Hypothèse 3 : Il reste un join profiles AILLEURS

**Fichier suspect trouvé :**
```
src/app/estimation/paiement/[id]/page.js:37
  .select('*, profiles(email, nom, prenom)')
```

**Note :** Ce fichier est pour le paiement côté client, PAS admin. Il ne devrait pas affecter l'admin.

## 🧪 TESTS À FAIRE MAINTENANT (en production)

### Test 1 : Vérifier le déploiement Vercel

```bash
# Dans la console DevTools en prod
console.log('Test commit check')
```

**Vérifier dans Vercel :**
- Deployment status : ✅ Ready
- Commit : `ded3ae9` ou plus récent
- Logs build : sans erreur

### Test 2 : Tester l'endpoint direct

```bash
# Depuis la console DevTools en prod
fetch('/api/admin/estimation/[REMPLACER_PAR_ID_RÉEL]/generate-pdf-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // L'auth cookie sera automatiquement envoyé
  }
})
.then(r => r.json())
.then(d => console.log('RESPONSE:', d))
.catch(e => console.error('ERROR:', e))
```

**Remplacer `[REMPLACER_PAR_ID_RÉEL]` par un vrai UUID d'estimation**

### Test 3 : Vérifier les logs Vercel

1. Aller sur Vercel → Functions
2. Cliquer sur l'invocation `/api/admin/estimation/[id]/generate-pdf-test`
3. Lire les logs serveur :
   - Doit afficher : `[ADMIN TEST xxxxx] === DÉBUT GÉNÉRATION PDF TEST ===`
   - Doit afficher : `[ADMIN TEST xxxxx] ✅ Estimation chargée`
   - NE DOIT PAS afficher d'erreur Supabase `PGRST200`

### Test 4 : Network tab détails

**Dans DevTools → Network :**

1. Filtrer par "generate-pdf-test"
2. Cliquer sur la requête 500
3. Onglet "Headers" :
   - URL exacte : `/api/admin/estimation/{uuid}/generate-pdf-test`
   - Status : doit passer à 200 après redéploiement
4. Onglet "Response" :
   - Si 500 : lire `error.message` et `error.details`
   - Si 200 : vérifier `ok: true` et `data.pdf_path`

## 📋 CHECKLIST DE VALIDATION (à cocher)

### Avant redéploiement
- [x] Code local vérifié : pas de `profiles(` dans endpoints admin
- [x] Commit vérifié : HEAD contient `.select('*')` 
- [x] Push fait : commit `ded3ae9` sur origin/main

### Après redéploiement Vercel
- [ ] Vercel deployment status = Ready
- [ ] Commit déployé = `ded3ae9` ou plus récent
- [ ] Logs build Vercel sans erreur
- [ ] Test endpoint retourne 200 OK
- [ ] Storage bucket a un fichier `TEST_*.pdf`
- [ ] UI admin affiche "PDF Généré [TEST]" avec badge rouge
- [ ] Téléchargement PDF fonctionne
- [ ] PDF contient watermark "MODE TEST"

## 🚨 SI ÇA NE MARCHE TOUJOURS PAS

### Debug ultime : Vérifier le code déployé

```bash
# Ajouter temporairement dans l'endpoint une ligne de log
console.log('VERSION CODE: 2026-01-20-14h00')

# Commit + push
git add . && git commit -m "debug: add version log" && git push

# Attendre déploiement Vercel (2-3 min)

# Tester en prod et vérifier les logs Vercel
# Si le log VERSION n'apparaît pas → Vercel ne déploie PAS le bon code
```

### Debug Supabase direct

```bash
# Dans psql ou Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'estimations' 
AND column_name = 'user_id';

# Si user_id n'existe pas → c'est normal, le code ne doit PAS faire de join
```

### Dernier recours : Vérifier RLS policies

```sql
-- Dans Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'estimations';

-- Si une policy fait référence à profiles → la désactiver temporairement
-- ALTER TABLE estimations DISABLE ROW LEVEL SECURITY;
-- (mais utiliser service role devrait bypass RLS)
```

## 📦 COMMIT FINAL ATTENDU

Une fois que tout fonctionne en prod :

```bash
git add CORRECTIONS_ADMIN_ESTIMATION_TEST_PDF.md
git add CORRECTIONS_PDF_PROFILES_JOIN.md
git add DEBUG_REEL_PGRST200.md
git commit -m "fix(admin): PGRST200 profiles join removed + debug docs

- Suppression totale des joins profiles dans admin estimation
- Service role utilisé pour bypass RLS
- Endpoints retournent format standardisé ok/data/error
- Documentation debug complète pour validation prod
- Commit forcé ded3ae9 pour redéploiement Vercel
"
git push origin main
```

## ✅ PREUVES ATTENDUES (screenshot ou logs)

1. **Vercel Deployment**
   - Screenshot du deployment "Ready" sur commit `ded3ae9`
   - Logs build sans erreur

2. **Network DevTools**
   - Screenshot requête `generate-pdf-test` avec status 200
   - Response body avec `ok: true`

3. **Supabase Storage**
   - Screenshot bucket `estimations` avec fichier `TEST_estimation_*.pdf`
   - Taille > 0 bytes

4. **UI Admin**
   - Screenshot liste estimations avec badge rouge [TEST]
   - Screenshot PDF téléchargé avec watermark "MODE TEST"

---

**STATUT ACTUEL :** ⚠️ EN ATTENTE REDÉPLOIEMENT VERCEL

**PROCHAINE ÉTAPE :** Attendre 2-3 minutes puis vérifier Vercel Deployments
