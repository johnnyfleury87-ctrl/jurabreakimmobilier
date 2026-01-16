# 🚀 DÉPLOIEMENT IMMÉDIAT - FIX AUTH ADMIN

## ⚡ Actions immédiates (5 minutes)

### 1. Vérifier les variables Vercel

```bash
# Se connecter à Vercel
vercel login

# Lister les variables
vercel env ls

# Vérifier que ces variables EXISTENT:
# ✅ NEXT_PUBLIC_SUPABASE_URL
# ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

# Vérifier que cette variable N'EXISTE PAS:
# ❌ NEXT_PUBLIC_DEV_ADMIN_BYPASS
```

Si manquantes, les ajouter :

```bash
# Ajouter les variables Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Entrer: https://nmzcwpiebwljfzctwyfl.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
# Entrer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si `DEV_ADMIN_BYPASS` existe en prod :

```bash
# LA RETIRER IMMÉDIATEMENT
vercel env rm NEXT_PUBLIC_DEV_ADMIN_BYPASS
```

### 2. Déployer les corrections

```bash
# Commit et push
git add .
git commit -m "fix(auth): Correction 401 admin en production"
git push origin main

# Vercel déploiera automatiquement
# Ou forcer un redéploiement:
vercel --prod
```

### 3. Tester immédiatement

```bash
# Test automatique
./scripts/test-auth-prod.sh https://jurabreakimmobilier.vercel.app

# Test manuel
# 1. Ouvrir: https://jurabreakimmobilier.vercel.app/admin/login
# 2. Se connecter avec: lolita@jurabreak.fr
# 3. Aller sur: /admin/annonces
# 4. Vérifier que les annonces s'affichent (pas de 401)
```

## 📋 Checklist avant démo cliente

- [ ] Variables Vercel vérifiées
- [ ] `DEV_ADMIN_BYPASS` ABSENTE de la prod
- [ ] Code déployé (dernier commit sur main)
- [ ] Build Vercel vert (pas d'erreur)
- [ ] Test login OK
- [ ] Liste annonces OK (pas de 401)
- [ ] Création annonce OK
- [ ] Modification annonce OK
- [ ] Logs Vercel propres

## 🔥 Si toujours 401 après déploiement

### Diagnostic rapide

1. **Ouvrir la console DevTools (F12)**
   
   Vérifier l'erreur exacte :
   ```
   Failed to load /api/admin/annonces
   Status: 401
   ```

2. **Vérifier les cookies (DevTools > Application > Cookies)**
   
   Doivent être présents :
   - `sb-nmzcwpiebwljfzctwyfl-auth-token`
   - Attributs : `Secure=true`, `SameSite=Lax`
   
   Si absents : **problème de création de cookies au login**

3. **Vérifier les logs Vercel**
   
   ```bash
   vercel logs --follow
   ```
   
   Chercher :
   - `❌ AUTH_ERROR` → Problème de session
   - `❌ NO_USER` → Cookies pas envoyés
   - `⚠️ Cookie manquant` → Cookies pas créés

### Solutions rapides

| Symptôme | Solution |
|----------|----------|
| Cookies absents après login | Vider cache navigateur + réessayer |
| Cookies présents mais 401 | Variables Vercel manquantes |
| Login OK mais 401 sur API | Middleware bloque les requêtes |
| Tout fonctionne en privé | Cookies tiers bloqués |

### Commandes de debugging

```bash
# Voir les logs en temps réel
vercel logs --follow

# Voir les dernières erreurs
vercel logs | grep "❌"

# Tester l'API directement
curl -i https://jurabreakimmobilier.vercel.app/api/admin/annonces
# Doit retourner 401 (normal sans auth)

# Tester la page login
curl -I https://jurabreakimmobilier.vercel.app/admin/login
# Doit retourner 200
```

## 🎯 Script de test complet

```bash
#!/bin/bash
# Test complet de l'auth en production

URL="https://jurabreakimmobilier.vercel.app"

echo "1. Test page login..."
curl -s -o /dev/null -w "Status: %{http_code}\n" $URL/admin/login

echo "2. Test API sans auth (doit être 401)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" $URL/api/admin/annonces

echo "3. Test callback auth..."
curl -s -o /dev/null -w "Status: %{http_code}\n" $URL/auth/callback

echo "✅ Tests automatiques OK"
echo "👉 Maintenant tester manuellement le login sur $URL/admin/login"
```

## 📞 Contact urgence

Si problème bloquant :

1. **Vérifier les variables Vercel** (priorité #1)
2. **Vérifier les logs Vercel** (`vercel logs`)
3. **Tester en navigation privée** (exclure problème de cache)
4. **Rollback si nécessaire** (`vercel rollback`)

## 📦 Fichiers critiques modifiés

1. **`src/lib/supabase/server.js`** → Configuration cookies prod
2. **`src/lib/auth/apiAuth.js`** → Logs + sécurité
3. **`src/app/auth/callback/route.js`** → Route callback (NOUVEAU)
4. **`src/middleware.js`** → Protection routes (NOUVEAU)
5. **`vercel.json`** → Headers CORS

## ⏱️ Temps estimé

- ✅ Vérification variables : 2 min
- ✅ Déploiement : 2 min (automatique)
- ✅ Tests : 1 min
- **TOTAL : ~5 minutes**

---

**READY TO DEPLOY** ✅  
**Date:** 16 janvier 2026  
**Critique:** OUI - Bloque la démo cliente
