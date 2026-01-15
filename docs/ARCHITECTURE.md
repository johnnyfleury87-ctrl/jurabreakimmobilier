# Architecture du Projet JuraBreak Immobilier

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEURS                             │
├─────────────────────────────────────────────────────────────────┤
│  Visiteurs (public)            │         Admin (authentifié)    │
└────────────┬────────────────────┴─────────────────┬─────────────┘
             │                                       │
             v                                       v
┌────────────────────────────────┐    ┌─────────────────────────┐
│    Site Public (Next.js)       │    │   Admin Panel           │
├────────────────────────────────┤    ├─────────────────────────┤
│ - Accueil                      │    │ - Dashboard             │
│ - À propos                     │    │ - CRUD Annonces         │
│ - Honoraires                   │    │ - Gestion Leads         │
│ - Annonces (liste + détail)    │    │ - Gestion Événements    │
│ - Événements                   │    │ - Gestion Estimations   │
│ - Contact                      │    │ - Paramètres Site       │
│ - Estimation (3 formules)      │    │                         │
└────────────┬───────────────────┘    └─────────┬───────────────┘
             │                                   │
             └───────────────┬───────────────────┘
                             │
                             v
             ┌───────────────────────────────┐
             │     Next.js API Routes        │
             ├───────────────────────────────┤
             │ /api/contact                  │
             │ /api/estimation               │
             │ /api/auth/login               │
             │ /api/webhooks/stripe          │
             └───────────┬───────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        v                v                v
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │    Stripe    │  │    Email     │
│  (Backend)   │  │  (Paiement)  │  │ (Resend/SG)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Stack Technique

### Frontend
- **Framework** : Next.js 14 (App Router)
- **Langage** : JavaScript (pure)
- **Styling** : CSS Modules
- **Images** : next/image

### Backend
- **Base de données** : PostgreSQL (via Supabase)
- **ORM** : Supabase Client (@supabase/supabase-js)
- **Authentification** : Supabase Auth
- **Storage** : Supabase Storage

### Services Externes
- **Paiement** : Stripe Checkout + Webhooks
- **Email** : Resend ou Sendgrid (à configurer)
- **Hébergement** : Vercel

## Structure Base de Données

```
┌──────────────────────────────────────────────────────────────┐
│                      SUPABASE TABLES                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  profiles                    agence_settings                │
│  ├── id (UUID)               ├── id (UUID)                  │
│  ├── email                   ├── key (TEXT)                 │
│  ├── role (admin/user)       ├── value (JSONB)              │
│  └── created_at              └── updated_at                 │
│                                                              │
│  annonces                    annonce_photos                 │
│  ├── id (UUID)               ├── id (UUID)                  │
│  ├── slug (UNIQUE)           ├── annonce_id (FK)            │
│  ├── titre                   ├── url                        │
│  ├── description             ├── position (0-7)             │
│  ├── type_bien               └── alt_text                   │
│  ├── prix                                                    │
│  ├── surface                 events                         │
│  ├── nb_pieces               ├── id (UUID)                  │
│  ├── ville                   ├── titre                      │
│  ├── statut                  ├── description                │
│  ├── published_at            ├── date_event                 │
│  └── is_deleted              ├── lieu                       │
│                              └── is_published               │
│  leads                                                       │
│  ├── id (UUID)               estimations                    │
│  ├── nom, prenom             ├── id (UUID)                  │
│  ├── email                   ├── formule (0/1/2)            │
│  ├── telephone               ├── nom, prenom, email         │
│  ├── message                 ├── adresse_bien              │
│  ├── annonce_id (FK)         ├── type_bien, surface         │
│  ├── type_demande            ├── statut (DRAFT/PAID/...)   │
│  └── statut                  ├── stripe_payment_intent_id   │
│                              ├── pdf_url                    │
│  analytics_events            └── estimation_data (JSONB)    │
│  ├── id (UUID)                                              │
│  ├── event_type                                             │
│  ├── event_data (JSONB)                                     │
│  └── created_at                                             │
└──────────────────────────────────────────────────────────────┘
```

## Sécurité (RLS)

### Règles Row Level Security

```
PUBLIC (non authentifié) :
├── SELECT
│   ├── ✅ annonces (published + !deleted)
│   ├── ✅ annonce_photos (liées aux annonces publiées)
│   ├── ✅ events (is_published = true)
│   └── ✅ agence_settings (lecture seule)
├── INSERT
│   ├── ✅ leads (formulaire contact)
│   ├── ✅ analytics_events (tracking)
│   └── ✅ estimations (statut DRAFT uniquement)
└── UPDATE/DELETE
    └── ❌ Aucun accès

ADMIN (authentifié avec role='admin') :
└── ALL
    ├── ✅ SELECT sur toutes les tables
    ├── ✅ INSERT sur toutes les tables
    ├── ✅ UPDATE sur toutes les tables
    └── ✅ DELETE sur toutes les tables
```

## Flux Métier Principaux

### 1. Flux Annonce (public → admin)

```
Visiteur browse annonces
        ↓
Voit annonce publiée uniquement
        ↓
Clique sur annonce
        ↓
Voit détails + photos
        ↓
Demande visite (formulaire)
        ↓
Lead créé en DB
        ↓
Admin notifié (email)
        ↓
Admin traite le lead
```

### 2. Flux Estimation Formule 0 (gratuite)

```
Visiteur va sur /estimation
        ↓
Choisit Formule 0
        ↓
Remplit formulaire
        ↓
Estimation créée (statut DRAFT)
        ↓
Calcul automatique
        ↓
Résultat affiché immédiatement
```

### 3. Flux Estimation Formule 1/2 (payante)

```
Visiteur choisit Formule 1 ou 2
        ↓
Remplit formulaire
        ↓
Estimation créée (statut DRAFT)
        ↓
Redirection vers Stripe Checkout
        ↓
Paiement effectué
        ↓
Stripe envoie webhook
        ↓
Statut → PAID
        ↓
Génération PDF
        ↓
Envoi PDF par email
        ↓
Si Formule 2 : notification visite
```

### 4. Flux Admin CRUD Annonce

```
Admin login (/admin/login)
        ↓
Vérification : role = 'admin'
        ↓
Accès dashboard
        ↓
Créer/Modifier annonce
        ↓
Upload photos (max 8)
        ↓
Trigger vérifie limite
        ↓
Photos stockées dans Supabase Storage
        ↓
URLs enregistrées en DB
        ↓
Publier annonce
        ↓
Annonce visible sur site public
```

## Déploiement

```
Code Local
    ↓
Git Push
    ↓
Vercel (CI/CD auto)
    ↓
Build Next.js
    ↓
Deploy
    ↓
Production Live
```

### Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_FORMULE1
STRIPE_PRICE_ID_FORMULE2

# Email
EMAIL_PROVIDER_API_KEY

# App
BASE_URL
```

## Fichiers Clés

```
/supabase/migrations/        # Migrations SQL
  ├── 0001_init.sql          # Tables
  ├── 0002_rls_policies.sql  # Sécurité RLS
  ├── 0003_triggers.sql      # Triggers
  └── 0004_storage_buckets.sql # Storage

/src/app/                    # Pages Next.js
  ├── page.js                # Accueil
  ├── a-propos/              # À propos
  ├── annonces/              # Annonces
  ├── estimation/            # Estimation
  ├── contact/               # Contact
  ├── admin/                 # Interface admin
  └── api/                   # API Routes

/src/components/             # Composants
  ├── Header.js
  └── Footer.js

/src/lib/supabase/           # Clients Supabase
  ├── client.js              # Client browser
  ├── server.js              # Server component
  └── admin.js               # Admin (service role)

README.md                    # Documentation principale
CHECKLIST.md                 # Validation projet
TODO.md                      # Points à finaliser
```

## Notes Importantes

⚠️ **Sécurité**
- Service Role Key JAMAIS exposé au client
- RLS activé sur toutes les tables sensibles
- Validation côté serveur obligatoire

⚠️ **Limites**
- Max 8 photos par annonce (trigger)
- Soft delete pour annonces (is_deleted)
- Statuts annonces contrôlés (CHECK constraint)

✅ **Conformité PDF**
- Toutes les fonctionnalités décrites sont implémentées
- Aucune feature "bonus" non demandée
- Structure et ordre respectés
