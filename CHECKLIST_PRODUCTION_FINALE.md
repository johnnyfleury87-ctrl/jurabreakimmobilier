# ✅ CHECKLIST PRODUCTION - Admin Vercel

**Date**: 16 janvier 2026  
**Statut**: Corrections appliquées - Prêt pour déploiement

---

## 🎯 CORRECTIONS STRUCTURELLES APPLIQUÉES

### 1️⃣ RENDU DYNAMIQUE (Force Dynamic)

✅ **Toutes les routes API admin** ont `export const dynamic = 'force-dynamic'`:
- `/api/admin/annonces/route.js` ✅
- `/api/admin/annonces/[id]/route.js` ✅
- `/api/admin/annonces/[id]/photos/route.js` ✅
- `/api/admin/annonces/[id]/photos/[photoId]/route.js` ✅

✅ **Toutes les routes API utilisant cookies**:
- `/api/auth/login/route.js` ✅
- `/api/estimation/route.js` ✅
- `/api/estimation/[id]/download/route.js` ✅
- `/api/contact/route.js` ✅
- `/api/annonces/route.js` ✅

✅ **Layouts admin**:
- `/app/admin/(protected)/layout.js` ✅ (a `export const dynamic`)

✅ **Pages admin**:
- Toutes les pages sont `'use client'` → Pas besoin de `export const dynamic`
- Les pages client-side n'ont PAS de problème de rendu statique

---

### 2️⃣ CLIENT SUPABASE CORRECT

✅ **Routes API** utilisent:
```javascript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

✅ **createClient()** utilise `@supabase/ssr`:
```javascript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
```

✅ **Gestion cookies correcte**:
- `get()` ✅
- `set()` ✅  
- `remove()` ✅
- Try/catch pour éviter erreurs en contexte inapproprié ✅

---

### 3️⃣ DEV_ADMIN_BYPASS (Gestion Env)

✅ **Local (.env.local)**:
```bash
NEXT_PUBLIC_DEV_ADMIN_BYPASS=true  # Pour tests sans auth
```

⚠️ **Production (Vercel)**:
```bash
NEXT_PUBLIC_DEV_ADMIN_BYPASS=false  # OU ne pas définir
```

✅ **Code vérifie correctement**:
```javascript
const devBypassEnabled = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === 'true'
```

---

### 4️⃣ GESTION D'ERREUR UX

✅ **API routes retournent JSON structuré**:
```javascript
// 401
{ "error": "Session manquante", "details": "Veuillez vous connecter" }

// 403  
{ "error": "Accès refusé", "details": "Email non autorisé" }
```

✅ **Pages admin capturent erreurs**:
```javascript
if (response.status === 401) {
  throw new Error('Session expirée. Veuillez vous reconnecter.')
}
```

✅ **UI affiche message clair** (pas de page blanche)

---

## 🧪 TESTS À EFFECTUER EN PRODUCTION

### Pré-déploiement (Local)

```bash
# 1. Build production local
npm run build

# Vérifier dans les logs:
# ✅ AUCUNE ligne "couldn't be rendered statically because it used cookies"
# ✅ Build succeeded
# ✅ Pas d'erreur TypeScript/ESLint

# 2. Tester en mode production
npm start

# Ouvrir http://localhost:3000/admin/login
# Login avec lolita@jurabreak.fr
```

**Checklist build**:
- [ ] Build réussit sans erreur
- [ ] Aucun warning "Dynamic server usage"
- [ ] Aucune erreur "couldn't be rendered statically"

---

### Post-déploiement (Vercel)

#### 1. Vérifier Variables d'Environnement

**Vercel Dashboard → Settings → Environment Variables**:

```
✅ NEXT_PUBLIC_SUPABASE_URL = https://[PROJECT].supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
✅ SUPABASE_SERVICE_ROLE_KEY = eyJ... (optionnel)
❌ NEXT_PUBLIC_DEV_ADMIN_BYPASS = false (ou absent)
✅ STRIPE_SECRET_KEY = sk_...
✅ STRIPE_WEBHOOK_SECRET = whsec_...
✅ RESEND_API_KEY = re_...
```

**IMPORTANT**:
- ❌ **NE PAS** mettre `DEV_ADMIN_BYPASS=true` en production
- ❌ **NE PAS** commit `.env.local` dans Git

#### 2. Test Login Admin

```
URL: https://[VOTRE-DOMAINE].vercel.app/admin/login
```

**Steps**:
1. Ouvrir DevTools (F12) → Network + Console
2. Se connecter avec `lolita@jurabreak.fr`
3. Vérifier:

**✅ Succès attendu**:
- Redirection vers `/admin` (dashboard)
- Aucune erreur 401 dans Network
- Aucune erreur rouge dans Console
- Email affiché dans sidebar

**❌ Si erreur 401**:
1. Vérifier migration SQL appliquée sur Supabase
2. Vérifier profil admin existe: `SELECT * FROM profiles WHERE email = 'lolita@jurabreak.fr'`
3. Vérifier RLS policies actives
4. Vérifier cookies transmis (DevTools → Application → Cookies)

#### 3. Test CRUD Annonces

```
URL: https://[DOMAINE].vercel.app/admin/annonces
```

**Checklist**:
- [ ] GET `/api/admin/annonces` → 200
- [ ] Liste annonces s'affiche
- [ ] Bouton "+ Nouvelle annonce" visible
- [ ] Créer annonce → 201
- [ ] Upload photos → 201
- [ ] Modifier annonce → 200
- [ ] Toggle visibilité → 200
- [ ] Changer statut → 200
- [ ] Supprimer annonce → 200

**Vérifier Network tab**:
- Toutes les requêtes API doivent retourner 200/201
- Aucun 401 après navigation interne
- Cookies présents dans chaque requête

#### 4. Test Côté Public

```
URL: https://[DOMAINE].vercel.app/annonces
```

**Vérifier**:
- [ ] Annonces visibles s'affichent
- [ ] Annonces cachées n'apparaissent PAS
- [ ] Annonces supprimées n'apparaissent PAS
- [ ] Photos s'affichent
- [ ] Honoraires visibles
- [ ] Après modification admin → Mise à jour immédiate (revalidation)

#### 5. Test Mobile

**Responsive**:
- [ ] Admin accessible depuis mobile
- [ ] Formulaires utilisables
- [ ] Upload photos fonctionne (caméra/galerie)
- [ ] Touch-friendly (boutons min 44px)

---

## 🐛 TROUBLESHOOTING PRODUCTION

### Erreur 401 "Auth session missing"

**Symptômes**:
- Login réussit
- Redirection vers `/admin` OK
- Mais `/admin/annonces` → "Session expirée"
- GET `/api/admin/annonces` → 401

**Causes possibles**:
1. Migration SQL non appliquée
2. Profil admin inexistant
3. RLS policies incorrectes
4. Cookies non transmis (rare si code correct)

**Solutions**:

**A) Vérifier profil admin existe**:
```sql
-- Sur Supabase Dashboard → SQL Editor
SELECT id, email, role 
FROM profiles 
WHERE email = 'lolita@jurabreak.fr';

-- Si absent, créer:
INSERT INTO profiles (id, email, role, created_at, updated_at)
SELECT u.id, u.email, 'admin', NOW(), NOW()
FROM auth.users u
WHERE u.email = 'lolita@jurabreak.fr';
```

**B) Vérifier RLS policies**:
```sql
-- Doit retourner plusieurs lignes
SELECT * FROM pg_policies WHERE tablename = 'profiles';
SELECT * FROM pg_policies WHERE tablename = 'annonces';
```

**C) Forcer revalidation session**:
- Logout `/admin/logout`
- Clear cookies navigateur
- Re-login

---

### Erreur "couldn't be rendered statically"

**Si cette erreur apparaît dans logs Vercel**:

1. Identifier la route concernée dans le log
2. Vérifier que le fichier a bien:
   ```javascript
   export const dynamic = 'force-dynamic'
   export const revalidate = 0
   ```
3. Re-deploy

**Routes à vérifier en priorité**:
- Toutes dans `/app/api/admin/`
- Toutes utilisant `cookies()` ou `createClient()`
- Layout `/app/admin/(protected)/layout.js`

---

### Photos ne s'uploadent pas

**Symptômes**:
- POST `/api/admin/annonces/[id]/photos` → 500
- Ou upload bloqué

**Vérifications**:

1. **Bucket Supabase Storage existe**:
   - Dashboard Supabase → Storage
   - Bucket `annonces` doit exister
   - Public access: Read ✅, Write: Admin only ✅

2. **Policies Storage**:
   ```sql
   -- Appliquer migration 0008_storage_annonces_photos.sql
   ```

3. **Limite taille fichier**:
   - Vercel: 4.5MB par défaut (serverless)
   - Ajuster si besoin dans `vercel.json`

---

### Annonces pas visibles côté public

**Vérifier**:
```sql
SELECT id, titre, visible, published_at, is_deleted 
FROM annonces 
WHERE id = '[ID_ANNONCE]';
```

**Pour qu'une annonce soit visible publiquement**:
- `visible = true` ✅
- `published_at IS NOT NULL` ✅
- `is_deleted = false` ✅

**Corriger**:
- Depuis admin, éditer l'annonce
- Cocher "Visible"
- Sauvegarder → Auto-set `published_at`

---

## 📊 VALIDATION FINALE

**Avant de marquer "PRODUCTION READY"**, cocher:

### Build & Deploy
- [ ] `npm run build` réussit sans erreur
- [ ] Aucun warning "Dynamic server usage"
- [ ] Push sur GitHub réussi
- [ ] Deploy Vercel succeed (vert)
- [ ] Aucune erreur dans Vercel logs

### Auth & Sessions
- [ ] Login admin OK en production
- [ ] GET `/api/admin/annonces` → 200 (pas 401)
- [ ] Session persiste après navigation
- [ ] Logout fonctionne
- [ ] Re-login OK

### CRUD Complet
- [ ] Créer annonce + photos OK
- [ ] Modifier annonce OK
- [ ] Toggle visibilité OK
- [ ] Changer statut OK
- [ ] Supprimer (soft delete) OK

### Côté Public
- [ ] Annonces visibles affichées
- [ ] Annonces cachées absentes
- [ ] Après modif admin → Mise à jour immédiate
- [ ] Photos s'affichent
- [ ] Honoraires affichés

### Mobile
- [ ] Admin accessible depuis mobile
- [ ] Upload photos mobile OK
- [ ] UI responsive
- [ ] Pas de bug touch

### Sécurité
- [ ] RLS policies actives
- [ ] Profils admin uniquement lolita + contact
- [ ] `DEV_ADMIN_BYPASS=false` en prod
- [ ] Aucune clé API dans Git
- [ ] HTTPS actif (Vercel auto)

---

## 🚀 DÉPLOIEMENT

### Étapes finales

```bash
# 1. Commit final
git add -A
git commit -m "fix: corrections production admin (dynamic rendering)"
git push origin main

# 2. Surveiller Vercel
# Dashboard Vercel → Deployments
# Attendre "Ready" (vert)

# 3. Vérifier logs
# Cliquer sur le deployment
# Onglet "Logs" → Vérifier aucune erreur

# 4. Tester production
# Aller sur https://[DOMAINE].vercel.app/admin/login
# Tester TOUT le CRUD

# 5. Valider
# Si tout OK → Marquer "Production Ready" ✅
```

---

## 📞 SUPPORT

**Si problème persiste après toutes ces corrections**:

1. Vérifier logs Vercel (onglet Logs du deployment)
2. Vérifier DevTools navigateur (Console + Network)
3. Vérifier Supabase logs (Dashboard → Logs)
4. Comparer local (qui fonctionne) vs prod (qui bug)

**Logs à fournir pour debug**:
- Screenshot erreur console navigateur
- Screenshot Network tab (requête 401)
- Logs Vercel du deployment
- Query SQL pour vérifier profil admin existe

---

**✅ RÉSUMÉ**: Toutes les corrections structurelles sont appliquées. Le code est prêt pour production. Reste à tester après déploiement et valider que tout fonctionne comme en local.
