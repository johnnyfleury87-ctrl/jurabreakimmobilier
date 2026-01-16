# 🔐 Système d'Administration - JuraBreak Immobilier

## Vue d'ensemble

Le back-office permet à Lolita et aux administrateurs autorisés de gérer l'ensemble du site : annonces, messages, estimations et événements.

## 🚀 Accès à l'administration

### URL d'accès
- **Production** : `https://jurabreakimmobilier.fr/admin`
- **Développement** : `http://localhost:3000/admin`

### Lien dans le header
Un lien discret "Admin" est visible dans le header du site (uniquement sur desktop).

## 🔒 Authentification

### Méthode : Magic Link (Supabase Auth)
- **Pas de mot de passe** : connexion sécurisée par lien unique envoyé par email
- Le lien est valide **1 heure**
- Compatible avec tous les appareils

### Emails autorisés
Les emails suivants ont accès à l'administration :
- `contact@jurabreak.fr`
- `lolita@jurabreak.fr`

Pour ajouter un nouvel admin, modifier le fichier :
```
src/lib/auth/config.js
```

## 📊 Dashboard

Le tableau de bord affiche 4 cards principales :

### 📧 Messages contact
- Nombre de nouveaux messages reçus via le formulaire de contact
- Lien vers la gestion des leads

### 📋 Estimations
- Nombre de demandes d'estimation de biens
- Lien vers la liste complète

### 🏠 Annonces
- Nombre d'annonces immobilières actives
- Lien vers la gestion des annonces

### 📅 Événements
- Nombre d'événements publiés
- Lien vers la gestion des événements

## 🛡️ Sécurité

### Protection des routes
Toutes les pages `/admin/*` sont protégées par un layout :
1. Vérification de l'authentification Supabase
2. Vérification de l'email dans la liste des admins autorisés
3. Redirection vers `/admin/login` si non authentifié
4. Message "Accès non autorisé" si email non autorisé

### Configuration
- Liste des emails autorisés : `src/lib/auth/config.js`
- Layout de protection : `src/app/admin/layout.js`

## 📱 Responsive

- **Desktop** : sidebar fixe + contenu principal
- **Tablet/Mobile** : sidebar en haut, contenu en dessous

## 🔑 Déconnexion

La déconnexion est accessible depuis :
- Le bouton dans la sidebar
- La route `/admin/logout`

## 🛠️ Structure technique

```
src/
├── app/
│   └── admin/
│       ├── layout.js          # Protection auth + vérification email
│       ├── login/
│       │   ├── page.js        # Formulaire magic link
│       │   └── page.module.css
│       ├── logout/
│       │   └── route.js       # Déconnexion
│       ├── page.js            # Dashboard principal
│       └── page.module.css
├── lib/
│   └── auth/
│       └── config.js          # Liste emails autorisés
└── components/
    └── Header.js              # Lien "Admin" dans le menu
```

## ⚙️ Configuration Supabase requise

Pour que l'authentification fonctionne, configurer dans Supabase :

1. **Email Templates** : personnaliser le template "Magic Link"
2. **Site URL** : définir l'URL de redirection après connexion
3. **Redirect URLs** : ajouter `https://jurabreakimmobilier.fr/admin` dans les URLs autorisées

## 📝 Notes importantes

- **Pas de stats inventées** : toutes les données proviennent de Supabase
- **Code propre** : composants réutilisables et maintenables
- **UI cohérente** : palette de couleurs alignée sur le site public
- **Accessibilité** : navigation claire et intuitive
