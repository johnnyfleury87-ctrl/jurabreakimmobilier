# 📋 TODO - Actions Restantes

**Date**: 16 janvier 2026  
**Statut**: Corrections code complétées, reste actions manuelles et tests

---

## ✅ COMPLÉTÉ (Code)

- [x] Routes dynamiques Next.js (export dynamic + revalidate)
- [x] Auth SSR propre avec @supabase/ssr
- [x] Vérification rôle admin via table profiles (avec fallback)
- [x] Migration SQL auto-création profils préparée
- [x] CRUD annonces complet (API + UI)
- [x] Upload photos mobile
- [x] Calcul honoraires automatique
- [x] Menu admin sans liens 404
- [x] Revalidation cache après modifications
- [x] Documentation CHECKLIST_ADMIN_PROPRE.md

---

## 🔴 URGENT - À FAIRE MAINTENANT

### 1. Appliquer Migration SQL Supabase
**Fichier**: `supabase/migrations/0009_auto_create_profiles.sql`

**Action**:
1. Se connecter à Supabase Dashboard: https://supabase.com/dashboard
2. Sélectionner le projet JuraBreak
3. Aller dans **SQL Editor**
4. Créer une nouvelle query
5. Copier/coller TOUT le contenu de `0009_auto_create_profiles.sql`
6. Cliquer **Run**
7. Vérifier succès:
   ```sql
   -- Tester que la table profiles existe
   SELECT * FROM profiles LIMIT 5;
   
   -- Tester que le trigger existe
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

**Résultat attendu**: Table `profiles` créée, trigger actif, profils existants créés automatiquement

---

### 2. Vérifier/Créer Profil Admin Lolita
```sql
-- Vérifier si profil existe
SELECT id, email, role FROM profiles 
WHERE email = 'lolita@jurabreak.fr';

-- Si absent, créer manuellement:
INSERT INTO profiles (id, email, role, created_at, updated_at)
SELECT 
  u.id, 
  u.email, 
  'admin',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'lolita@jurabreak.fr'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', updated_at = NOW();
```

**Résultat attendu**: 1 ligne retournée avec `role='admin'`

---

### 3. Tester Build Local
```bash
cd /workspaces/jurabreakimmobilier
npm run build
```

**Vérifier dans les logs**:
- ✅ AUCUNE erreur "couldn't be rendered statically because it used cookies"
- ✅ Build succeed
- ✅ Routes statiques générées
- ✅ Pas d'erreur TypeScript/ESLint

**Si erreurs**: Lire message, corriger, re-build

---

### 4. Tester Login Local
```bash
npm run dev
# Ouvrir: http://localhost:3000/admin/login
```

**Test**:
1. Se connecter avec `lolita@jurabreak.fr`
2. Ouvrir DevTools (F12) → Console + Network
3. Vérifier:
   - ✅ Redirection vers `/admin` (dashboard)
   - ✅ Pas d'erreur 401 dans Network tab
   - ✅ Pas d'erreur console rouge
   - ✅ Email affiché dans sidebar

**Si erreur 401**: Vérifier migration SQL appliquée (étape 1)

---

### 5. Tester CRUD Annonces
```
http://localhost:3000/admin/annonces
```

**Test complet**:
1. **Liste**: Cliquer "Annonces" → page charge sans erreur
2. **Créer**: 
   - Cliquer "+ Nouvelle annonce"
   - Remplir titre, ville, type_bien, prix
   - Observer calcul honoraires (temps réel)
   - Upload 2-3 photos
   - Cliquer "Créer l'annonce"
   - Vérifier redirection + message succès
3. **Modifier**:
   - Cliquer "Modifier" sur une annonce
   - Changer prix (observer recalcul honoraires)
   - Ajouter/supprimer photo
   - Sauvegarder
4. **Toggle visibilité**: Cliquer sur icône œil → doit basculer
5. **Changer statut**: Dropdown statut → choisir "SOUS_COMPROMIS"
6. **Supprimer**: Bouton "Supprimer" → confirmer → disparaît

**Chaque action**: Vérifier dans Network tab que API retourne 200/201

---

### 6. Vérifier Côté Public
```
http://localhost:3000/annonces
```

**Test**:
- Annonces créées apparaissent
- Annonces cachées n'apparaissent PAS
- Annonces supprimées n'apparaissent PAS
- Photos s'affichent correctement
- Honoraires visibles dans fiche annonce

**Modifier une annonce depuis admin** → Rafraîchir `/annonces` → Changement visible immédiatement (revalidation)

---

## 🟡 IMPORTANT - Avant Déploiement Vercel

### 7. Vérifier Variables d'Environnement Vercel
**Dashboard Vercel → Settings → Environment Variables**

Variables requises:
```
NEXT_PUBLIC_SUPABASE_URL = https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ... (optionnel mais recommandé)
```

**CRITIQUE**:
- ❌ **NE PAS** ajouter `NEXT_PUBLIC_DEV_ADMIN_BYPASS=true` en production
- ❌ **NE PAS** commit .env.local dans Git

---

### 8. Push sur GitHub
```bash
cd /workspaces/jurabreakimmobilier

# Vérifier changements
git status

# Ajouter tous les fichiers modifiés
git add .

# Commit avec message descriptif
git commit -m "fix: admin Vercel - routes dynamiques, auth SSR, profils admin

- Ajout export dynamic sur routes API/pages admin
- Vérification role admin via table profiles
- Migration SQL auto-création profils
- CRUD annonces complet + upload photos mobile
- Calcul honoraires automatique intégré
- Documentation CHECKLIST_ADMIN_PROPRE.md"

# Push
git push origin main
```

---

### 9. Surveiller Build Vercel
**Dashboard Vercel → Deployments**

**Vérifier**:
- ✅ Build Status: "Ready"
- ✅ Pas d'erreur "Dynamic server usage"
- ✅ Functions déployées (API routes)
- ✅ Durée build < 2 min (normal)

**Si erreurs**: Lire logs Vercel, corriger localement, re-push

---

### 10. Test Production Complet
**URL**: https://[VOTRE-DOMAINE-VERCEL].vercel.app

**Test**:
1. Admin login: https://[DOMAINE]/admin/login
2. Login avec `lolita@jurabreak.fr`
3. Dashboard → Annonces
4. Créer annonce + upload photos
5. Vérifier côté public: https://[DOMAINE]/annonces
6. Modifier annonce → vérifier mise à jour immédiate public

**Chrome DevTools**:
- Onglet Network: Vérifier toutes API routes 200/201
- Onglet Console: AUCUNE erreur rouge
- Mobile responsive: Tester sur vraie device

---

## 🟢 OPTIONNEL - Améliorations Post-Déploiement

### 11. Configurer Domaine Custom (si besoin)
- Vercel Dashboard → Settings → Domains
- Ajouter `admin.jurabreak.fr` ou `jurabreak.fr`
- Suivre instructions DNS (CNAME)

### 12. Activer Vercel Analytics
- Dashboard → Analytics → Enable
- Suivre performance, erreurs, usage

### 13. Configurer Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### 14. Backup Base Supabase
- Supabase Dashboard → Database → Backups
- Activer backup automatique (daily recommended)

### 15. Documentation Utilisateur
- Créer guide visuel pour Lolita:
  - Comment créer annonce
  - Comment upload photos depuis mobile
  - Comment gérer statuts/visibilité
- Screenshots annotés

---

## 🔴 ACTIONS BLOQUANTES

**AVANT TOUT TEST**, ces 3 étapes sont OBLIGATOIRES:
1. ✅ Migration SQL appliquée (étape 1)
2. ✅ Profil admin créé (étape 2)
3. ✅ Build local réussi (étape 3)

**Sans ces 3 étapes**: Admin ne fonctionnera PAS (erreurs 401/403)

---

## 📊 Checklist Validation Finale

Avant de marquer le projet "LIVRÉ", valider:

- [ ] Build Vercel sans erreur "Dynamic server usage"
- [ ] Admin login OK (local + production)
- [ ] GET /api/admin/annonces retourne 200 (pas 401)
- [ ] Créer annonce OK avec photos
- [ ] Modifier annonce OK avec photos
- [ ] Toggle visibilité fonctionne
- [ ] Statuts changent correctement
- [ ] Supprimer annonce (soft delete) OK
- [ ] Honoraires calculés automatiquement (vente + location)
- [ ] Côté public affiche annonces correctement
- [ ] Modifications admin → mise à jour immédiate public
- [ ] Upload photos depuis mobile fonctionnel
- [ ] Aucune erreur console (rouge)
- [ ] Aucune erreur Network 4xx/5xx (sauf expected)
- [ ] Profil admin Lolita existe avec role='admin'
- [ ] RLS policies actives (test: user lambda ne peut pas modifier annonces)

---

## 🆘 En Cas de Problème

### Erreur 401 "Auth session missing"
1. Vérifier migration SQL appliquée
2. Vérifier profil admin créé
3. Re-login `/admin/login`
4. Vérifier cookies navigateur (pas bloqués)

### Erreur Build Vercel "couldn't be rendered statically"
1. Vérifier TOUS les fichiers modifiés ont `export const dynamic = 'force-dynamic'`
2. Check: src/app/admin/**/*.js et src/app/api/**/*.js
3. Re-build local, re-push

### Photos ne s'uploadent pas
1. Vérifier bucket `annonces` existe (Supabase Storage)
2. Appliquer migration `0008_storage_annonces_photos.sql`
3. Vérifier policies Storage (admin write, public read)

### Annonces pas visibles côté public
1. Éditer annonce dans admin
2. Cocher "Visible"
3. Sauvegarder (auto-set published_at)
4. Refresh `/annonces`

---

## 📅 Timeline Recommandé

**Aujourd'hui (16 jan 2026)**:
- Étapes 1-6 (migrations, tests locaux) - 30 min
- Étapes 7-9 (deploy Vercel) - 15 min
- Étape 10 (test production) - 30 min

**Demain**:
- Étapes 11-15 (optimisations, doc) - 2h

**Total**: ~3h30 pour livraison complète

---

**✅ Dès que toutes les étapes 1-10 sont validées**: Le projet est LIVRÉ et prêt pour utilisation production par Lolita.
