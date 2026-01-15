# 🚀 Quick Start - JuraBreak Immobilier

Guide de démarrage rapide pour lancer le projet en 10 minutes.

## Prérequis

- [ ] Node.js 18+ installé
- [ ] Compte Supabase créé
- [ ] Compte Stripe créé (mode test OK)
- [ ] Git installé

## Étape 1 : Clone et Installation (2 min)

```bash
# Cloner le repo
git clone <repo-url>
cd jurabreakimmobilier

# Installer les dépendances
npm install
```

## Étape 2 : Configuration Supabase (4 min)

### A. Créer le projet Supabase
1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Attendre que le projet soit prêt

### B. Exécuter les migrations
1. Ouvrir le **SQL Editor** dans Supabase
2. Copier-coller et exécuter dans l'ordre :
   - `supabase/migrations/0001_init.sql` ✅
   - `supabase/migrations/0002_rls_policies.sql` ✅
   - `supabase/migrations/0003_triggers.sql` ✅

### C. Créer les buckets Storage
1. Aller dans **Storage**
2. Créer 3 buckets :
   - `annonces` (public ✅)
   - `public` (public ✅)
   - `estimations` (privé ❌)
3. Exécuter `supabase/migrations/0004_storage_buckets.sql`

### D. Créer un admin
1. Aller dans **Authentication** > **Users**
2. Créer un utilisateur (email + password)
3. Noter l'UUID
4. Dans **SQL Editor** :
```sql
INSERT INTO profiles (id, email, role)
VALUES ('VOTRE_UUID'::uuid, 'admin@jurabreak.fr', 'admin');
```

### E. Récupérer les clés
Dans **Settings** > **API** :
- URL : `https://xxxxx.supabase.co`
- Anon key : `eyJhbGc...`
- Service role key : `eyJhbGc...`

## Étape 3 : Configuration Stripe (2 min)

1. Aller sur https://stripe.com
2. Mode Test activé
3. Créer 2 produits :
   - Formule 1 : 49€ → Noter `price_xxxxx`
   - Formule 2 : 149€ → Noter `price_xxxxx`
4. Dans **Développeurs** > **Clés API** :
   - Noter `sk_test_xxxxx`

## Étape 4 : Configuration Locale (1 min)

**Le fichier `.env.local` est déjà créé à la racine du projet.**

1. Ouvrir `.env.local`
2. Remplir les variables avec vos vraies clés :

```bash
# Supabase - Trouver dans Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe - Trouver dans Stripe Dashboard → Developers → API Keys
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Généré à l'étape 5
STRIPE_PRICE_ID_FORMULE1=price_xxxxx
STRIPE_PRICE_ID_FORMULE2=price_xxxxx

# Email (optionnel - fonctionnalité TODO)
EMAIL_PROVIDER_API_KEY=

# Base URL (déjà configuré)
BASE_URL=http://localhost:3000
```

**⚠️ IMPORTANT** : `.env.local` est ignoré par Git. Vos clés ne seront jamais commitées.

**🔍 Vérifier la configuration** :
```bash
npm run env:check
```

## Étape 5 : Lancer (1 min)

```bash
# Terminal 1 : Next.js
npm run dev

# Terminal 2 : Stripe CLI (pour webhooks en local)
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Noter le webhook secret affiché et l'ajouter dans .env.local
```

Ouvrir : http://localhost:3000

## ✅ Vérification Rapide

### Test 1 : Site Public
- [ ] http://localhost:3000 se charge
- [ ] Pas d'erreur console
- [ ] Header et Footer visibles

### Test 2 : Admin
- [ ] Aller sur http://localhost:3000/admin/login
- [ ] Se connecter avec l'email/password créé
- [ ] Dashboard admin s'affiche

### Test 3 : Base de Données
Dans Supabase **SQL Editor** :
```sql
-- Doit retourner 8 lignes avec rls_enabled = true
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'agence_settings', 'annonces', 'annonce_photos', 'events', 'leads', 'analytics_events', 'estimations');
```

### Test 4 : Formulaire Contact
- [ ] Aller sur http://localhost:3000/contact
- [ ] Remplir et soumettre
- [ ] Vérifier dans Supabase Table Editor > leads : nouveau lead créé

### Test 5 : Estimation Gratuite
- [ ] Aller sur http://localhost:3000/estimation
- [ ] Choisir Formule 0
- [ ] Remplir et soumettre
- [ ] Vérifier dans Supabase > estimations : nouveau record créé

### Test 6 : Paiement Stripe
- [ ] Choisir Formule 1
- [ ] Remplir formulaire
- [ ] Redirection Stripe
- [ ] Utiliser carte test : `4242 4242 4242 4242`
- [ ] Valider
- [ ] Vérifier dans terminal Stripe CLI : événement reçu
- [ ] Vérifier dans Supabase : statut = PAID

## 🔧 Troubleshooting Rapide

### Erreur : "fetch failed" au chargement
➡️ Vérifier `NEXT_PUBLIC_SUPABASE_URL` dans `.env.local`

### Erreur : "Invalid API key"
➡️ Vérifier les clés Supabase (anon key, service role key)

### Admin ne peut pas se connecter
➡️ Vérifier que le profil existe avec `role = 'admin'` dans la table `profiles`

### Webhook Stripe ne fonctionne pas
➡️ Vérifier que `stripe listen` tourne dans un terminal séparé

### Erreur "permission denied" en DB
➡️ RLS mal configuré, ré-exécuter `0002_rls_policies.sql`

## 📚 Prochaines Étapes

Une fois le quick start validé :

1. Lire [ARCHITECTURE.md](docs/ARCHITECTURE.md) pour comprendre le projet
2. Suivre [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) pour config complète
3. Suivre [STRIPE_SETUP.md](docs/STRIPE_SETUP.md) pour config complète
4. Consulter [TODO.md](TODO.md) pour les points à finaliser
5. Valider avec [CHECKLIST.md](CHECKLIST.md)

## 🔐 Variables d'Environnement

### En Local (Développement)
- Fichier : `.env.local` (à la racine)
- ✅ Ignoré par Git
- ✅ Contient vos vraies clés de développement
- Vérifier : `npm run env:check`

### En Production (Vercel)
- Aller dans **Vercel Dashboard** → Settings → Environment Variables
- Configurer les mêmes variables que `.env.local`
- Documentation complète : [docs/SETUP_VERCEL_ENV.md](docs/SETUP_VERCEL_ENV.md)

**⚠️ IMPORTANT** : Ne jamais commiter `.env` ou `.env.local` dans Git !

## 🎯 C'est Prêt !

Vous devriez maintenant avoir :
- ✅ Site qui tourne sur localhost:3000
- ✅ Base de données Supabase configurée
- ✅ Admin fonctionnel
- ✅ Stripe en mode test
- ✅ Webhooks locaux actifs

**Temps total** : ~10 minutes

**Questions ?** Consulter [README.md](README.md) ou les guides dans `/docs/`
