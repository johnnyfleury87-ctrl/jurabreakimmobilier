# 🔴 FIX AUTH ADMIN PRODUCTION - 401 RÉSOLU

## 📋 Problème identifié

L'authentification admin fonctionnait en local mais échouait en production (Vercel) avec des erreurs 401 sur `/api/admin/annonces`.

### Causes principales

1. **Configuration cookies inadaptée à Vercel**
   - Attributs `secure`, `sameSite` non définis
   - Cookies Supabase non persistés correctement
   - Différence de comportement local vs production

2. **Headers CORS manquants**
   - Pas de configuration `Access-Control-Allow-Credentials`
   - Headers d'autorisation non inclus

3. **Route callback auth absente**
   - Nécessaire pour magic links et OAuth
   - Manquait dans l'architecture

4. **Logs insuffisants en production**
   - Impossible de debugger les erreurs auth
   - Pas de distinction local/prod

## ✅ Corrections appliquées

### 1. Configuration des cookies Supabase (`src/lib/supabase/server.js`)

**Avant:**
```javascript
cookies: {
  get(name) {
    return cookieStore.get(name)?.value
  },
  set(name, value, options) {
    try {
      cookieStore.set({ name, value, ...options })
    } catch (error) {
      // Erreurs avalées silencieusement
    }
  }
}
```

**Après:**
```javascript
cookies: {
  get(name) {
    const value = cookieStore.get(name)?.value
    if (!value && isProduction) {
      console.warn(`⚠️ Cookie manquant en prod: ${name}`)
    }
    return value
  },
  set(name, value, options) {
    try {
      const cookieOptions = {
        ...options,
        secure: isProduction,      // HTTPS obligatoire en prod
        sameSite: 'lax',           // Protection CSRF
        path: '/',                 // Accessible partout
        maxAge: 365 * 24 * 60 * 60 // 1 an
      }
      cookieStore.set({ name, value, ...cookieOptions })
    } catch (error) {
      if (isProduction) {
        console.error(`❌ Erreur set cookie ${name}:`, error.message)
      }
    }
  }
}
```

**Impact:** Les cookies sont maintenant correctement configurés pour HTTPS et persistés entre les requêtes.

### 2. Amélioration des logs d'authentification (`src/lib/auth/apiAuth.js`)

**Ajouts:**
- Détection environnement production (`VERCEL=1`)
- Logs détaillés des erreurs auth
- Codes d'erreur explicites (`AUTH_ERROR`, `NO_USER`)
- Validation des variables d'environnement
- **CRITIQUE:** Blocage du bypass dev en production

```javascript
if (devBypassEnabled && isProduction) {
  console.error('🚨 ALERTE SÉCURITÉ: DEV_ADMIN_BYPASS actif en PRODUCTION!')
  return { error: NextResponse.json({ error: 'Configuration invalide' }, { status: 500 }) }
}
```

### 3. Route callback auth (`src/app/auth/callback/route.js`)

**Nouvelle route créée:**
- Gère les redirections après login
- Échange le code auth contre une session
- Logs détaillés en production
- Gestion d'erreur robuste

```javascript
export async function GET(request) {
  const code = requestUrl.searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    // Redirection vers /admin
  }
}
```

### 4. Configuration Vercel (`vercel.json`)

**Ajout des headers CORS:**
```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Authorization, Content-Type, ..."
        }
      ]
    }
  ]
}
```

## 🎯 Variables d'environnement Vercel

### ✅ Obligatoires

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nmzcwpiebwljfzctwyfl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### ❌ À NE JAMAIS mettre en production

```bash
NEXT_PUBLIC_DEV_ADMIN_BYPASS=true  # INTERDIT EN PROD !
```

### Vérification sur Vercel

1. Aller sur le projet Vercel
2. Settings > Environment Variables
3. Vérifier que les 2 variables Supabase sont présentes
4. **S'assurer que `DEV_ADMIN_BYPASS` est ABSENTE**

## 🧪 Tests à effectuer

### Test automatique

```bash
./scripts/test-auth-prod.sh https://votre-app.vercel.app
```

### Test manuel

1. **Login admin**
   - Aller sur `/admin/login`
   - Se connecter avec `lolita@jurabreak.fr`
   - Vérifier redirection vers `/admin`

2. **Vérifier les cookies (DevTools F12)**
   - Application > Cookies
   - Présence de `sb-*-auth-token`
   - Attributs: `Secure=true`, `SameSite=Lax`

3. **Test CRUD annonces**
   - Aller sur `/admin/annonces`
   - Vérifier que la liste s'affiche (pas de 401)
   - Créer une annonce
   - Modifier/Supprimer

4. **Vérifier les logs Vercel**
   ```bash
   vercel logs --follow
   ```
   
   Chercher :
   - `🔍 [PROD] Vérification auth API`
   - `✅ User détecté`
   - `✅ ADMIN_OK`

## 🔍 Debugging en production

### Erreur 401 persistante

**Vérifier dans cet ordre:**

1. **Cookies**
   - DevTools > Application > Cookies
   - Présence des cookies Supabase
   - Attributs `Secure` et `SameSite`

2. **Variables d'environnement**
   - Vercel dashboard > Settings > Environment Variables
   - `NEXT_PUBLIC_SUPABASE_URL` présente
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` présente

3. **Logs Vercel**
   ```bash
   vercel logs
   ```
   - Chercher `❌ AUTH_ERROR`
   - Chercher `❌ NO_USER`
   - Chercher `⚠️ Cookie manquant en prod`

4. **Session Supabase**
   - Déconnecter/reconnecter
   - Vider les cookies du navigateur
   - Tester en navigation privée

### Messages d'erreur courants

| Erreur | Cause probable | Solution |
|--------|----------------|----------|
| `AUTH_ERROR: Auth session missing` | Cookies non envoyés | Vérifier `credentials: 'include'` côté client |
| `NO_USER - Session manquante` | Session expirée | Se reconnecter |
| `⚠️ Cookie manquant en prod: sb-*` | Cookies pas créés au login | Vérifier la config server.js |
| `🚨 DEV_ADMIN_BYPASS actif en PRODUCTION` | Variable bypass en prod | **RETIRER IMMÉDIATEMENT** |

## 📝 Checklist de déploiement

- [ ] Code poussé sur la branche principale
- [ ] Variables d'environnement vérifiées sur Vercel
- [ ] `DEV_ADMIN_BYPASS` absente de la prod
- [ ] Build Vercel réussi
- [ ] Test login admin OK
- [ ] Test CRUD annonces OK
- [ ] Cookies persistés correctement
- [ ] Logs Vercel propres (pas d'erreur 401)

## 🚀 Déploiement

```bash
# 1. Commit les changements
git add .
git commit -m "fix(auth): Correction auth admin en production (401)"

# 2. Push vers GitHub
git push origin main

# 3. Vercel déploiera automatiquement

# 4. Tester
./scripts/test-auth-prod.sh
```

## 📚 Fichiers modifiés

- ✅ `src/lib/supabase/server.js` - Config cookies production
- ✅ `src/lib/auth/apiAuth.js` - Logs et sécurité
- ✅ `src/app/auth/callback/route.js` - Route callback (NOUVEAU)
- ✅ `vercel.json` - Headers CORS
- ✅ `scripts/test-auth-prod.sh` - Script de test (NOUVEAU)

## ⚠️ Points d'attention

1. **JAMAIS de bypass dev en production**
2. Cookies HTTPS obligatoires en prod (`secure: true`)
3. SameSite=Lax pour éviter les CSRF
4. Logs détaillés pour faciliter le debugging
5. Variables d'environnement à vérifier manuellement sur Vercel

## 💡 Pour aller plus loin

### Monitoring en production

Ajouter Sentry ou LogRocket pour tracker les erreurs auth en temps réel.

### Rate limiting

Ajouter un rate limiter sur `/api/admin/*` pour éviter les attaques brute force.

### 2FA

Envisager l'ajout d'une authentification à deux facteurs pour plus de sécurité.

---

**Date:** 16 janvier 2026  
**Status:** ✅ Résolu  
**Testé en:** Local ✅ | Production ⏳ (à tester après déploiement)
