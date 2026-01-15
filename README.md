# JuraBreak Immobilier

Site web pour l'agence immobilière JuraBreak avec interface publique, panneau d'administration et système d'estimation.

## Stack Technique

- **Framework**: Next.js 14 (App Router) en JavaScript
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Paiement**: Stripe
- **Déploiement**: Vercel

## Fonctionnalités

### Site Public
- Page d'accueil
- À propos (photo + biographie Lolita)
- Honoraires
- Annonces immobilières (liste et détails)
- Événements
- Contact (formulaire)
- Système d'estimation en 3 formules :
  - **Formule 0** : Gratuite / Indicative
  - **Formule 1** : Payante (49€) / PDF détaillé
  - **Formule 2** : Payante (149€) / Juridiquement viable / Visite sur place

### Interface Admin
- Dashboard avec statistiques
- Gestion des annonces (CRUD)
  - Max 8 photos par annonce
  - Statuts : EN_VENTE, SOUS_OFFRE, COMPROMIS, VENDU, RETIRE
  - Gestion des commissions
- Gestion des leads (demandes de contact/visite)
- Gestion des événements
- Gestion des estimations
- Paramètres du site (contenu dynamique)

## Installation

### 1. Prérequis

- Node.js 18+
- Un compte Supabase
- Un compte Stripe
- Un compte Vercel (pour le déploiement)

### 2. Configuration Supabase

1. Créer un nouveau projet sur [Supabase](https://supabase.com)

2. Exécuter les migrations SQL dans l'ordre :

```bash
# Dans le dashboard Supabase > SQL Editor
# Exécuter dans l'ordre :
- supabase/migrations/0001_init.sql
- supabase/migrations/0002_rls_policies.sql
- supabase/migrations/0003_triggers.sql
- supabase/migrations/0004_storage_buckets.sql
```

3. Créer les buckets Storage (si pas créés automatiquement) :
   - `annonces` (public)
   - `public` (public)
   - `estimations` (privé)

4. Créer un utilisateur admin :

```sql
-- Dans Supabase Auth, créer un utilisateur avec email/mot de passe
-- Puis exécuter (remplacer USER_UUID par l'UUID réel) :
INSERT INTO profiles (id, email, role)
VALUES ('USER_UUID'::uuid, 'admin@jurabreak.fr', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 3. Configuration Stripe

1. Créer un compte sur [Stripe](https://stripe.com)

2. Créer 2 produits avec prix :
   - Formule 1 : 49€
   - Formule 2 : 149€

3. Noter les Price IDs (commencent par `price_...`)

4. Configurer le webhook :
   - URL : `https://votre-domaine.com/api/webhooks/stripe`
   - Événements : `checkout.session.completed`
   - Noter le signing secret (commence par `whsec_...`)

### 4. Installation Locale

```bash
# Cloner le repo
git clone <repo-url>
cd jurabreakimmobilier

# Installer les dépendances
npm install

# Copier .env.example vers .env.local et remplir les variables
cp .env.example .env.local

# Éditer .env.local avec vos vraies clés (voir docs/SETUP_VERCEL_ENV.md)

# Vérifier la configuration
npm run env:check

# Lancer en développement
npm run dev
```

Le site est accessible sur `http://localhost:3000`

**⚠️ SÉCURITÉ** : Ne jamais commiter `.env` ou `.env.local` - Ces fichiers sont dans `.gitignore`

### 5. Configuration des Variables d'Environnement

Voir la documentation complète : **[docs/SETUP_VERCEL_ENV.md](docs/SETUP_VERCEL_ENV.md)**

**Variables requises** :
- `NEXT_PUBLIC_SUPABASE_URL` - URL du projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé publique Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ Clé admin (server-only)
- `STRIPE_SECRET_KEY` - ⚠️ Clé secrète Stripe (server-only)
- `STRIPE_WEBHOOK_SECRET` - ⚠️ Secret webhook Stripe
- `STRIPE_PRICE_ID_FORMULE1` - Price ID Formule Standard (49€)
- `STRIPE_PRICE_ID_FORMULE2` - Price ID Formule Premium (149€)
- `BASE_URL` - URL du site (`http://localhost:3000` en dev)

**Variables optionnelles** :
- `EMAIL_PROVIDER_API_KEY` - Clé API Resend/Sendgrid (TODO)

### 6. Vérifications

Exécuter les vérifications SQL :

```bash
# Dans Supabase SQL Editor
# Exécuter : scripts/verify_rls.sql
```

Vérifier que :
- ✅ RLS activé sur toutes les tables sensibles
- ✅ Policies créées pour chaque table
- ✅ Fonction `is_admin()` existe
- ✅ Storage buckets créés

## Déploiement Vercel

### Configuration Complète

Voir la documentation détaillée : **[docs/SETUP_VERCEL_ENV.md](docs/SETUP_VERCEL_ENV.md)**

### Étapes Rapides

1. **Connecter le repo à Vercel**
   - Importer le projet depuis GitHub
   - Framework Preset : Next.js
   - Root Directory : `./`

2. **Configurer les variables d'environnement**
   - Aller dans Settings → Environment Variables
   - Ajouter les 8 variables requises (voir docs/SETUP_VERCEL_ENV.md)
   - Sélectionner **Production** et **Preview**

3. **Déployer**
   - Push sur `main` → Auto-deploy
   - Ou cliquer "Deploy" dans Vercel Dashboard

4. **Configurer le webhook Stripe**
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
   - Événements : `checkout.session.completed`
   - Copier le Signing Secret → Mettre à jour `STRIPE_WEBHOOK_SECRET` dans Vercel

5. **Mettre à jour BASE_URL**
   - Vercel → Environment Variables
   - `BASE_URL` = `https://votre-domaine.vercel.app`
   - Redéployer

### Sécurité

- ✅ `.env.example` ne contient QUE des placeholders
- ✅ `.env` et `.env.local` sont dans `.gitignore`
- ✅ Variables server-only configurées dans Vercel (jamais dans le code)
- ✅ Vérification avec `npm run env:check`

## Structure du Projet

```
/supabase
  /migrations          # Migrations SQL
/scripts               # Scripts utilitaires
/src
  /app                 # Pages Next.js App Router
    /admin             # Interface admin
    /api               # API routes
    /annonces          # Pages annonces
    /estimation        # Système estimation
  /components          # Composants réutilisables
  /lib
    /supabase          # Clients Supabase
  /server              # Helpers serveur
```

## Sécurité

- ✅ RLS (Row Level Security) activé sur toutes les tables
- ✅ Policies strictes (public read limité, admin full access)
- ✅ Validation des données côté serveur
- ✅ Service Role Key utilisé uniquement côté serveur
- ✅ Stripe webhook sécurisé par signature

## Support

Pour toute question : contact@jurabreak.fr

## Licence

Propriétaire - JuraBreak Immobilier