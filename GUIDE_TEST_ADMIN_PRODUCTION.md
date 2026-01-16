# Guide de Test Admin sur Vercel (Production)

## ⚠️ IMPORTANT : Vous devez vous connecter d'abord !

Le 401 que vous voyez est **NORMAL** car vous n'êtes pas connecté.

## Étapes pour tester l'admin sur Vercel :

### 1. Ouvrir la page de login
```
https://jurabreakimmobilier.vercel.app/admin/login
```

### 2. Se connecter avec un email autorisé
Emails autorisés dans le code :
- `lolita@jurabreak.fr`
- `contact@jurabreak.fr`

**IMPORTANT** : Ces emails doivent exister dans votre base Supabase !

### 3. Choisir la méthode de connexion

#### Option A : Mot de passe (recommandé)
- Email : `lolita@jurabreak.fr`
- Mot de passe : (votre mot de passe Supabase)

#### Option B : Lien magique (Magic Link)
- Entrez l'email
- Cliquez sur "Envoyer le lien"
- Consultez votre boîte mail
- Cliquez sur le lien reçu

### 4. Après connexion réussie
Vous serez redirigé vers `/admin` et **les cookies de session seront définis**.

### 5. Tester les annonces
Maintenant vous pouvez aller sur :
```
https://jurabreakimmobilier.vercel.app/admin/annonces
```

L'API `/api/admin/annonces` retournera 200 OK au lieu de 401.

---

## 🔧 Configuration Vercel requise

Vérifiez que ces variables sont définies sur Vercel :

1. **Settings → Environment Variables**
2. Vérifiez :
   - `NEXT_PUBLIC_SUPABASE_URL` → URL de votre projet Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Clé anon de Supabase

3. **NE PAS définir** `NEXT_PUBLIC_DEV_ADMIN_BYPASS` sur Vercel !

---

## 🔍 Comment créer un utilisateur admin sur Supabase

Si `lolita@jurabreak.fr` n'existe pas encore :

### Via le dashboard Supabase :
1. Aller sur `https://supabase.com/dashboard`
2. Sélectionner votre projet
3. Aller dans **Authentication → Users**
4. Cliquer sur **Add User**
5. Entrer :
   - Email : `lolita@jurabreak.fr`
   - Password : (choisir un mot de passe)
   - Confirm : (cocher "Auto Confirm User")

### Via SQL (alternatif) :
```sql
-- Créer l'utilisateur dans auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'lolita@jurabreak.fr',
  crypt('VotreMotDePasse', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  ''
);
```

---

## ❌ Erreurs courantes

### "401 Unauthorized" sur l'admin
**Cause** : Vous n'êtes pas connecté
**Solution** : Aller sur `/admin/login` et se connecter

### "Invalid login credentials"
**Cause** : Email/mot de passe incorrect OU email non autorisé
**Solution** : 
1. Vérifier que l'email est dans la whitelist : `lolita@jurabreak.fr` ou `contact@jurabreak.fr`
2. Vérifier que l'utilisateur existe dans Supabase
3. Vérifier le mot de passe

### "Email not confirmed"
**Cause** : L'utilisateur n'a pas confirmé son email
**Solution** : Dans Supabase Dashboard → Authentication → Users → cliquer sur l'utilisateur → "Confirm email"

---

## ✅ Test de bon fonctionnement

### Test rapide via curl (sans cookies = 401 attendu)
```bash
curl -I https://jurabreakimmobilier.vercel.app/api/admin/annonces
# Attendu : HTTP/2 401
```

### Test après login (avec cookies = 200 OK)
1. Se connecter via navigateur sur `/admin/login`
2. Ouvrir DevTools (F12) → Network
3. Aller sur `/admin/annonces`
4. Vérifier que l'API retourne 200 OK

### Vérifier les cookies après login
1. DevTools (F12) → Application → Cookies
2. Vérifier la présence de :
   - `sb-access-token`
   - `sb-refresh-token`

---

## 🚀 Mode DEV BYPASS (LOCAL UNIQUEMENT)

Pour le développement local SEULEMENT :

```bash
# Dans .env.local
NEXT_PUBLIC_DEV_ADMIN_BYPASS=true
```

**⚠️ NE JAMAIS ACTIVER EN PRODUCTION !**

Ce mode bypasse l'authentification pour faciliter les tests locaux.

---

## 📞 Besoin d'aide ?

Si après avoir suivi ce guide vous avez toujours des erreurs :
1. Vérifier les logs Vercel : Dashboard → Logs
2. Vérifier les logs Supabase : Dashboard → Logs
3. Ouvrir DevTools (F12) et vérifier les erreurs de console
