# 🔐 Configuration des Variables d'Environnement pour Vercel

**Date** : 15 janvier 2026  
**Projet** : JuraBreak Immobilier

---

## 📋 Vue d'Ensemble

Ce projet nécessite **9 variables d'environnement** pour fonctionner correctement en production. Certaines sont publiques (accessibles côté client), d'autres sont strictement server-only (accès backend uniquement).

---

## 🔑 Liste des Variables Requises

### 1. Variables Publiques (NEXT_PUBLIC_*)

Ces variables sont **accessibles côté client** et donc visibles dans le code JavaScript du navigateur. Elles sont protégées par les politiques RLS de Supabase.

| Variable | Description | Exemple | Où la trouver |
|----------|-------------|---------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | `https://xyz.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase (anon) | `eyJhbGc...` | Supabase Dashboard → Settings → API → anon/public key |

**⚠️ Important** : Ces clés sont publiques mais sécurisées par RLS. Ne jamais y stocker de logique métier sensible.

---

### 2. Variables Server-Only (Privées)

Ces variables sont **strictement confidentielles** et ne doivent **JAMAIS** être préfixées `NEXT_PUBLIC_`. Elles sont uniquement accessibles dans les API Routes, Server Components, et Webhooks.

| Variable | Description | Exemple | Où la trouver |
|----------|-------------|---------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Clé admin Supabase (bypass RLS) | `eyJhbGc...` | Supabase Dashboard → Settings → API → service_role key |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_live_...` ou `sk_test_...` | Stripe Dashboard → Developers → API Keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature webhook | `whsec_...` | Stripe Dashboard → Webhooks → Endpoint → Signing secret |
| `STRIPE_PRICE_ID_FORMULE1` | ID du prix Formule 1 (49€) | `price_1ABC...` | Stripe Dashboard → Products → Formule Standard → Price ID |
| `STRIPE_PRICE_ID_FORMULE2` | ID du prix Formule 2 (149€) | `price_1XYZ...` | Stripe Dashboard → Products → Formule Premium → Price ID |
| `EMAIL_PROVIDER_API_KEY` | Clé API Resend/Sendgrid (TODO) | `re_...` | Resend Dashboard → API Keys |
| `BASE_URL` | URL du site en production | `https://jurabreak.fr` | URL de production Vercel |

---

## 🚀 Configuration dans Vercel

### Étape 1 : Accéder aux Variables d'Environnement

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet **jurabreakimmobilier**
3. Aller dans **Settings** → **Environment Variables**

### Étape 2 : Ajouter les Variables

Pour **chaque variable** listée ci-dessus :

1. Cliquer sur **Add New**
2. **Name** : Nom exact de la variable (ex: `SUPABASE_SERVICE_ROLE_KEY`)
3. **Value** : Coller la valeur depuis le dashboard correspondant
4. **Environments** : Sélectionner :
   - ✅ **Production** (obligatoire)
   - ✅ **Preview** (recommandé pour tester les PR)
   - ❌ **Development** (optionnel, utilisez `.env.local` en local)

### Étape 3 : Variables Sensibles (Secrets)

Vercel propose un système de **secrets** pour les valeurs réutilisables :

```bash
# Depuis le CLI Vercel
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Coller la valeur depuis Supabase
```

Ou via l'interface web, les variables ajoutées sont automatiquement traitées comme des secrets.

---

## 🛡️ Sécurité : Règles à Respecter

### ✅ À FAIRE

1. **Toujours** utiliser `.env.local` en développement (ignoré par Git)
2. **Toujours** configurer les variables server-only dans Vercel, jamais dans le code
3. **Toujours** vérifier `.gitignore` inclut `.env`, `.env.local`, `.env*.local`
4. **Toujours** utiliser `.env.example` avec des placeholders uniquement

### ❌ NE JAMAIS FAIRE

1. ❌ Commiter `.env` ou `.env.local` dans Git
2. ❌ Mettre des vraies clés dans `.env.example`
3. ❌ Utiliser `NEXT_PUBLIC_` pour une clé server-only (Stripe, Service Role)
4. ❌ Hardcoder des secrets dans le code source
5. ❌ Partager les clés de production sur Slack/Email

---

## 🧪 Vérification des Variables

### En Local (Développement)

Créer `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
# Éditer .env.local avec les vraies valeurs
```

Lancer le script de vérification :

```bash
npm run env:check
```

**Résultat attendu** :
```
✅ All required environment variables are set
  ✓ NEXT_PUBLIC_SUPABASE_URL
  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ✓ SUPABASE_SERVICE_ROLE_KEY
  ✓ STRIPE_SECRET_KEY
  ✓ STRIPE_WEBHOOK_SECRET
  ✓ STRIPE_PRICE_ID_FORMULE1
  ✓ STRIPE_PRICE_ID_FORMULE2
  ✓ BASE_URL
```

### En Production (Vercel)

Les variables sont vérifiées automatiquement au déploiement. Si une variable manque, le build **ne échouera pas** mais l'application ne fonctionnera pas correctement.

**Symptômes d'une variable manquante** :
- `SUPABASE_SERVICE_ROLE_KEY` → Erreur 500 lors du téléchargement PDF
- `STRIPE_SECRET_KEY` → Échec de création de session Stripe
- `STRIPE_WEBHOOK_SECRET` → Webhook signature invalide
- `BASE_URL` → Redirections Stripe cassées

---

## 📝 Checklist de Déploiement

Avant chaque déploiement en production :

- [ ] Toutes les 9 variables configurées dans Vercel (Production)
- [ ] `BASE_URL` pointe vers l'URL de production (ex: `https://jurabreak.fr`)
- [ ] Webhook Stripe configuré pour pointer vers `https://jurabreak.fr/api/webhooks/stripe`
- [ ] `STRIPE_WEBHOOK_SECRET` correspond au webhook de production
- [ ] Clés Stripe en mode **Live** (pas Test) pour la prod
- [ ] Vérifier que `.env.example` ne contient QUE des placeholders

---

## 🔄 Rotation des Secrets

Si une clé est compromise :

### Supabase Service Role Key

1. Supabase Dashboard → Settings → API
2. Cliquer sur **"Reset service_role key"**
3. Copier la nouvelle clé
4. Mettre à jour dans Vercel → Environment Variables
5. Redéployer le projet

### Stripe Secret Key

1. Stripe Dashboard → Developers → API Keys
2. Cliquer sur **"Roll key"** sur la Secret key
3. Copier la nouvelle clé
4. Mettre à jour dans Vercel
5. Redéployer

### Webhook Secret

1. Stripe Dashboard → Webhooks
2. Supprimer l'ancien endpoint
3. Créer un nouveau endpoint avec l'URL de production
4. Copier le nouveau signing secret
5. Mettre à jour `STRIPE_WEBHOOK_SECRET` dans Vercel
6. Redéployer

---

## 🆘 Dépannage

### Erreur : "Missing environment variable SUPABASE_SERVICE_ROLE_KEY"

**Cause** : Variable non configurée dans Vercel  
**Solution** : Ajouter la variable dans Vercel → Settings → Environment Variables → Production

### Erreur : "Webhook signature verification failed"

**Cause** : `STRIPE_WEBHOOK_SECRET` incorrect ou manquant  
**Solution** :
1. Vérifier que le webhook Stripe pointe vers l'URL correcte
2. Copier le **Signing secret** depuis Stripe Dashboard
3. Vérifier qu'il correspond à `STRIPE_WEBHOOK_SECRET` dans Vercel

### Erreur : "Failed to fetch settings" sur la homepage

**Cause** : `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` incorrect  
**Solution** :
1. Vérifier les valeurs dans Supabase Dashboard → Settings → API
2. Mettre à jour dans Vercel (avec `NEXT_PUBLIC_` prefix)
3. Redéployer

---

## 📚 Ressources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase API Settings](https://supabase.com/dashboard/project/_/settings/api)
- [Stripe API Keys](https://dashboard.stripe.com/apikeys)
- [Stripe Webhooks](https://dashboard.stripe.com/webhooks)

---

## ✅ Validation Finale

Une fois toutes les variables configurées :

1. Déployer sur Vercel : `git push` (auto-deploy)
2. Tester la homepage : `https://jurabreak.fr` → Doit afficher le site
3. Tester l'estimation Formule 0 : Doit calculer une fourchette
4. Tester le paiement Formule 1 : Doit rediriger vers Stripe
5. Tester le webhook : Compléter un paiement test → PDF doit être généré
6. Tester le téléchargement PDF : Lien doit fonctionner avec le token

**Si tous ces tests passent, la configuration est correcte et sécurisée.** ✅
