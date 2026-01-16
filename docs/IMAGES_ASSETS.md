# 📸 Gestion des Assets Images - JuraBreak Immobilier

## 📁 Structure des dossiers

```
/public/images/
├── branding/
│   └── logo-jurabreak.png          # Logo principal (header)
└── team/
    └── lolita.png                  # Photo de Lolita (page accueil)
```

---

## 🎨 Images actuelles

### Logo JuraBreak
- **Chemin** : `/public/images/branding/logo-jurabreak.png`
- **Utilisation** : Header du site (toutes les pages)
- **Dimensions recommandées** : 200x60 pixels (ratio 3.33:1)
- **Format** : PNG avec fond transparent
- **Alt text** : "JuraBreak Immobilier - Logo"

### Photo Lolita
- **Chemin** : `/public/images/team/lolita.png`
- **Utilisation** : Section présentation de la page d'accueil
- **Dimensions recommandées** : 300x300 pixels (carré)
- **Format** : PNG ou JPG
- **Alt text** : "Lolita - Agent immobilier JuraBreak"
- **Affichage** : Rond (border-radius: 50%)

---

## 🔄 Remplacer les images

### Pour remplacer le logo :
1. Préparez votre image au format PNG (fond transparent)
2. Dimensions : largeur 200px minimum, hauteur 60px environ
3. Renommez-la en `logo-jurabreak.png`
4. Remplacez le fichier dans `/public/images/branding/`
5. Aucun changement de code nécessaire !

### Pour remplacer la photo de Lolita :
1. Préparez votre photo au format JPG ou PNG
2. Dimensions : 300x300 pixels minimum (format carré recommandé)
3. Renommez-la en `lolita.png`
4. Remplacez le fichier dans `/public/images/team/`
5. Aucun changement de code nécessaire !

---

## 📐 Spécifications techniques

### Logo dans le header
```jsx
<Image 
  src="/images/branding/logo-jurabreak.png" 
  alt="JuraBreak Immobilier - Logo" 
  width={160}
  height={48}
  priority
/>
```

**Caractéristiques** :
- Affichage max-height: 48px (desktop), 40px (mobile)
- Cliquable → redirige vers la page d'accueil
- Chargement prioritaire (priority)
- Responsive automatique

### Photo Lolita
```jsx
<Image 
  src="/images/team/lolita.png"
  alt="Lolita - Agent immobilier JuraBreak"
  width={300}
  height={300}
  priority
/>
```

**Caractéristiques** :
- Affichage circulaire (border-radius: 50%)
- 300px (desktop), 240px (tablet), 200px (mobile)
- Ombre portée légère
- Centré verticalement avec le texte

---

## ✅ Avantages de cette structure

### 1. Simplicité
- Un seul emplacement par type d'image
- Noms de fichiers clairs et explicites

### 2. Maintenabilité
- Remplacer une image = copier-coller un fichier
- Pas de modification de code nécessaire

### 3. Performance
- Optimisation automatique par Next.js Image
- Formats WebP générés automatiquement
- Lazy loading (sauf images priority)

### 4. SEO
- Alt text descriptif pour chaque image
- Attributs width/height pour éviter le CLS (Cumulative Layout Shift)

---

## 🎯 Bonnes pratiques

### Avant d'uploader une image :

1. **Optimisez le poids**
   - Logo : < 50 KB
   - Photo : < 200 KB
   - Utilisez TinyPNG ou Squoosh

2. **Vérifiez les dimensions**
   - Logo : environ 200x60 px
   - Photo : 300x300 px (carré)

3. **Format adapté**
   - Logo : PNG avec transparence
   - Photo : JPG (si pas de transparence) ou PNG

4. **Qualité**
   - Logo : haute résolution pour écrans Retina
   - Photo : bonne qualité, bien éclairée

---

## 📱 Affichage responsive

### Desktop (> 968px)
- Logo : 160x48 px
- Photo : 300x300 px (ronde)

### Tablet (< 968px)
- Logo : adaptatif
- Photo : 240x240 px (ronde)

### Mobile (< 640px)
- Logo : 40px hauteur max
- Photo : 200x200 px (ronde)
- Photo affichée AU-DESSUS du texte

---

## 🆘 Problèmes courants

### L'image ne s'affiche pas
1. Vérifiez le nom du fichier (sensible à la casse)
2. Vérifiez l'extension (.png, .jpg, .jpeg)
3. Vérifiez que le fichier est dans le bon dossier
4. Redémarrez le serveur de développement

### L'image est floue
1. Utilisez une image haute résolution (2x minimum)
2. Évitez de redimensionner une petite image

### L'image est déformée
1. Respectez les dimensions recommandées
2. Pour la photo Lolita : format carré obligatoire

---

## 🔧 Maintenance

### Ajouter une nouvelle image d'équipe

1. Créez le fichier dans `/public/images/team/`
2. Utilisez le même pattern que lolita.png
3. Documentez son utilisation ici

### Ajouter un logo alternatif

1. Créez un sous-dossier si nécessaire
2. Exemple : `/public/images/branding/logo-white.png`
3. Documentez son utilisation

---

## 📞 Support

Pour toute question sur les images :
- Dimensions : voir spécifications ci-dessus
- Optimisation : https://tinypng.com
- Formats : PNG (transparence) ou JPG (photos)
