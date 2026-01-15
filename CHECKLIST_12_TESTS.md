# 🧪 CHECKLIST 12 TESTS - VALIDATION FINALE
## JuraBreak Immobilier - Prêt pour Déploiement

**Date** : 15 janvier 2026  
**Statut** : Tous les points critiques résolus + Sécurité renforcée

---

## 📋 PRÉREQUIS AVANT TESTS

### 1. Exécuter les Migrations Supabase (0001 à 0006)

```bash
# Dans le dashboard Supabase SQL Editor
# Exécuter dans l'ordre :
1. supabase/migrations/0001_init.sql
2. supabase/migrations/0002_rls_policies.sql
3. supabase/migrations/0003_triggers.sql
4. supabase/migrations/0004_storage_buckets.sql
5. supabase/migrations/0005_add_terms_acceptance.sql
6. supabase/migrations/0006_add_download_token.sql ✨ NOUVEAU
```

### 2. Créer un Utilisateur Admin

```sql
-- Créer l'admin dans auth.users puis dans profiles
-- Voir scripts/seed_admin.sql
```

### 3. Configurer Variables d'Environnement

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PRICE_ID_FORMULE1=price_...
STRIPE_PRICE_ID_FORMULE2=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=http://localhost:3000
```

### 4. Configurer Webhook Stripe

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copier le webhook secret dans .env.local
```

---

## 🔴 TESTS PUBLICS (Non Authentifié)

### TEST 1 : Homepage Dynamique ✅

**Objectif** : Vérifier que les textes ne sont PAS hardcodés

**Étapes** :
1. Accéder à `http://localhost:3000`
2. Dans Supabase, modifier `agence_settings.home_hero_title`
3. Rafraîchir la page

**Résultat attendu** :
- ✅ Le titre change dynamiquement
- ✅ Aucun texte hardcodé visible

**Preuve** : [src/app/page.js](src/app/page.js) fetch depuis `agence_settings`

---

### TEST 2 : Formule 0 (Gratuite) - Calcul Automatique ✅

**Objectif** : Estimation gratuite sans paiement

**Étapes** :
1. Aller sur `/estimation`
2. Choisir "Formule 0 - Gratuite"
3. Remplir le formulaire (surface: 100 m²)
4. Soumettre

**Résultat attendu** :
- ✅ Redirection vers `/estimation/resultat/{id}`
- ✅ Fourchette de prix affichée (calcul automatique)
- ✅ Pas de PDF (normal pour formule gratuite)
- ✅ Disclaimer : "purement indicative, aucune valeur juridique"

**Preuve** : [src/app/api/estimation/route.js](src/app/api/estimation/route.js) lignes 63-75

---

### TEST 3 : Formule 1 - Checkbox CGV Requise ✅

**Objectif** : Vérifier que CGV est obligatoire

**Étapes** :
1. Aller sur `/estimation`
2. Choisir "Formule 1 - Standard (49€)"
3. Remplir le formulaire
4. **NE PAS cocher** la checkbox CGV
5. Soumettre

**Résultat attendu** :
- ✅ Erreur : "Vous devez accepter les conditions générales de vente"
- ✅ Soumission bloquée

**Preuve** : [src/app/estimation/page.js](src/app/estimation/page.js) lignes 85-90

---

### TEST 4 : Formule 2 - CGV + Timestamp en DB ✅

**Objectif** : Vérifier que `terms_accepted_at` est enregistré

**Étapes** :
1. Choisir "Formule 2 - Premium (149€)"
2. Remplir le formulaire
3. **Cocher** la checkbox CGV
4. Soumettre (ne pas payer, juste créer le DRAFT)
5. Aller dans Supabase : `SELECT terms_accepted_at FROM estimations WHERE formule = 'formule_2' ORDER BY created_at DESC LIMIT 1;`

**Résultat attendu** :
- ✅ `terms_accepted_at` contient un timestamp (pas NULL)
- ✅ Redirection vers Stripe Checkout

**Preuve** : [src/app/api/estimation/route.js](src/app/api/estimation/route.js) lignes 38-40

---

### TEST 5 : Public ne peut PAS lire les leads ✅

**Objectif** : Vérifier RLS sur table `leads`

**Query SQL** (devrait échouer) :
```sql
SET ROLE anon;
SELECT * FROM leads;
```

**Résultat attendu** :
- ✅ `ERROR: permission denied for table leads`

**Preuve** : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) ligne 63

---

### TEST 6 : Public ne peut PAS lire les estimations ✅

**Objectif** : Vérifier RLS sur table `estimations`

**Query SQL** (devrait échouer) :
```sql
SET ROLE anon;
SELECT * FROM estimations;
```

**Résultat attendu** :
- ✅ `ERROR: permission denied for table estimations`

**Preuve** : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) ligne 89

---

### TEST 7 : Public ne peut PAS créer estimation PAID ✅

**Objectif** : Vérifier qu'on ne peut pas contourner le paiement

**Query SQL** (devrait échouer) :
```sql
SET ROLE anon;
INSERT INTO estimations (formule, nom, prenom, email, adresse_bien, type_bien, surface, statut, prix_paye)
VALUES ('formule_1', 'Hacker', 'Evil', 'hack@example.com', '1 Rue Test', 'maison', 100.00, 'PAID', 49.00);
```

**Résultat attendu** :
- ✅ `ERROR: new row violates row-level security policy`

**Raison** : Policy exige `statut = 'DRAFT' AND prix_paye IS NULL`

**Preuve** : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) lignes 222-225

---

## 🟢 TESTS ADMIN (Authentifié avec role='admin')

### TEST 8 : Admin peut lire les leads ✅

**Objectif** : Vérifier accès admin aux données sensibles

**Étapes** :
1. Se connecter avec le compte admin
2. Aller sur `/admin/leads` (si page existe)
3. OU dans Supabase SQL Editor connecté en tant qu'admin

**Query SQL** (devrait réussir) :
```sql
-- En tant qu'utilisateur authentifié avec role='admin'
SELECT * FROM leads;
```

**Résultat attendu** :
- ✅ Liste des leads visible

**Preuve** : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) ligne 63

---

### TEST 9 : Admin peut lire les estimations ✅

**Query SQL** (devrait réussir) :
```sql
SELECT id, formule, nom, email, statut, prix_paye, download_token FROM estimations;
```

**Résultat attendu** :
- ✅ Liste des estimations visible avec tous les champs

**Preuve** : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) ligne 89

---

## 💳 TESTS STRIPE (Paiement)

### TEST 10 : Paiement Formule 1 - Génération PDF ✅

**Objectif** : Vérifier le parcours complet avec paiement

**Étapes** :
1. Créer une estimation Formule 1 (49€)
2. Cocher CGV, soumettre
3. Sur Stripe Checkout, utiliser carte test : `4242 4242 4242 4242`, expiration future, CVC 123
4. Valider le paiement
5. Attendre le webhook (vérifier terminal Stripe CLI)
6. Aller dans Supabase : `SELECT statut, pdf_path, download_token FROM estimations WHERE id = '...'`

**Résultat attendu** :
- ✅ `statut` = `'PAID'`
- ✅ `pdf_path` = `'estimation_UUID_timestamp.pdf'` (non NULL)
- ✅ `download_token` = UUID (non NULL) ✨ **NOUVEAU**
- ✅ Fichier existe dans Storage bucket `estimations`

**Preuve** : [src/app/api/webhooks/stripe/route.js](src/app/api/webhooks/stripe/route.js) lignes 38-92

---

### TEST 11 : Idempotence Webhook - Pas de Doublon PDF ✅

**Objectif** : Vérifier qu'un webhook reçu 2 fois ne génère pas 2 PDF

**Étapes** :
1. Reprendre l'estimation du TEST 10 (déjà payée)
2. Dans Stripe CLI, simuler un retry webhook :
   ```bash
   stripe trigger checkout.session.completed --override checkout_session:metadata:estimation_id=UUID_ICI
   ```
3. Vérifier les logs du serveur Next.js

**Résultat attendu** :
- ✅ Log : `"PDF already exists for estimation UUID, skipping generation"`
- ✅ Pas de nouveau fichier dans Storage
- ✅ `pdf_path` inchangé en DB

**Preuve** : [src/app/api/webhooks/stripe/route.js](src/app/api/webhooks/stripe/route.js) lignes 61-68

---

## 📄 TESTS PDF (Téléchargement Sécurisé)

### TEST 12 : Téléchargement PDF avec Token Valide ✅ ✨

**Objectif** : Vérifier que le token est requis et valide

**Étapes** :
1. Récupérer une estimation PAID avec `pdf_path` et `download_token` :
   ```sql
   SELECT id, download_token FROM estimations WHERE statut = 'PAID' AND pdf_path IS NOT NULL LIMIT 1;
   ```
2. Accéder à l'URL : `http://localhost:3000/api/estimation/{id}/download?token={download_token}`

**Résultat attendu** :
- ✅ Redirection vers URL signée Supabase (valide 5 minutes)
- ✅ PDF téléchargé avec succès
- ✅ PDF contient :
  - En-tête "JuraBreak Immobilier"
  - Informations client et bien
  - Fourchette de prix
  - Mentions légales (2 pages)
  - Footer avec coordonnées

**Preuve** : [src/app/api/estimation/[id]/download/route.js](src/app/api/estimation/[id]/download/route.js) lignes 27-36

---

### TEST 13 : Téléchargement PDF SANS Token → 400 ✅ ✨

**Objectif** : Vérifier que le token est obligatoire

**Étapes** :
1. Accéder à l'URL **sans token** : `http://localhost:3000/api/estimation/{id}/download`

**Résultat attendu** :
- ✅ Status `400 Bad Request`
- ✅ Erreur : `"Token de téléchargement manquant"`

**Preuve** : [src/app/api/estimation/[id]/download/route.js](src/app/api/estimation/[id]/download/route.js) lignes 10-15

---

### TEST 14 : Téléchargement PDF avec Token INVALIDE → 403 ✅ ✨

**Objectif** : Vérifier que le token est vérifié

**Étapes** :
1. Accéder à l'URL avec un **faux token** : `http://localhost:3000/api/estimation/{id}/download?token=00000000-0000-0000-0000-000000000000`

**Résultat attendu** :
- ✅ Status `403 Forbidden`
- ✅ Erreur : `"Token de téléchargement invalide"`
- ✅ Pas de leak d'information (pas de détail sur pourquoi c'est invalide)

**Preuve** : [src/app/api/estimation/[id]/download/route.js](src/app/api/estimation/[id]/download/route.js) lignes 29-34

---

### TEST 15 : Accès Direct Storage → 403 ✅

**Objectif** : Vérifier que le bucket est privé

**Étapes** :
1. Récupérer un `pdf_path` depuis la DB
2. Tenter d'accéder directement : `https://[PROJECT_ID].supabase.co/storage/v1/object/public/estimations/{pdf_path}`

**Résultat attendu** :
- ✅ `403 Forbidden` ou `404 Not Found`
- ✅ Pas de téléchargement possible

**Preuve** : [supabase/migrations/0004_storage_buckets.sql](supabase/migrations/0004_storage_buckets.sql) ligne 3 (`public = false`)

---

## 📊 RÉCAPITULATIF DES 15 TESTS

| # | Catégorie | Test | Statut Attendu | Preuve |
|---|-----------|------|----------------|--------|
| 1 | Public | Homepage dynamique | ✅ Textes depuis DB | `page.js` |
| 2 | Public | Formule 0 gratuite | ✅ Calcul auto immédiat | `estimation/route.js` |
| 3 | Public | CGV requise F1 | ✅ Soumission bloquée si non coché | `estimation/page.js` |
| 4 | Public | CGV + timestamp F2 | ✅ `terms_accepted_at` en DB | `estimation/route.js` |
| 5 | Public | RLS leads | ✅ Permission denied | `0002_rls_policies.sql` |
| 6 | Public | RLS estimations | ✅ Permission denied | `0002_rls_policies.sql` |
| 7 | Public | Bypass paiement | ✅ Policy violation | `0002_rls_policies.sql` |
| 8 | Admin | Lire leads | ✅ Accès autorisé | `0002_rls_policies.sql` |
| 9 | Admin | Lire estimations | ✅ Accès autorisé | `0002_rls_policies.sql` |
| 10 | Stripe | Paiement + PDF | ✅ Statut PAID + pdf_path + token | `webhooks/stripe/route.js` |
| 11 | Stripe | Idempotence webhook | ✅ Pas de doublon | `webhooks/stripe/route.js` |
| 12 | PDF | Download avec token | ✅ PDF téléchargé | `[id]/download/route.js` |
| 13 | PDF | Download sans token | ✅ 400 Bad Request | `[id]/download/route.js` |
| 14 | PDF | Download token invalide | ✅ 403 Forbidden | `[id]/download/route.js` |
| 15 | PDF | Accès direct Storage | ✅ 403 Forbidden | `0004_storage_buckets.sql` |

---

## ✅ VALIDATION FINALE

**Si les 15 tests passent** :
- ✅ Homepage dynamique opérationnelle
- ✅ 3 formules d'estimation fonctionnelles
- ✅ CGV obligatoires avec timestamp
- ✅ RLS stricte sur tables sensibles
- ✅ Paiement Stripe + génération PDF
- ✅ Idempotence webhook garantie
- ✅ **Sécurité PDF renforcée par token unique** ✨
- ✅ Bucket Storage privé

**Le projet est prêt pour déploiement en production.**

---

## 🚀 PROCHAINES ÉTAPES APRÈS VALIDATION

1. **Déployer sur Vercel**
   ```bash
   vercel --prod
   ```

2. **Configurer webhook Stripe production**
   ```bash
   stripe webhooks create \
     --url https://jurabreak.fr/api/webhooks/stripe \
     --events checkout.session.completed
   ```

3. **Tester en production** (répéter tests 1-15)

4. **Monitoring**
   - Logs Vercel
   - Dashboard Stripe
   - Dashboard Supabase (RLS violations, Storage usage)

5. **Email (TODO)** : Envoyer lien PDF par email après paiement
   - Implémenter Resend ou Sendgrid
   - Template email avec lien + token

**🎯 OBJECTIF : 15/15 tests passent avant déploiement.**
