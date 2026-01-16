# 🚀 Checklist Déploiement Admin - FIX COMPLET

**Date:** 16 janvier 2026  
**Objectif:** Admin 100% fonctionnel en production avec 0 erreur console

---

## ✅ MODIFICATIONS APPLIQUÉES

### 1. Fix Session API (CRITIQUE)
- ✅ Ajout de logs détaillés dans `apiAuth.js` :
  - `🔍 Vérification auth API...`
  - `❌ AUTH_ERROR:` avec détails (message, status, name)
  - `❌ NO_USER` si session manquante
  - `❌ NOT_ALLOWED` si email non autorisé
  - `✅ ADMIN_OK:` si succès
  
- ✅ Simplification allowlist admin (indépendant de `public.profiles`) :
  ```javascript
  const ADMIN_EMAILS = ['lolita@jurabreak.fr', 'contact@jurabreak.fr']
  ```
  Plus besoin de vérifier la table `profiles` pour autoriser l'accès

- ✅ Ajout de `credentials: 'include'` dans **TOUS** les `fetch()` vers `/api/admin/*` :
  - `src/app/admin/(protected)/annonces/page.js` (GET, POST, PUT, DELETE)
  - `src/app/admin/(protected)/annonces/new/page.js` (POST annonce + photos)
  - `src/app/admin/(protected)/annonces/[id]/edit/page.js` (GET, PUT, DELETE)
  
  **AVANT:**
  ```javascript
  const response = await fetch('/api/admin/annonces')
  ```
  
  **APRÈS:**
  ```javascript
  const response = await fetch('/api/admin/annonces', {
    credentials: 'include' // 🔑 CRUCIAL pour passer les cookies
  })
  ```

### 2. Migration SQL - Auto-création Profiles
- ✅ Créé `supabase/migrations/0009_auto_create_profiles.sql`
- ✅ Fonction `handle_new_user()` pour auto-créer les profils
- ✅ Trigger `on_auth_user_created` sur `auth.users`
- ✅ Insertion des profils pour utilisateurs existants

### 3. Route Logout
- ✅ Créé `/admin/logout/route.js`
- Appelle `supabase.auth.signOut()`
- Redirige vers `/admin/login`

### 4. Nettoyage 404
- ✅ Vérifié : **aucun lien mort** dans le menu admin
- Menu actuel : Dashboard + Annonces uniquement
- Pas de liens vers estimations/leads/settings

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### Étape 1: Appliquer la migration SQL sur Supabase

#### Option A: Via Dashboard Supabase (RECOMMANDÉ)
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Menu **SQL Editor** → **New Query**
4. Copier-coller le contenu de `supabase/migrations/0009_auto_create_profiles.sql`
5. Cliquer sur **Run**
6. Vérifier les logs : doit afficher "Success"

#### Option B: Via CLI Supabase
```bash
cd /workspaces/jurabreakimmobilier
supabase db push
```

#### Vérification
Après application de la migration, vérifier que le profil existe :
```sql
SELECT * FROM public.profiles WHERE email = 'lolita@jurabreak.fr';
```
Attendu : 1 ligne avec `role = 'admin'`

---

### Étape 2: Pousser le code sur GitHub

```bash
cd /workspaces/jurabreakimmobilier
git add -A
git commit -m "fix(admin): session cookies + credentials include + allowlist directe"
git push origin main
```

Vercel déploiera automatiquement.

---

### Étape 3: Vérifier les Variables d'Environnement sur Vercel

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet `jurabreakimmobilier`
3. **Settings → Environment Variables**
4. Vérifier que ces variables sont définies :
   - `NEXT_PUBLIC_SUPABASE_URL` → `https://xxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `eyJhbGci...`
5. **NE PAS définir** `NEXT_PUBLIC_DEV_ADMIN_BYPASS` (doit être absent ou `false`)

---

### Étape 4: Tester le Login en Production

#### 4.1 Ouvrir la page de login
```
https://jurabreakimmobilier.vercel.app/admin/login
```

#### 4.2 Se connecter
- Email : `lolita@jurabreak.fr`
- Mot de passe : (votre mot de passe Supabase)
- Cliquer sur **Se connecter**

#### 4.3 Vérifier les cookies
Ouvrir DevTools (F12) → Application → Cookies → `jurabreakimmobilier.vercel.app`

Vérifier la présence de :
- `sb-<project>-auth-token` (cookie Supabase avec le JWT)

#### 4.4 Vérifier la redirection
Après login, vous devez être redirigé vers `/admin` (Dashboard)

---

### Étape 5: Tester les Annonces (CRUD Complet)

#### 5.1 Accéder à la liste des annonces
```
https://jurabreakimmobilier.vercel.app/admin/annonces
```

**Attendu:**
- ✅ Liste des annonces affichée (ou vide si aucune)
- ✅ **AUCUN** `401 Unauthorized` dans la console
- ✅ **AUCUN** `Auth session missing!` dans les logs Vercel

#### 5.2 Créer une annonce de test
1. Cliquer sur **"Créer une annonce de test"**
2. Vérifier que l'annonce apparaît dans la liste
3. Ouvrir DevTools (F12) → Console → **AUCUNE ERREUR**

#### 5.3 Tester les opérations CRUD

##### CREATE (Nouvelle annonce complète)
1. Cliquer sur **"+ Nouvelle annonce"**
2. Remplir le formulaire :
   - Titre : "Test CRUD 2026"
   - Type : Maison
   - Transaction : Vente
   - Prix : 250000 €
   - Surface : 120 m²
   - Ville : Lons-le-Saunier
   - Description : "Test complet du système"
3. Uploader **3 photos** depuis mobile (tester responsive)
4. Cliquer sur **"Créer l'annonce"**
5. **Vérifier:**
   - ✅ Redirection vers `/admin/annonces`
   - ✅ Annonce visible dans la liste
   - ✅ Honoraires calculés automatiquement
   - ✅ Console sans erreur

##### READ (Affichage liste + détail)
1. Cliquer sur **"Modifier"** sur une annonce
2. **Vérifier:**
   - ✅ Formulaire pré-rempli avec les données
   - ✅ Photos affichées avec preview
   - ✅ Console sans erreur

##### UPDATE (Modification)
1. Sur la page d'édition, modifier :
   - Titre : ajouter " - MODIFIÉ"
   - Prix : changer pour 260000 €
2. Cliquer sur **"Enregistrer"**
3. **Vérifier:**
   - ✅ Redirection vers `/admin/annonces`
   - ✅ Modifications visibles dans la liste
   - ✅ Honoraires recalculés
   - ✅ Console sans erreur

##### DELETE (Suppression)
1. Cliquer sur **"Supprimer"** sur une annonce
2. Confirmer la suppression
3. **Vérifier:**
   - ✅ Annonce disparaît de la liste
   - ✅ Console sans erreur

#### 5.4 Tester le changement de statut
1. Cliquer sur le dropdown "Statut" d'une annonce
2. Changer de **À vendre** → **Vendu**
3. **Vérifier:**
   - ✅ Statut mis à jour instantanément
   - ✅ Badge couleur change
   - ✅ Console sans erreur

#### 5.5 Tester la visibilité
1. Cliquer sur **"Masquer"** sur une annonce visible
2. **Vérifier:**
   - ✅ Icône œil change (ouvert → barré)
   - ✅ Filtre fonctionne (Visible / Masquées)
   - ✅ Console sans erreur

---

### Étape 6: Vérifier la Synchronisation Publique

#### 6.1 Ouvrir la page publique des annonces
```
https://jurabreakimmobilier.vercel.app/annonces
```

#### 6.2 Vérifier la mise à jour immédiate
1. Dans l'admin, créer une nouvelle annonce **visible**
2. Rafraîchir la page publique `/annonces`
3. **Vérifier:**
   - ✅ Nouvelle annonce apparaît immédiatement
   - ✅ Annonces masquées n'apparaissent PAS
   - ✅ Console sans erreur

---

### Étape 7: Tester Upload Photos (Mobile)

#### 7.1 Ouvrir l'admin sur mobile
Utiliser un smartphone ou l'émulateur DevTools (F12 → Toggle device toolbar)

#### 7.2 Créer/modifier une annonce
1. Cliquer sur **"Choisir des fichiers"** ou **"📷 Prendre une photo"**
2. Sélectionner plusieurs photos (minimum 3)
3. **Vérifier:**
   - ✅ Previews des photos s'affichent
   - ✅ Upload réussi sans timeout
   - ✅ Photos visibles sur la page publique
   - ✅ Console mobile sans erreur

---

## 🔍 DIAGNOSTIC DES ERREURS

### Erreur: "401 Unauthorized" après login

**Cause possible:** Cookies non transmis

**Solution:**
1. Vérifier que `credentials: 'include'` est présent dans TOUS les fetch
2. Vérifier les cookies dans DevTools → Application → Cookies
3. Si aucun cookie `sb-*-auth-token`, le login a échoué

**Test manuel:**
```javascript
// Dans la console du navigateur (après login)
console.log(document.cookie)
// Attendu: contient "sb-xxxx-auth-token=..."
```

---

### Erreur: "Auth session missing!" dans logs Vercel

**Cause:** Les cookies ne sont pas transmis au serveur

**Solution:**
1. Vérifier que `credentials: 'include'` est dans le fetch
2. Vérifier les headers de la requête dans DevTools → Network :
   ```
   Cookie: sb-<project>-auth-token=eyJ...
   ```
3. Si absent, le navigateur ne transmet pas les cookies

---

### Erreur: "Email non autorisé"

**Cause:** L'email n'est pas dans la whitelist

**Solution:**
1. Vérifier `src/lib/auth/apiAuth.js` :
   ```javascript
   const ADMIN_EMAILS = ['lolita@jurabreak.fr', 'contact@jurabreak.fr']
   ```
2. Ajouter l'email si nécessaire
3. Redéployer

---

### Erreur: "Erreur lors du chargement des annonces"

**Cause:** Problème RLS ou permissions Supabase

**Solution:**
1. Aller sur Supabase Dashboard → Authentication → Policies
2. Vérifier que la politique `annonces` autorise SELECT pour les utilisateurs authentifiés
3. Tester dans SQL Editor :
   ```sql
   -- Tester en tant qu'utilisateur authentifié
   SET request.jwt.claims TO '{"sub": "<user_id>"}';
   SELECT * FROM annonces;
   ```

---

## ✅ CHECKLIST FINALE (Avant de Valider)

### Configuration Supabase
- [ ] Migration `0009_auto_create_profiles.sql` appliquée
- [ ] Profil `lolita@jurabreak.fr` existe avec `role = 'admin'`
- [ ] RLS activé sur table `annonces`
- [ ] RLS activé sur table `annonce_photos`
- [ ] Storage bucket `annonces-photos` configuré

### Configuration Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` définie
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` définie
- [ ] `NEXT_PUBLIC_DEV_ADMIN_BYPASS` **NON définie** (ou = `false`)

### Fonctionnalités Admin
- [ ] Login fonctionne (redirection vers `/admin`)
- [ ] Logout fonctionne (redirection vers `/admin/login`)
- [ ] Liste des annonces charge sans erreur
- [ ] Créer une annonce fonctionne
- [ ] Modifier une annonce fonctionne
- [ ] Supprimer une annonce fonctionne
- [ ] Upload photos fonctionne (desktop + mobile)
- [ ] Changement de statut fonctionne
- [ ] Toggle visibilité fonctionne
- [ ] Calcul automatique des honoraires fonctionne

### Console & Logs
- [ ] **AUCUNE** erreur 401 dans la console navigateur
- [ ] **AUCUNE** erreur 404 pour routes admin
- [ ] **AUCUN** `Auth session missing!` après login
- [ ] Logs Vercel montrent `✅ ADMIN_OK:` pour les requêtes authentifiées

### Synchronisation Publique
- [ ] Nouvelle annonce visible immédiatement sur `/annonces`
- [ ] Annonce masquée n'apparaît PAS sur `/annonces`
- [ ] Suppression d'annonce se reflète sur `/annonces`

---

## 🎯 RÉSULTAT ATTENDU

### Scénario complet de succès:

1. **Login** → `lolita@jurabreak.fr` + mot de passe → ✅ Redirigé vers `/admin`
2. **Dashboard** → Affiche "X Annonces actives" → ✅ Pas d'erreur console
3. **Liste annonces** → Charge en < 2s → ✅ Pas d'erreur 401
4. **Créer annonce** → Remplir + 3 photos → ✅ Créée en < 5s
5. **Page publique** → Rafraîchir `/annonces` → ✅ Nouvelle annonce visible
6. **Modifier annonce** → Changer prix → ✅ Sauvegardé instantanément
7. **Changer statut** → À vendre → Vendu → ✅ Badge mis à jour
8. **Masquer annonce** → Cliquer œil → ✅ Disparaît de `/annonces`
9. **Supprimer annonce** → Confirmer → ✅ Supprimée de la liste
10. **Logout** → Cliquer déconnexion → ✅ Retour au login

**Durée totale du test:** 5-10 minutes  
**Erreurs attendues:** **0**

---

## 📞 Support

Si après avoir suivi cette checklist vous rencontrez toujours des erreurs :

1. **Vérifier les logs Vercel:**
   - Dashboard Vercel → Deployments → Latest → Runtime Logs
   - Chercher `❌ AUTH_ERROR` ou `❌ NO_USER`

2. **Vérifier les logs Supabase:**
   - Dashboard Supabase → Logs → Postgres Logs
   - Chercher les erreurs RLS ou policies

3. **Test manuel de l'API:**
   ```bash
   # Après login, récupérer le cookie depuis DevTools
   curl -H "Cookie: sb-xxx-auth-token=<token>" \
        https://jurabreakimmobilier.vercel.app/api/admin/annonces
   ```
   Attendu : `200 OK` avec liste des annonces

---

**Date de création:** 16 janvier 2026  
**Dernière mise à jour:** 16 janvier 2026  
**Version:** 2.0 - FIX SESSION COMPLET
