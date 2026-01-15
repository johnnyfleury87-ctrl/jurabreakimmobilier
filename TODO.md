# TODO - Points à finaliser

## 🔴 Priorité Haute

### 1. Génération de PDF pour les estimations
**Contexte** : Les formules 1 et 2 doivent générer un PDF après paiement.

**À implémenter** :
- Utiliser `pdfkit` pour générer les PDFs côté serveur
- Créer un template PDF avec :
  - Logo de l'agence
  - Informations du bien
  - Estimation de valeur
  - Disclaimer selon la formule
  - Signature (pour Formule 2)
- Upload du PDF dans le bucket `estimations`
- Stocker l'URL dans `estimations.pdf_url`

**Fichiers à créer** :
- `/src/server/pdf/generateEstimationPDF.js`
- `/src/server/pdf/templates/estimation.js`

### 2. Envoi d'emails
**Contexte** : Notifications par email requises

**À implémenter** :
- Configurer Resend ou Sendgrid
- Email après paiement estimation (avec PDF en pièce jointe)
- Email de notification admin lors d'un nouveau lead
- Email de notification admin pour Formule 2 (visite à planifier)

**Fichiers à créer** :
- `/src/server/email/sendEstimationEmail.js`
- `/src/server/email/sendLeadNotification.js`
- `/src/server/email/templates/`

### 3. Calcul automatique Formule 0
**Contexte** : Estimation indicative gratuite

**À implémenter** :
- Algorithme basique d'estimation basé sur :
  - Surface
  - Type de bien
  - Localisation
  - État général
- Comparaison avec biens similaires en DB
- Génération résultat immédiat

**Fichiers à créer** :
- `/src/server/estimation/calculateEstimation.js`
- `/src/app/estimation/resultat/[id]/page.js`

## 🟡 Priorité Moyenne

### 4. Interface admin complète
**Contexte** : Pages admin pour gérer le contenu

**À créer** :
- `/admin/annonces/page.js` (liste)
- `/admin/annonces/new/page.js` (création)
- `/admin/annonces/[id]/edit/page.js` (édition)
- `/admin/leads/page.js` (liste + gestion)
- `/admin/evenements/page.js` (liste)
- `/admin/evenements/new/page.js` (création)
- `/admin/estimations/page.js` (liste)
- `/admin/settings/page.js` (paramètres site)

### 5. Upload d'images
**Contexte** : Upload vers Supabase Storage

**À implémenter** :
- Composant d'upload réutilisable
- Prévisualisation des images
- Compression côté client
- Validation format et taille
- Upload vers les buckets appropriés

**Fichiers à créer** :
- `/src/components/admin/ImageUploader.js`
- `/src/lib/storage/uploadImage.js`

### 6. Validation côté serveur renforcée
**Contexte** : Sécurité et intégrité des données

**À implémenter** :
- Validation des champs de formulaire
- Sanitization des inputs
- Rate limiting sur les endpoints publics
- Protection CSRF

## 🟢 Améliorations (Optionnel)

### 7. Analytics
**À implémenter** :
- Dashboard analytics dans l'admin
- Graphiques de visites
- Annonces les plus vues
- Taux de conversion estimations

### 8. SEO
**À implémenter** :
- Sitemap dynamique
- Meta tags optimisés par page
- Schema.org markup pour annonces
- robots.txt

### 9. Performance
**À implémenter** :
- Optimisation images (next/image)
- Lazy loading
- Caching stratégique
- ISR (Incremental Static Regeneration)

### 10. Tests
**À implémenter** :
- Tests unitaires (Jest)
- Tests d'intégration
- Tests E2E (Playwright)

## 📋 Questions pour le client

### Clarifications nécessaires avant finalisation :

1. **Logo et identité visuelle**
   - Fournir le logo officiel
   - Charte graphique (couleurs exactes, polices)
   - Photos professionnelles

2. **Contenu**
   - Photo et biographie de Lolita
   - Textes pour la page honoraires
   - Contenus initiaux (première annonce, premier événement)

3. **Email**
   - Quel fournisseur d'email préféré ? (Resend, Sendgrid, autre)
   - Adresse email d'expédition
   - Templates d'emails à valider

4. **Stripe**
   - Utiliser mode Test ou Production ?
   - Prix définitifs pour Formule 1 et 2 ?

5. **Formule 2**
   - Process exact pour la visite sur place ?
   - Qui est notifié ?
   - Délai de prise de RDV ?

6. **Mentions légales**
   - Texte des mentions légales à intégrer
   - Politique de confidentialité
   - CGV/CGU

## 🚀 Prochaines étapes recommandées

1. Finaliser la génération de PDF (Priorité 1)
2. Configurer l'envoi d'emails (Priorité 2)
3. Implémenter le calcul Formule 0 (Priorité 3)
4. Compléter les pages admin (Priorité 4)
5. Tests complets (Priorité 5)
6. Démo client et ajustements
7. Mise en production

---

**Note** : Ce fichier doit être mis à jour au fur et à mesure de l'avancement.
