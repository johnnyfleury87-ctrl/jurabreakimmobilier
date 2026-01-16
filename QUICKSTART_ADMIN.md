# ⚡ DÉMARRAGE RAPIDE - ADMIN V2.0

**Version:** 2.0.0  
**Date:** 16 janvier 2026  
**Statut:** ✅ Prêt pour production

---

## 🚀 EN 5 MINUTES

### 1. Appliquer les migrations Supabase

**Option A - Script automatique:**
```bash
bash scripts/apply-migrations.sh
```

**Option B - Manuellement:**
1. Ouvrir Supabase Dashboard > SQL Editor
2. Copier le contenu de `supabase/migrations/0007_refactor_annonces_complet.sql`
3. Exécuter
4. Répéter avec `0008_storage_annonces_photos.sql`

### 2. Configurer les admins

Modifier `src/lib/auth/config.js`:
```javascript
export const ADMIN_EMAILS = [
  'contact@jurabreak.fr',
  'lolita@jurabreak.fr',
  // Ajouter vos emails ici
]
```

### 3. Tester en local

```bash
npm run dev
# Ouvrir http://localhost:3000/admin/login
```

### 4. Déployer sur Vercel

```bash
vercel --prod
```

Ou connecter le repo GitHub à Vercel.

---

## 📋 CHECKLIST AVANT PRODUCTION

- [ ] Migrations Supabase appliquées
- [ ] Bucket Storage `annonces` créé
- [ ] Emails admin configurés dans le code
- [ ] Variables d'environnement dans Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- [ ] Test connexion admin
- [ ] Test création d'une annonce
- [ ] Test upload photo
- [ ] Test page publique `/annonces`

---

## 🎯 ROUTES PRINCIPALES

### Admin
- `/admin/login` - Connexion
- `/admin/annonces` - Liste des annonces
- `/admin/annonces/new` - Créer une annonce
- `/admin/annonces/[id]/edit` - Modifier une annonce

### Public
- `/annonces` - Liste publique avec filtres
- `/annonces/[slug]` - Détail d'une annonce

---

## 📚 DOCUMENTATION COMPLÈTE

### Pour Lolita (utilisateur)
📖 **[docs/GUIDE_ADMIN_MOBILE.md](docs/GUIDE_ADMIN_MOBILE.md)**
- Comment créer une annonce
- Comment uploader des photos
- Comment gérer les statuts
- FAQ et dépannage

### Pour les développeurs
📖 **[LIVRABLE_ADMIN_V2.md](LIVRABLE_ADMIN_V2.md)**
- Architecture technique
- API endpoints
- Installation détaillée
- Tests et validation

### Récapitulatif complet
📖 **[LIVRAISON_COMPLETE.md](LIVRAISON_COMPLETE.md)**
- Liste de tous les fichiers créés
- Fonctionnalités détaillées
- Procédure de déploiement
- Statistiques du projet

---

## 🆘 PROBLÈMES FRÉQUENTS

### Erreur "Unauthorized" sur /admin
➡️ Vérifier que l'email est dans `ADMIN_EMAILS`

### Photos ne s'uploadent pas
➡️ Vérifier que le bucket `annonces` existe dans Supabase Storage

### Honoraires à 0
➡️ Vérifier que le prix est > 0 et le type_bien est correct

### Build échoue
➡️ Vérifier les variables d'environnement
➡️ Lancer `npm run build` localement pour voir les erreurs

---

## 💡 TIPS

- **Mobile:** Le formulaire est optimisé pour mobile, utilisez-le depuis un téléphone
- **Photos:** La première photo uploadée devient automatiquement la photo de couverture
- **Honoraires:** Se calculent automatiquement dès que vous entrez le prix
- **Filtres:** Les visiteurs peuvent filtrer par 7 critères sur `/annonces`
- **Statuts:** Changez rapidement le statut depuis la liste admin

---

## 📞 AIDE

En cas de blocage:
1. Consulter les 3 documents de documentation
2. Vérifier les logs dans Vercel Dashboard
3. Tester en local avec `npm run dev`

---

**Prêt à gérer des annonces ! 🎉**
