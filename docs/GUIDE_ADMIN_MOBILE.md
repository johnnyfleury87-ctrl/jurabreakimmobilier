# 📱 Guide Admin Mobile - JuraBreak Immobilier

**Date:** 16 janvier 2026  
**Version:** 2.0 - Système complet de gestion d'annonces

---

## 🎯 ACCÈS ADMIN

### Connexion
1. Ouvrir le site sur mobile: `https://votre-site.vercel.app/admin/login`
2. Entrer votre email autorisé
3. Cliquer sur le lien de connexion reçu par email
4. Vous êtes connecté ✅

### Emails autorisés
Les emails suivants ont accès à l'admin:
- `contact@jurabreak.fr`
- `lolita@jurabreak.fr`

---

## 🏠 CRÉER UNE NOUVELLE ANNONCE

### Depuis mobile
1. Aller sur `/admin/annonces`
2. Cliquer sur **"+ Nouvelle annonce"**
3. Remplir le formulaire (détails ci-dessous)
4. Ajouter les photos
5. Cliquer sur **"Créer l'annonce"**

### Champs obligatoires ⭐
- **Titre** (ex: "Belle maison avec jardin à Lons-le-Saunier")
- **Type de bien** (Maison, Appartement, Terrain, Immeuble, etc.)
- **Type de transaction** (Vente ou Location)
- **Ville**
- **Code postal**
- **Prix** (prix de vente OU loyer hors charges)

### Champs recommandés 💡
- **Description** (texte libre, détails du bien)
- **Points forts** (un par ligne):
  ```
  Proche commodités
  Grand jardin
  Rénové récemment
  Vue dégagée
  ```
- **Surface** (en m²)
- **Nombre de pièces**
- **Nombre de chambres**
- **Photos** (minimum 1, maximum recommandé: 8)

### Champs optionnels
- Secteur/Quartier
- Terrain (m²)
- Nombre de salles de bain/d'eau
- Étage
- Année de construction
- Type de chauffage
- Équipements (climatisation, garage, balcon, etc.)
- DPE et GES
- Vidéo YouTube
- Visite virtuelle

---

## 📸 AJOUTER DES PHOTOS

### Depuis mobile
1. Dans le formulaire, section **"Photos"**
2. Cliquer sur **"Ajouter des photos"**
3. Choisir:
   - 📷 **Prendre une photo** (appareil photo)
   - 🖼️ **Galerie** (photos existantes)
4. Sélectionner plusieurs photos (multi-sélection)
5. La **première photo** sera automatiquement la photo de couverture

### Bonnes pratiques 📱
- **Format horizontal** de préférence
- **Bonne luminosité**
- **Photos de qualité** (pas floues)
- **Ordre logique**:
  1. Façade ou vue principale
  2. Pièce de vie
  3. Cuisine
  4. Chambres
  5. Salle de bain
  6. Extérieur/Jardin

### Gérer les photos existantes
- Pour **supprimer** une photo: cliquer sur le ❌
- Pour **réorganiser**: supprimer et re-ajouter dans l'ordre souhaité

---

## 💰 CALCUL AUTOMATIQUE DES HONORAIRES

Les honoraires sont **calculés automatiquement** selon les règles:

### Pour une VENTE 🏡
| Type de bien | Prix | Honoraires TTC |
|--------------|------|----------------|
| Maison | > 100 000 € | 7 000 € |
| Appartement | > 100 000 € | 6 000 € |
| Immeuble | 100 000 - 500 000 € | 9 000 € |
| Immeuble | > 500 000 € | 15 000 € |
| Tous biens | 50 000 - 100 000 € | 5 000 € |
| Tous biens | 30 000 - 49 999 € | 3 500 € |
| Tous biens | < 30 000 € | 2 500 € |

### Pour une LOCATION 🏠
| Loyer HC (mensuel) | Honoraires |
|--------------------|------------|
| 1 - 399 € | 80% du loyer |
| 400 - 799 € | 75% du loyer |
| 800 - 1 499 € | 60% du loyer |
| + État des lieux | 3 € / m² |

**Les honoraires s'affichent automatiquement** dans le formulaire et sur la page publique de l'annonce.

---

## 🔄 MODIFIER UNE ANNONCE

1. Aller sur `/admin/annonces`
2. Trouver l'annonce à modifier
3. Cliquer sur **"✏️ Modifier"**
4. Modifier les champs souhaités
5. Ajouter/supprimer des photos si besoin
6. Cliquer sur **"Enregistrer"**

---

## 📊 CHANGER LE STATUT D'UNE ANNONCE

### Statuts disponibles
- **À vendre** 🟢 (par défaut pour les ventes)
- **Sous compromis** 🟠 (offre acceptée)
- **Vendu** 🔴 (vente finalisée)
- **En location** 🔵 (disponible à la location)
- **Loué** 🟣 (location en cours)
- **Retiré** ⚫ (bien retiré du marché)

### Changement rapide
Depuis la liste des annonces:
1. Trouver l'annonce
2. Utiliser le **menu déroulant** du statut
3. Sélectionner le nouveau statut
4. ✅ Mise à jour immédiate

### Mise à jour côté public
Dès que vous changez le statut, **la page publique est mise à jour instantanément**. Les visiteurs voient le nouveau statut immédiatement.

---

## 👁️ MASQUER/AFFICHER UNE ANNONCE

### Masquer temporairement
1. Dans la liste, cliquer sur l'icône **"👁️"** (œil)
2. L'annonce devient **masquée** (icône 🔒)
3. Elle n'apparaît plus sur le site public
4. Vous pouvez la réafficher à tout moment

### À quoi ça sert ?
- Mettre en pause une annonce sans la supprimer
- Préparer une annonce avant publication
- Retirer temporairement un bien

---

## 🗑️ SUPPRIMER UNE ANNONCE

### ⚠️ Attention: Suppression définitive
1. Dans la liste, cliquer sur **"🗑️"**
2. Confirmer la suppression
3. L'annonce est **supprimée** (soft delete)
4. Elle reste dans la base mais n'est plus accessible

### Annonces supprimées
Les annonces supprimées apparaissent dans l'onglet **"Supprimées"** de la liste admin, mais ne peuvent pas être restaurées automatiquement.

---

## 🔍 FILTRER LES ANNONCES (Admin)

Dans `/admin/annonces`, utilisez les filtres:
- **Toutes** : Toutes les annonces
- **Visibles** : Publiées sur le site
- **Cachées** : Masquées temporairement
- **Supprimées** : Annonces supprimées

---

## 🌐 PAGE PUBLIQUE DES ANNONCES

Les visiteurs peuvent filtrer les annonces sur `/annonces`:
- **Type de bien** (Maison, Appartement, etc.)
- **Type de transaction** (Vente, Location)
- **Statut** (À vendre, Sous compromis, etc.)
- **Ville**
- **Prix min/max**
- **Surface minimale**

Les annonces affichent:
- 📷 Photo principale
- 📍 Localisation
- 💰 Prix (+ honoraires)
- 📐 Caractéristiques (surface, pièces, chambres)
- 🏷️ Badge de statut
- 🔖 Badge transaction (Vente/Location)

---

## 📱 UTILISATION MOBILE

### Formulaire optimisé
- ✅ **Responsive** : Fonctionne parfaitement sur mobile
- ✅ **Bouton sticky** : Le bouton "Créer l'annonce" reste visible en bas
- ✅ **Sections pliables** : Formulaire organisé en sections
- ✅ **Upload natif** : Accès direct à l'appareil photo

### Conseils mobile
- Utilisez le **mode portrait** pour les formulaires
- Faites défiler pour voir toutes les sections
- Le bouton **"Enregistrer"** est toujours accessible en bas
- Vérifiez votre connexion avant d'uploader des photos

---

## ❓ FAQ

### Q: Combien de photos puis-je ajouter ?
**R:** Il n'y a pas de limite stricte, mais nous recommandons **6 à 8 photos** maximum pour une bonne performance.

### Q: Puis-je modifier le prix après publication ?
**R:** Oui, vous pouvez modifier tous les champs à tout moment. Les honoraires se recalculent automatiquement.

### Q: Comment choisir entre Vente et Location ?
**R:** 
- **Vente** : Pour un bien à vendre (affiche "Prix de vente")
- **Location** : Pour un bien à louer (affiche "Loyer HC /mois")

### Q: Que se passe-t-il si je supprime une photo par erreur ?
**R:** Si vous êtes encore dans le formulaire, utilisez le bouton "Annuler". Si vous avez déjà enregistré, modifiez l'annonce et ajoutez une nouvelle photo.

### Q: Les visiteurs voient-ils les changements immédiatement ?
**R:** Oui ! Tous les changements (statut, prix, photos, etc.) sont visibles instantanément sur le site public.

### Q: Comment savoir si une annonce est bien visible ?
**R:** Vérifiez:
1. L'icône est **👁️** (pas 🔒)
2. Le statut n'est pas "Retiré"
3. L'annonce apparaît dans l'onglet **"Visibles"**

---

## 🆘 SUPPORT

En cas de problème:
1. Vérifier votre connexion internet
2. Recharger la page
3. Vérifier que vous êtes bien connecté
4. Contacter le support technique avec une capture d'écran de l'erreur

---

**Dernière mise à jour:** 16 janvier 2026  
**Version du système:** 2.0
