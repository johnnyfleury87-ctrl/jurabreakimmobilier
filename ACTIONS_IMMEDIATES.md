# 🎯 ACTIONS IMMÉDIATES - Fix Admin Production

## ✅ DÉJÀ FAIT (Code pushé sur GitHub)
- Ajout `credentials: 'include'` dans TOUS les fetch admin
- Logs détaillés pour diagnostiquer les problèmes de session
- Allowlist admin directe (plus besoin de table profiles)
- Route `/admin/logout`
- Migration SQL pour auto-créer les profiles

## 🔧 À FAIRE MAINTENANT (2 étapes, 5 minutes)

### Étape 1: Appliquer la migration SQL sur Supabase

1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet → **SQL Editor** → **New Query**
3. Copier-coller le fichier `supabase/migrations/0009_auto_create_profiles.sql`
4. Cliquer sur **Run**
5. Vérifier le succès dans les logs

**OU utiliser le script:**
```bash
./scripts/apply-profile-migration.sh
```

### Étape 2: Tester en production

1. **Login:**
   ```
   https://jurabreakimmobilier.vercel.app/admin/login
   ```
   - Email : `lolita@jurabreak.fr`
   - Mot de passe : (votre mot de passe Supabase)

2. **Tester les annonces:**
   ```
   https://jurabreakimmobilier.vercel.app/admin/annonces
   ```
   
3. **Vérifier:**
   - ✅ Liste des annonces s'affiche
   - ✅ Aucun 401 dans la console
   - ✅ Bouton "Créer une annonce de test" fonctionne
   - ✅ CRUD complet fonctionne (create, read, update, delete)
   - ✅ Upload photos fonctionne

## 🔍 Si ça ne marche toujours pas

### Diagnostic rapide:
```bash
# Tester l'API après login
curl -i https://jurabreakimmobilier.vercel.app/api/admin/annonces
```

**Si 401 "Auth session missing!":**
- Les cookies ne sont pas transmis
- Vérifier dans DevTools → Application → Cookies
- Doit avoir: `sb-<project>-auth-token`

**Si pas de cookies après login:**
- Problème d'authentification Supabase
- Vérifier les credentials dans Vercel env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Logs à consulter:
1. **Vercel:** Dashboard → Deployments → Runtime Logs
2. **Supabase:** Dashboard → Logs → Postgres Logs
3. **Navigateur:** DevTools (F12) → Console + Network

## 📋 Checklist complète

Pour plus de détails, consulter:
- [CHECKLIST_DEPLOIEMENT_ADMIN.md](CHECKLIST_DEPLOIEMENT_ADMIN.md)
- [GUIDE_TEST_ADMIN_PRODUCTION.md](GUIDE_TEST_ADMIN_PRODUCTION.md)
