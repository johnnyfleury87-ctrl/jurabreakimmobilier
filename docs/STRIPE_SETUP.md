# Guide de Configuration Stripe

## Étape 1 : Créer un compte Stripe

1. Aller sur [https://stripe.com](https://stripe.com)
2. Créer un compte
3. Activer le mode Test au début

## Étape 2 : Créer les produits

### Produit 1 : Estimation Formule 1

1. Dans le dashboard Stripe, aller dans **Produits**
2. Cliquer sur "Ajouter un produit"
3. Remplir :
   - Nom : `Estimation Formule 1 - Standard`
   - Description : `Estimation détaillée avec rapport PDF`
4. Créer un prix :
   - Type : Paiement unique
   - Prix : `49,00 EUR`
5. Sauvegarder
6. **Noter le Price ID** (commence par `price_...`)

### Produit 2 : Estimation Formule 2

1. Cliquer sur "Ajouter un produit"
2. Remplir :
   - Nom : `Estimation Formule 2 - Premium`
   - Description : `Estimation juridiquement viable avec visite sur place`
3. Créer un prix :
   - Type : Paiement unique
   - Prix : `149,00 EUR`
4. Sauvegarder
5. **Noter le Price ID** (commence par `price_...`)

## Étape 3 : Récupérer les clés API

### Clés de Test (développement)

1. Aller dans **Développeurs** > **Clés API**
2. Noter :
   - **Clé publiable** : `pk_test_...` (pas utilisée côté serveur dans ce projet)
   - **Clé secrète** : `sk_test_...` ⚠️ À garder confidentielle

### Clés de Production (quand prêt)

1. Désactiver le mode Test
2. Noter les nouvelles clés :
   - `pk_live_...`
   - `sk_live_...`

## Étape 4 : Configurer le Webhook

### En développement local (Stripe CLI)

1. Installer Stripe CLI : [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/vX.X.X/stripe_X.X.X_linux_x86_64.tar.gz
tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

2. Se connecter :
```bash
stripe login
```

3. Rediriger les webhooks vers votre serveur local :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Noter le **webhook signing secret** affiché : `whsec_...`

### En production (Vercel)

1. Dans le dashboard Stripe, aller dans **Développeurs** > **Webhooks**
2. Cliquer sur "Ajouter un endpoint"
3. Remplir :
   - URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
   - Description : `Webhook production JuraBreak`
4. Sélectionner les événements à écouter :
   - ✅ `checkout.session.completed`
5. Créer l'endpoint
6. **Noter le signing secret** : `whsec_...`

## Étape 5 : Configurer les variables d'environnement

### Dans `.env.local` (développement)

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_ID_FORMULE1=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_FORMULE2=price_xxxxxxxxxxxxx
BASE_URL=http://localhost:3000
```

### Dans Vercel (production)

1. Aller dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajouter :
   - `STRIPE_SECRET_KEY` = `sk_live_...` (ou `sk_test_...` pour tester)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (le secret du webhook production)
   - `STRIPE_PRICE_ID_FORMULE1` = `price_...`
   - `STRIPE_PRICE_ID_FORMULE2` = `price_...`
   - `BASE_URL` = `https://votre-domaine.vercel.app`

## Étape 6 : Tester le flux de paiement

### Test en mode Test

1. Lancer le serveur local :
```bash
npm run dev
```

2. Dans un autre terminal, lancer le Stripe CLI :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Aller sur `http://localhost:3000/estimation`

4. Choisir Formule 1 ou 2

5. Remplir le formulaire

6. Utiliser les **cartes de test Stripe** :
   - Succès : `4242 4242 4242 4242`
   - Date : N'importe quelle date future
   - CVC : N'importe quel 3 chiffres
   - Nom : N'importe quoi

7. Valider le paiement

8. Vérifier :
   - ✅ Redirection vers page de succès
   - ✅ Dans le terminal Stripe CLI : événement `checkout.session.completed` reçu
   - ✅ Dans Supabase : l'estimation a le statut `PAID`
   - ✅ Le `stripe_payment_intent_id` est enregistré

### Vérifier dans Supabase

```sql
SELECT id, formule, statut, stripe_payment_intent_id, prix_paye, created_at
FROM estimations
ORDER BY created_at DESC
LIMIT 5;
```

Vous devriez voir l'estimation avec `statut = 'PAID'`.

## Étape 7 : Dashboard Stripe

Dans le dashboard Stripe, vérifier :

1. **Paiements** : Le paiement test apparaît
2. **Événements** : L'événement `checkout.session.completed` a été envoyé
3. **Webhooks** : Le webhook a bien reçu l'événement (status 200)

## Troubleshooting

### Erreur : "No such price"
➡️ Le Price ID dans `.env` est incorrect. Vérifier dans le dashboard Stripe.

### Erreur : "Invalid webhook signature"
➡️ Le `STRIPE_WEBHOOK_SECRET` ne correspond pas. Vérifier qu'il correspond au webhook configuré.

### Le webhook n'est pas appelé
➡️ En local, vérifier que `stripe listen` tourne. En production, vérifier l'URL du webhook.

### Le statut reste "DRAFT" après paiement
➡️ Le webhook n'a pas été traité correctement. Vérifier les logs :
- Vercel : aller dans **Deployments** > **Functions** > logs de `/api/webhooks/stripe`
- Stripe : aller dans **Webhooks** > cliquer sur l'endpoint > voir les tentatives

### Erreur 401 lors de l'appel Stripe API
➡️ La `STRIPE_SECRET_KEY` est invalide ou manquante.

## Passer en Production

Quand vous êtes prêt :

1. ✅ Tous les tests passent en mode Test
2. ✅ Le flux complet fonctionne (formulaire → paiement → webhook → statut PAID)
3. ✅ Activer le compte Stripe (fournir infos bancaires, KYC)
4. ✅ Désactiver le mode Test dans Stripe
5. ✅ Créer les produits en mode Live
6. ✅ Créer le webhook en mode Live
7. ✅ Mettre à jour les variables d'environnement Vercel avec les clés Live
8. ✅ Tester un paiement réel (puis rembourser si test)

## URLs de Redirection

Le code utilise ces URLs :

- **Succès** : `/estimation/success?session_id={CHECKOUT_SESSION_ID}`
- **Annulation** : `/estimation?cancelled=true`

Ces pages doivent être créées (voir TODO.md).

## Support

- [Documentation Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Documentation Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Cartes de test](https://stripe.com/docs/testing)
