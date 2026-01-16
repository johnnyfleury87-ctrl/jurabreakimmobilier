# 🚀 DÉMARRAGE RAPIDE - Admin JuraBreak

## ⚡ En 3 minutes

### 1️⃣ Lancer le serveur de développement
```bash
cd /workspaces/jurabreakimmobilier
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

---

### 2️⃣ Se connecter à l'admin
1. Ouvrir: `http://localhost:3000/admin/login`
2. Email: `lolita@jurabreak.fr`
3. Mot de passe: _(celui configuré dans Supabase)_

---

### 3️⃣ Créer une annonce test
1. Aller sur `/admin/annonces`
2. Cliquer sur "+ Nouvelle annonce"
3. Remplir les champs obligatoires:
   - **Titre:** Test maison
   - **Type:** Maison
   - **Transaction:** Vente
   - **Ville:** Lons-le-Saunier
   - **Code postal:** 39000
   - **Prix:** 250000
4. Ajouter des photos (optionnel)
5. Cliquer "Créer l'annonce"

✅ **Résultat:** Annonce visible immédiatement sur `/annonces`

---

## 🔧 Résolution de problèmes

### ❌ Erreur 401 sur `/api/admin/annonces`

**Causes possibles:**
1. Variables d'environnement manquantes
2. Session Supabase expirée
3. Email non dans l'allowlist

**Solution:**
```bash
# Vérifier .env.local
cat .env.local | grep SUPABASE

# Doit contenir:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

Si manquant, copier depuis `.env.example` ou Supabase Dashboard.

**Vérifier l'allowlist:**
Fichier `src/lib/auth/config.js` doit contenir:
```javascript
export const ADMIN_EMAILS = [
  'contact@jurabreak.fr',
  'lolita@jurabreak.fr',
]
```

---

### ❌ Photos ne s'uploadent pas

**Solution:**
1. Vérifier que le bucket `annonces` existe dans Supabase Storage
2. Appliquer la migration:
   ```bash
   psql $DATABASE_URL -f supabase/migrations/0008_storage_annonces_photos.sql
   ```

Ou via Supabase Dashboard > Storage > Create bucket `annonces` (public)

---

### ❌ Erreurs 404 sur `/admin/leads`, `/admin/settings`

**C'est normal !** Ces routes n'existent plus. La sidebar a été nettoyée pour ne garder que:
- 📊 Dashboard
- 🏠 Annonces
- 🚪 Déconnexion

---

## 🎯 Checklist validation

Avant de valider, tester:

```
✅ Login admin fonctionne
✅ /admin/annonces charge la liste
✅ Créer annonce + photos OK
✅ Modifier annonce OK
✅ Supprimer annonce OK
✅ 0 erreur console (F12)
✅ Annonce visible sur /annonces public
```

---

## 📝 Commandes utiles

```bash
# Lancer en dev
npm run dev

# Build production
npm run build

# Démarrer prod local
npm start

# Appliquer migrations Supabase
./scripts/apply-migrations.sh

# Audit sécurité
./scripts/security-audit.sh
```

---

## 📞 Besoin d'aide ?

Consulter la checklist complète:
👉 [CHECKLIST_ADMIN_PROPRE.md](./CHECKLIST_ADMIN_PROPRE.md)

---

**C'est tout !** 🎉 L'admin est maintenant opérationnel.
