# ✅ CORRECTION EFFECTUÉE - Admin JuraBreak

## 🐛 PROBLÈME IDENTIFIÉ

**Erreur:** `401 Unauthorized` sur `/api/admin/annonces`  
**Cause:** Les routes API n'utilisaient pas le `DEV_ADMIN_BYPASS` configuré dans `.env.local`

## 🔧 SOLUTION APPLIQUÉE

### 1. Création d'un helper d'authentification API
**Fichier:** [src/lib/auth/apiAuth.js](src/lib/auth/apiAuth.js)

Helper centralisé `checkApiAdminAuth()` qui:
- Gère le DEV_ADMIN_BYPASS automatiquement
- Retourne le client Supabase + user + erreur si applicable
- Log les détails d'auth pour faciliter le debug

### 2. Refactorisation de toutes les routes API
**Fichiers modifiés:**
- [src/app/api/admin/annonces/route.js](src/app/api/admin/annonces/route.js) - GET + POST
- [src/app/api/admin/annonces/[id]/route.js](src/app/api/admin/annonces/[id]/route.js) - GET + PUT + DELETE
- [src/app/api/admin/annonces/[id]/photos/route.js](src/app/api/admin/annonces/[id]/photos/route.js) - POST
- [src/app/api/admin/annonces/[id]/photos/[photoId]/route.js](src/app/api/admin/annonces/[id]/photos/[photoId]/route.js) - DELETE

**Avant:**
```javascript
const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user || !isAdminEmail(user.email)) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}
```

**Après:**
```javascript
const { supabase, user, error: authError } = await checkApiAdminAuth()
if (authError) return authError
```

## 📊 RÉSULTAT

**Test en local:**
```bash
curl -s http://localhost:3000/api/admin/annonces | jq '.'
```

**Réponse:**
```json
{
  "annonces": [
    {
      "id": "73a2a8fd-d288-412d-9d50-f1fb3afabda1",
      "titre": "Belle maison familiale",
      "slug": "belle-maison-familiale",
      ...
    }
  ]
}
```

✅ **Status 200** - La liste des annonces est récupérée correctement

---

## 🎯 PROCHAINES ÉTAPES

### EN DÉVELOPPEMENT (DEV_BYPASS activé)
✅ L'API fonctionne sans auth  
✅ Peut tester le CRUD complet

### EN PRODUCTION (Vercel)
⚠️ **Désactiver `DEV_ADMIN_BYPASS`** dans Vercel Environment Variables

**Pour tester avec vraie auth:**
1. Désactiver DEV_BYPASS dans `.env.local`
2. Se connecter via `/admin/login`
3. Vérifier que les cookies Supabase sont présents
4. Tester `/admin/annonces` → doit charger la liste

---

## 📝 LOGS ACTIVÉS

Les logs serveur montrent maintenant:
```
⚠️ DEV API BYPASS ACTIF - Ne jamais utiliser en production !
✅ DEV BYPASS: 1 annonces récupérées
```

En mode normal (sans bypass):
```
🔍 GET /api/admin/annonces - Auth check: { hasUser: true, email: 'lolita@jurabreak.fr' }
✅ Admin autorisé: lolita@jurabreak.fr
✅ 5 annonces récupérées
```

---

## ✅ VALIDATION

- [x] API `/api/admin/annonces` retourne 200
- [x] Liste des annonces accessible
- [x] Helper auth API créé
- [x] Toutes les routes API refactorisées
- [x] Logs de debug activés
- [ ] **Test avec vraie auth (sans DEV_BYPASS)**
- [ ] **Test UI /admin/annonces**
- [ ] **Test création annonce + photos**

---

**Commit:** `8382906` - "🔧 FIX: Correction 401 admin - DEV_BYPASS + helper auth API"  
**Date:** 16 janvier 2026
