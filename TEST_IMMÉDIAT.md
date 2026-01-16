# ⚡ TEST IMMÉDIAT - Admin fonctionnel

**Serveur:** `http://localhost:3000` ✅  
**Mode:** DEV BYPASS ACTIF 🟡  
**Date:** 16 janvier 2026

---

## 🎯 TEST 1 : Accès Admin (30 secondes)

### Action
```
1. Ouvrir : http://localhost:3000/admin
```

### ✅ Résultat attendu
- **Bandeau jaune** en haut : "⚠️ DEV ADMIN BYPASS ACTIF"
- **Dashboard admin** s'affiche
- **Zéro erreur** "NEXT_REDIRECT"
- **Zéro page blanche**
- Sidebar avec menu visible

### ❌ Si erreur
```bash
# Vérifier la config
grep DEV_ADMIN_BYPASS .env.local
# Doit afficher: NEXT_PUBLIC_DEV_ADMIN_BYPASS=true

# Clear cache Next.js
rm -rf .next
npm run dev
```

---

## 🧪 TEST 2 : Créer Annonce Test (1 minute)

### Actions
```
1. Cliquer : 🏠 Annonces (sidebar)
2. Cliquer : 🧪 Annonce test
3. Confirmer dans la popup
4. Attendre 2 secondes
```

### ✅ Résultat attendu
- Message : "✅ Annonce test créée avec succès !"
- Annonce apparaît dans la liste
- Titre : "Maison test - [date/heure]"
- Prix : 250 000 €
- **Honoraires : 7 000 €** (calculés auto)

---

## 🌐 TEST 3 : Vérification Public (30 secondes)

### Actions
```
1. Ouvrir nouvel onglet : http://localhost:3000/annonces
2. Regarder la liste
```

### ✅ Résultat attendu
- Annonce test **visible immédiatement**
- Prix : 250 000 €
- Ville : Lons-le-Saunier
- Badge "À vendre"

---

## 🔐 TEST 4 : Mode Login Password (1 minute)

### Prérequis
```bash
# Désactiver le bypass
# Éditer .env.local :
NEXT_PUBLIC_DEV_ADMIN_BYPASS=false

# Restart serveur
npm run dev
```

### Actions
```
1. Aller sur : http://localhost:3000/admin
2. → Redirige vers /admin/login
3. Mode "Email + Password" doit être affiché
4. Entrer :
   - Email : lolita@jurabreak.fr
   - Password : [votre mot de passe Supabase]
5. Cliquer "Se connecter"
```

### ✅ Résultat attendu
- Connexion réussie
- Redirect vers `/admin`
- Dashboard accessible
- Pas de bandeau jaune (bypass désactivé)

### Si pas de mot de passe configuré
```
Option 1: Utiliser le mode Magic Link
- Bouton "Utiliser un lien magique"
- Entrer email
- Cliquer "Recevoir le lien"
- Vérifier email

Option 2: Créer le mot de passe dans Supabase
- Dashboard Supabase
- Authentication > Users
- Sélectionner lolita@jurabreak.fr
- Send magic link OU Reset password
```

---

## 📊 RÉCAPITULATIF

| Test | Durée | Attendu |
|------|-------|---------|
| 1. Accès admin | 30s | Dashboard + bandeau jaune |
| 2. Créer annonce | 1min | Annonce test créée |
| 3. Côté public | 30s | Annonce visible |
| 4. Login password | 1min | Connexion réussie |

**Durée totale :** 3 minutes

---

## 🎉 SUCCÈS

Si tous les tests passent :
- ✅ NEXT_REDIRECT corrigé
- ✅ Mode dev bypass fonctionnel
- ✅ CRUD annonces opérationnel
- ✅ Honoraires calculés automatiquement
- ✅ Login email+password disponible

---

## 🚀 PROCHAINE ÉTAPE

**Pour production :**
```bash
# 1. Désactiver bypass dev
NEXT_PUBLIC_DEV_ADMIN_BYPASS=false

# 2. Configurer email provider Supabase
# 3. Créer user avec mot de passe
# 4. Déployer sur Vercel
```

---

**💡 ASTUCE RAPIDE**

Pour basculer rapidement entre dev et prod :

```bash
# Mode dev (bypass)
echo "NEXT_PUBLIC_DEV_ADMIN_BYPASS=true" > .env.local.dev
cp .env.local.dev .env.local

# Mode prod (auth normale)
echo "NEXT_PUBLIC_DEV_ADMIN_BYPASS=false" > .env.local.prod
cp .env.local.prod .env.local
```
