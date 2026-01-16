# 📸 Guide Visuel - Remplacement des Images

## 🎯 Objectif

Ce guide explique **visuellement** comment remplacer les images placeholder par de vraies images.

---

## 1️⃣ LOGO JURABREAK

### 📍 Emplacement actuel
Le logo apparaît dans le **header** (en haut de toutes les pages).

```
┌─────────────────────────────────────────────────┐
│  [LOGO] JuraBreak Immobilier    Menu Navigation │
└─────────────────────────────────────────────────┘
```

### 📐 Spécifications

**Fichier** : `/public/images/branding/logo-jurabreak.png`

**Dimensions recommandées** :
- Largeur : **200 pixels**
- Hauteur : **60 pixels**
- Ratio : 3.33:1 (paysage)

**Format** :
- PNG avec **fond transparent** (recommandé)
- ou JPG si pas de transparence nécessaire

**Poids** : < 50 KB

### ✏️ Comment créer votre logo

#### Option 1 : Logo existant
Si vous avez déjà un logo :
1. Exportez-le en PNG (fond transparent)
2. Redimensionnez à 200x60 px minimum
3. Optimisez sur https://tinypng.com

#### Option 2 : Créer un nouveau logo
Utilisez :
- **Canva** : modèle logo 200x60 px
- **Figma** : création vectorielle
- **Adobe Express** : templates gratuits

### 🔄 Étapes de remplacement

1. **Préparez votre logo**
   ```
   Nom : logo-jurabreak.png
   Taille : 200x60 px
   Format : PNG transparent
   ```

2. **Remplacez le fichier**
   ```
   Allez dans : /public/images/branding/
   Supprimez : logo-jurabreak.png (ancien)
   Copiez : logo-jurabreak.png (nouveau)
   ```

3. **Vérifiez**
   - Rafraîchissez le navigateur (Ctrl+F5)
   - Le nouveau logo s'affiche automatiquement
   - Vérifiez sur mobile aussi

### 🎨 Exemple visuel

```
AVANT (placeholder)                APRÈS (votre logo)
┌──────────────┐                  ┌──────────────┐
│  JuraBreak   │                  │   [Votre     │
│              │       →          │    Logo]     │
└──────────────┘                  └──────────────┘
```

---

## 2️⃣ PHOTO LOLITA

### 📍 Emplacement actuel
La photo apparaît sur la **page d'accueil**, section "Bonjour".

```
┌────────────────────────────────────────────┐
│                                            │
│  ┌─────────┐        Bonjour               │
│  │         │                               │
│  │  PHOTO  │        Votre partenaire      │
│  │  RONDE  │        immobilier dans       │
│  │         │        le Jura               │
│  └─────────┘                               │
│                     [En savoir plus]       │
│                                            │
└────────────────────────────────────────────┘
```

### 📐 Spécifications

**Fichier** : `/public/images/team/lolita.png`

**Dimensions recommandées** :
- Largeur : **300 pixels**
- Hauteur : **300 pixels**
- Format : **CARRÉ** (important !)

**Format** :
- JPG (pour photos) ou PNG
- Bonne qualité, bien éclairée

**Poids** : < 200 KB

**Affichage** : Ronde automatiquement (border-radius appliqué)

### ✏️ Comment préparer votre photo

#### Conseils photo professionnelle
- ✅ Lumière naturelle ou bonne lumière
- ✅ Fond neutre (uni ou légèrement flouté)
- ✅ Sourire naturel, regard face caméra
- ✅ Vêtements professionnels
- ✅ Photo récente

#### Recadrage carré
1. Ouvrez votre photo dans un éditeur
2. Recadrez en **format carré** (1:1)
3. Centrez le visage
4. Exportez en 300x300 px minimum

#### Outils recommandés
- **Windows** : Photos (recadrage carré)
- **Mac** : Aperçu (outils de recadrage)
- **En ligne** : https://www.iloveimg.com/crop-image
- **Mobile** : Instagram (recadrage carré)

### 🔄 Étapes de remplacement

1. **Préparez votre photo**
   ```
   Nom : lolita.png (ou .jpg)
   Taille : 300x300 px minimum
   Format : CARRÉ
   ```

2. **Remplacez le fichier**
   ```
   Allez dans : /public/images/team/
   Supprimez : lolita.png (ancien)
   Copiez : lolita.png (nouveau)
   ```

3. **Vérifiez**
   - Allez sur la page d'accueil
   - Rafraîchissez (Ctrl+F5)
   - La photo s'affiche en rond automatiquement

### 🎨 Exemple visuel

```
AVANT (placeholder)          APRÈS (votre photo)
     ┌───────┐                    ┌───────┐
    │   😊   │                   │   📸   │
    │ Icône  │        →          │ Photo  │
    │ avatar │                   │ Lolita │
     └───────┘                    └───────┘
   (placeholder)              (vraie photo)
```

### 📱 Affichage responsive

**Desktop** : 300x300 px
```
┌─────────┐        Texte...
│  PHOTO  │
│  300px  │
└─────────┘
```

**Mobile** : 200x200 px, au-dessus
```
   ┌─────┐
   │PHOTO│
   │200px│
   └─────┘
   
   Texte...
```

---

## ❓ Questions fréquentes

### Puis-je utiliser un autre nom de fichier ?
**Non**, gardez les noms exacts :
- `logo-jurabreak.png`
- `lolita.png`

Si vous changez le nom, il faudra modifier le code.

### Puis-je utiliser JPG au lieu de PNG ?
**Oui**, renommez juste en `.png` :
- Logo : PNG recommandé (transparence)
- Photo : JPG OK (renommez en .png)

### La photo n'est pas ronde ?
C'est normal ! Le code applique automatiquement le style arrondi.
Votre photo doit juste être **carrée**.

### Comment optimiser mes images ?
Utilisez https://tinypng.com :
1. Upload votre image
2. Téléchargez la version optimisée
3. Remplacez le fichier

### Mon logo est trop petit/grand ?
Assurez-vous que :
- Dimensions : 200x60 px minimum
- Le logo est vectoriel ou haute résolution
- Format transparent pour s'adapter

---

## ✅ Checklist avant remplacement

### Logo
- [ ] Image préparée (200x60 px)
- [ ] Format PNG transparent
- [ ] Poids < 50 KB
- [ ] Nom : `logo-jurabreak.png`
- [ ] Testé sur fond clair ET foncé

### Photo
- [ ] Photo carrée (300x300 px)
- [ ] Bonne qualité, bien éclairée
- [ ] Poids < 200 KB
- [ ] Nom : `lolita.png`
- [ ] Photo professionnelle récente

---

## 🆘 Besoin d'aide ?

### Retouche photo
- https://www.remove.bg (retirer le fond)
- https://www.photopea.com (éditeur gratuit)
- https://www.canva.com/photo-editor (retouche simple)

### Optimisation
- https://tinypng.com (compression)
- https://squoosh.app (compression avancée)

### Création logo
- https://www.canva.com (templates)
- https://www.figma.com (design)
- https://www.adobe.com/express (gratuit)

---

## 🎉 C'est fait !

Une fois les fichiers remplacés :
1. Rafraîchissez votre navigateur
2. Vérifiez sur mobile
3. Partagez avec votre équipe

**Pas besoin de coder !** ✨
