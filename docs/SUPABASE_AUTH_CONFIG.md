# ⚙️ Configuration Supabase pour l'authentification admin

## 📋 Checklist de configuration

### 1. Activer l'authentification Email (Magic Link)

Dans Supabase Dashboard → Authentication → Settings :

✅ **Enable Email provider** : OUI
✅ **Enable Email confirmations** : NON (pour simplifier)
✅ **Secure email change** : OUI (recommandé)

### 2. Configurer les URLs de redirection

Dans **Authentication → URL Configuration** :

```
Site URL: https://jurabreakimmobilier.fr
```

**Redirect URLs** (liste blanche) :
```
https://jurabreakimmobilier.fr/admin
https://jurabreakimmobilier.fr/admin/login
http://localhost:3000/admin
http://localhost:3000/admin/login
```

### 3. Personnaliser le template d'email Magic Link

Dans **Authentication → Email Templates** → **Magic Link** :

#### Objet
```
Connexion à votre espace JuraBreak Admin
```

#### Corps HTML
```html
<h2>Bienvenue sur JuraBreak Immobilier</h2>

<p>Bonjour,</p>

<p>Cliquez sur le lien ci-dessous pour vous connecter à votre espace d'administration :</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
    Se connecter à l'administration
  </a>
</p>

<p>Ce lien est valide pendant <strong>1 heure</strong>.</p>

<p style="color: #666; font-size: 14px;">
  Si vous n'avez pas demandé cette connexion, ignorez cet email.
</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="color: #999; font-size: 12px;">
  JuraBreak Immobilier - Votre agence dans le Jura<br>
  <a href="https://jurabreakimmobilier.fr">https://jurabreakimmobilier.fr</a>
</p>
```

### 4. Configurer l'expiration du lien

Dans **Authentication → Settings** :

```
Magic Link expiry: 3600 (1 heure)
```

### 5. Variables d'environnement

Vérifier dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
```

### 6. Configuration SMTP (optionnel mais recommandé)

Pour un meilleur taux de délivrabilité, configurez un SMTP personnalisé :

Dans **Project Settings → Auth → SMTP Settings** :

- **Host** : smtp.votre-domaine.fr
- **Port** : 587 (TLS) ou 465 (SSL)
- **User** : no-reply@jurabreak.fr
- **Password** : [votre mot de passe SMTP]
- **Sender email** : no-reply@jurabreak.fr
- **Sender name** : JuraBreak Immobilier

> ⚠️ Sans SMTP personnalisé, Supabase utilise son propre serveur (limite : 3 emails/heure en développement).

### 7. Sécurité supplémentaire

Dans **Authentication → Settings** :

✅ **Enable phone confirmations** : NON
✅ **Enable manual linking** : NON
✅ **Disable email signups** : NON (mais limitez via la liste blanche dans le code)

### 8. Rate limiting

Dans **Authentication → Rate Limits** :

```
Email OTP requests: 10 per hour
Password recovery: 5 per hour
```

---

## 🧪 Test de la configuration

### Test manuel

1. Aller sur `https://jurabreakimmobilier.fr/admin/login`
2. Entrer un email autorisé (ex: `contact@jurabreak.fr`)
3. Vérifier la réception de l'email
4. Cliquer sur le lien
5. Vérifier l'accès au dashboard

### Test en développement

```bash
# Lancer le serveur local
npm run dev

# Ouvrir http://localhost:3000/admin/login
# Tester avec un email autorisé
```

---

## 📊 Monitoring

Dans Supabase Dashboard → **Authentication** :

- **Users** : voir tous les utilisateurs connectés
- **Policies** : gérer les permissions (RLS)
- **Logs** : consulter l'historique des connexions

---

## ⚠️ Dépannage

### Email non reçu
1. Vérifier les spams
2. Vérifier la configuration SMTP
3. Consulter les logs Supabase → Logs → Auth

### Erreur "Invalid redirect URL"
- Vérifier que l'URL est dans la liste blanche
- Vérifier la Site URL

### Erreur "Email rate limit exceeded"
- Attendre 1 heure
- Augmenter les limites dans les settings

---

## 🔄 Migration depuis un autre système

Si vous aviez un système de mots de passe :

1. Les utilisateurs devront utiliser le magic link
2. Pas besoin de migration de données
3. Les sessions existantes seront invalidées

---

## 📞 Support Supabase

- Documentation : https://supabase.com/docs/guides/auth
- Discord : https://discord.supabase.com
- Status : https://status.supabase.com
