# CHECKLIST DE VALIDATION - JuraBreak Immobilier

## ✅ Setup Initial

- [ ] Migrations SQL appliquées sans erreur
- [ ] RLS activé sur toutes les tables sensibles
- [ ] Storage buckets créés (annonces, public, estimations)
- [ ] Fonction `is_admin()` créée et testée
- [ ] Triggers créés (max_8_photos, updated_at)

## ✅ Base de Données

### Tables créées
- [ ] `profiles` (avec RLS)
- [ ] `agence_settings` (avec RLS)
- [ ] `annonces` (avec RLS)
- [ ] `annonce_photos` (avec RLS)
- [ ] `events` (avec RLS)
- [ ] `leads` (avec RLS)
- [ ] `analytics_events` (avec RLS)
- [ ] `estimations` (avec RLS)

### Contraintes vérifiées
- [ ] `annonces.slug` UNIQUE
- [ ] `annonce_photos.position` CHECK (0-7)
- [ ] Trigger refuse 9e photo
- [ ] `annonces.statut` CHECK valeurs autorisées
- [ ] Soft delete `is_deleted` fonctionnel

## ✅ RLS & Policies

### profiles
- [ ] SELECT: user peut lire son profil
- [ ] INSERT: autorisé si auth.uid = id
- [ ] UPDATE: user update son profil, admin full

### agence_settings
- [ ] SELECT public: OK (lecture site)
- [ ] INSERT/UPDATE/DELETE: admin only

### annonces
- [ ] SELECT public: seulement publiées + non deleted
- [ ] SELECT admin: tout
- [ ] INSERT/UPDATE/DELETE: admin only

### annonce_photos
- [ ] SELECT public: photos des annonces publiées uniquement
- [ ] SELECT admin: tout
- [ ] INSERT/UPDATE/DELETE: admin only

### events
- [ ] SELECT public: seulement is_published = true
- [ ] SELECT admin: tout
- [ ] INSERT/UPDATE/DELETE: admin only

### leads
- [ ] INSERT public: autorisé (formulaire contact)
- [ ] SELECT/UPDATE/DELETE: admin only

### analytics_events
- [ ] INSERT public: autorisé (tracking)
- [ ] SELECT: admin only

### estimations
- [ ] INSERT public: autorisé (statut DRAFT)
- [ ] SELECT/UPDATE/DELETE: admin only

## ✅ Storage Policies

### Bucket annonces
- [ ] SELECT public: autorisé
- [ ] INSERT/UPDATE/DELETE: admin only

### Bucket public
- [ ] SELECT public: autorisé
- [ ] INSERT/UPDATE/DELETE: admin only

### Bucket estimations
- [ ] SELECT: admin only
- [ ] INSERT/UPDATE/DELETE: admin only

## ✅ Tests Fonctionnels

### En tant que visiteur non connecté
- [ ] Je peux voir la page d'accueil
- [ ] Je peux voir les annonces publiées
- [ ] Je NE PEUX PAS voir les annonces en brouillon
- [ ] Je peux voir les événements publiés
- [ ] Je peux remplir le formulaire de contact (lead créé en DB)
- [ ] Je peux demander une estimation gratuite (Formule 0)
- [ ] Je peux accéder au paiement Stripe (Formule 1 et 2)
- [ ] Je NE PEUX PAS accéder à /admin
- [ ] Je NE PEUX PAS voir les leads
- [ ] Je NE PEUX PAS voir les estimations
- [ ] Je NE PEUX PAS voir les analytics

### En tant qu'admin connecté
- [ ] Je peux me connecter à /admin/login
- [ ] Je peux voir le dashboard
- [ ] Je peux créer une annonce
- [ ] Je peux modifier une annonce
- [ ] Je peux uploader des photos (max 8)
- [ ] Upload de la 9e photo est refusé
- [ ] Je peux supprimer une annonce (soft delete)
- [ ] Je peux voir tous les leads
- [ ] Je peux changer le statut d'un lead
- [ ] Je peux créer/modifier des événements
- [ ] Je peux voir toutes les estimations
- [ ] Je peux modifier les settings du site
- [ ] Je peux me déconnecter

## ✅ Stripe & Paiements

- [ ] Stripe configuré (clés présentes)
- [ ] Products créés (Formule 1 et 2)
- [ ] Price IDs configurés dans .env
- [ ] Checkout Session créée correctement
- [ ] Webhook configuré (`/api/webhooks/stripe`)
- [ ] Webhook secret configuré
- [ ] Test paiement Formule 1 : statut PAID + génération PDF
- [ ] Test paiement Formule 2 : statut PAID + génération PDF + notification visite

## ✅ Système Estimation

- [ ] Formule 0 (gratuite) : formulaire OK
- [ ] Formule 0 : résultat affiché immédiatement
- [ ] Formule 0 : disclaimer présent
- [ ] Formule 1 : redirection Stripe OK
- [ ] Formule 1 : après paiement, PDF généré et envoyé
- [ ] Formule 2 : redirection Stripe OK
- [ ] Formule 2 : après paiement, PDF signé + notification visite

## ✅ Déploiement

- [ ] `npm run build` réussit sans erreur
- [ ] Pas d'erreur TypeScript (projet en JS uniquement)
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Site déployé et accessible
- [ ] Connexion Supabase OK en production
- [ ] Webhook Stripe pointant vers l'URL de production
- [ ] Test end-to-end en production

## ✅ Documentation

- [ ] README.md complet
- [ ] .env.example présent et à jour
- [ ] Instructions de setup claires
- [ ] Scripts SQL documentés
- [ ] CHECKLIST.md (ce fichier) complété

## ⚠️ Points d'Attention

### Vérifications critiques avant mise en production :
1. Aucune table sans RLS activé
2. Aucune policy trop permissive
3. Service Role Key JAMAIS exposé au client
4. Stripe Webhook Secret sécurisé
5. Validation des données côté serveur
6. Disclaimers présents pour les estimations

## 📝 TODO (si applicable)

- [ ] Configurer l'envoi d'emails (Resend/Sendgrid)
- [ ] Générer réellement les PDFs (pdfkit)
- [ ] Ajouter signature électronique pour Formule 2
- [ ] Implémenter analytics avancées
- [ ] Optimiser les images (compression)
- [ ] Ajouter sitemap.xml
- [ ] Configurer Google Analytics (optionnel)

## ✅ Validation Finale

- [ ] Toutes les fonctionnalités du PDF implémentées
- [ ] Aucune fonctionnalité "bonus" non demandée
- [ ] Code propre et commenté
- [ ] Pas d'erreurs console
- [ ] Tests manuels réussis
- [ ] Performance acceptable
- [ ] Prêt pour démonstration client

---

**Date de dernière mise à jour** : [À compléter]
**Validé par** : [À compléter]
