# Refonte de la page Honoraires - Version Légère

## 🎯 Objectif
Créer une page Honoraires **simple, lisible et élégante**, style "vitrine premium", alignée avec la page d'accueil, sans surcharge visuelle.

## ✅ Réalisations

### 1. Hero Section Léger (Fond Dégradé Bleu Clair)
- **Design aéré** avec fond dégradé bleu très clair `#f0f9ff → #e0f2fe`
- Pas de fond vert massif, optique plus douce
- **Titre H1** "Honoraires" en bleu (`--color-primary`)
- **Sous-titre** : "Transparence totale, sans surprise, sans frais cachés"
- **Image decorative** : `honorraire.png` à droite (desktop), masquée sur mobile
- **Deux boutons CTA** :
  - "Nous contacter" (primaire)
  - "Demander une estimation" (secondaire)
- **Animation discrète** : fade + slide léger (0.6s)

### 2. Navigation Sticky SUPPRIMÉE
- ❌ Plus de barre "Transaction / Location"
- ✅ Tout le contenu directement visible (scroll simple)
- ✅ Lecture linéaire plus fluide

### 3. Sections Transaction et Location (Sans Cards)

#### Structure simplifiée :
- **Sections simples** avec titres H2
- **Listes de prix** au lieu de tableaux complexes
- Format **2 colonnes** : Label à gauche / Prix à droite
- **Hover léger** sur les lignes (fond gris très clair)

#### Section Transaction :
**Liste de prix :**
- Maison supérieure à 100 000€ : **7 000€ TTC**
- Appartement supérieur à 100 000€ : **6 000€ TTC**
- Immeuble supérieur à 100 000€ : **9 000€ TTC**
- Immeuble supérieur à 500 000€ : **15 000€ TTC**
- Bien de 50 000€ à 100 000€ : **5 000€ TTC**
- Bien de 30 000€ à 49 999€ : **3 500€ TTC**
- Bien de moins de 30 000€ : **2 500€ TTC**

**Encadré Estimation (Jaune) :**
- Label : "ESTIMATION"
- Valeur : **150€ TTC** + frais de déplacement selon localisation
- Dégradé jaune doux

**Encadré Info (Bleu) :**
- Texte explicatif sur services inclus (diagnostics, photos pro, chiffrage travaux)
- Fond bleu très clair

#### Section Location :
**Liste de prix :**
- Loyer HC de 1€ à 399€ : **80% du loyer**
- Loyer HC de 400€ à 799€ : **75% du loyer**
- Loyer HC de 800€ à 1 499€ : **60% du loyer**
- État des lieux : **3€ le m²**

**Encadré Avantage (Vert) :**
- Icône checkmark
- **Pas de frais de publicité**
- Dégradé vert clair

### 4. Design & UX

#### Typographie
- **Titres H1** : `text-5xl`, bold, bleu primaire
- **Titres H2** : `text-3xl`, bold, bordure inférieure bleue claire
- **Labels** : `text-base`, medium
- **Prix** : `text-xl`, bold, couleur primaire, alignés à droite

#### Espacements généreux
- Gap entre sections : `space-20`
- Padding interne listes : `space-5` / `space-8`
- Espacement vertical hero : `space-20` / `space-16`

#### Couleurs douces
- Hero : dégradé bleu clair (`#f0f9ff → #e0f2fe`)
- Listes : fond blanc avec bordures très claires
- Encadrés : dégradés subtils (jaune, bleu, vert)
- Prix : bleu primaire (`--color-primary`)

#### Image
- **Fichier** : `/images/team/honorraire.png`
- **Placement** : Hero à droite (desktop uniquement)
- **Style** : border-radius `radius-lg`, ombre douce
- **Responsive** : masquée sur mobile/tablette

### 5. Animations Discrètes

#### Animation principale
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px); /* mouvement léger */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Timing
- Hero gauche : délai `0.1s`
- Hero image : délai `0.3s`
- Section 1 : délai `0.2s`
- Section 2 : délai `0.4s`
- Durée : `0.6s` (rapide et fluide)

#### Interactions
- Hover sur lignes de prix → fond gris très léger
- Pas d'animations agressives
- Respect `prefers-reduced-motion`

### 6. Responsive Design

#### Desktop (> 1024px)
- Hero en 2 colonnes (texte + image)
- Listes de prix en 2 colonnes (label / prix)
- Image visible à droite

#### Tablette (≤ 1024px)
- Hero en 1 colonne
- Image centrée et réduite
- Listes maintenues en 2 colonnes

#### Mobile (≤ 768px)
- **Image masquée**
- **Boutons CTA** en colonne (full width)
- **Listes de prix** en colonne :
  - Label au-dessus
  - Prix en dessous (aligné à gauche)
- Textes réduits pour lisibilité
- Espacements compactés

### 7. Accessibilité

#### Prefers Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .heroLeft, .heroRight, .section {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

#### Mode Impression
- Fond retiré (blanc)
- Image masquée
- Boutons CTA masqués
- Hovers désactivés

#### Contraste
- Texte foncé sur fond clair (ratio AAA)
- Prix en bleu foncé pour lisibilité

## 📁 Fichiers Modifiés

### `/src/app/honoraires/page.js`
- **Suppression** : Card, CardContent, navigation sticky
- **Ajout** : Hero avec image, 2 boutons CTA, sections simples
- **Structure** : Listes de prix avec divs (plus léger que tableaux)
- **Import** : Image de Next.js, Button du design system

### `/src/app/honoraires/page.module.css`
- **447 lignes** de CSS propre et structuré
- Hero avec dégradé bleu clair
- Listes de prix flexbox
- Encadrés colorés discrets
- Animations légères (0.6s)
- Media queries responsive complet

## 🎨 Palette Utilisée

```css
/* Hero */
background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)

/* Principal */
--color-primary: #2c5282 (bleu titres et prix)
--color-primary-lighter: #e6f0f8 (encadré info)

/* Encadrés */
Estimation: #fef3c7 → #fde68a (jaune)
Info: --color-primary-lighter (bleu clair)
Avantage: #d1fae5 → #a7f3d0 (vert clair)
```

## 🚀 Résultat

✅ **Design léger et aéré** - Pas de surcharge visuelle  
✅ **Lecture rapide** - On comprend les montants en 3 secondes  
✅ **Image intégrée** - Visuel décoratif professionnel  
✅ **Navigation supprimée** - Scroll linéaire fluide  
✅ **Animations discrètes** - Fade + slide léger (0.6s)  
✅ **Responsive complet** - Adaptation mobile intelligente  
✅ **Accessibilité** - Prefers-reduced-motion + mode impression  
✅ **SEO optimisé** - H1/H2 sémantiques, métadonnées  
✅ **Contenu préservé** - Aucune information supprimée

## 📱 Preview

Le serveur de développement est disponible sur :
👉 **http://localhost:3000/honoraires**

---

**Changements clés par rapport à la v1 :**
- ❌ Fond vert massif → ✅ Dégradé bleu clair
- ❌ Navigation sticky → ✅ Scroll simple
- ❌ Cards avec tableaux → ✅ Sections avec listes
- ➕ Image decorative ajoutée
- ➕ Boutons CTA dans le hero
- 🎨 Design plus léger et lisible

*Dernière mise à jour : 16 janvier 2026 - Version 2 (Légère)*


### 1. Hero Section (Fond Vert Charte)
- **Design identique à la home** avec fond vert `--color-secondary`
- Motif géométrique hexagonal subtil (opacity: 0.08)
- Titre H1 "Honoraires" blanc, bold
- Sous-titre rassurant : "Transparence totale, sans surprise, sans frais cachés"
- Animation `fadeInUp` au chargement

### 2. Navigation Interne Sticky
- Barre de navigation collante (sticky) avec 2 ancres :
  - **Transaction**
  - **Location**
- Effet backdrop-filter blur
- Positionnée sous le header principal
- Hover avec fond bleu clair

### 3. Deux Grandes Cards Premium

#### Card 1 : Honoraires de Transaction
**Tableau structuré :**
- Maison sup. à 100 000€ : **7 000€ TTC**
- Appartement sup. à 100 000€ : **6 000€ TTC**
- Immeuble sup. à 100 000€ : **9 000€ TTC**
- Immeuble sup. à 500 000€ : **15 000€ TTC**
- Bien de 50 000€ à 100 000€ : **5 000€ TTC**
- Bien de 30 000€ à 49 999€ : **3 500€ TTC**
- Bien de moins de 30 000€ : **2 500€ TTC**

**Encadré Estimation (Highlight jaune)** :
- Badge "ESTIMATION" orange
- Tarif : **150€ TTC** + frais de déplacement

**Encadré Info (Bleu)** :
- Icône information
- Texte explicatif sur les services inclus (diagnostics, photos pro, chiffrage travaux)

#### Card 2 : Honoraires de Location
**Tableau structuré :**
- Loyer HC de 1€ à 399€ : **80% du loyer**
- Loyer HC de 400€ à 799€ : **75% du loyer**
- Loyer HC de 800€ à 1 499€ : **60% du loyer**
- État des lieux : **3€ le m²**

**Encadré Avantage (Vert)** :
- Icône checkmark
- **Pas de frais de publicité**

### 4. Design & UX

#### Typographie
- Titres H1 : `text-5xl`, bold, blanc (hero) / bleu (cards)
- Sous-titres : `text-lg`, semi-transparent
- Tableau : `text-base`, headers uppercase
- Prix : **bold**, `text-lg`, couleur primaire

#### Espacements
- Padding généreux : `space-16` pour sections principales
- Gap entre cards : `space-12`
- Marges internes tableaux : `space-5` / `space-6`

#### Couleurs
- Hero : vert charte (`--color-secondary`)
- Cards : blanc avec ombre légère
- Encadré estimation : jaune (#fef3c7 → #fde68a)
- Encadré info : bleu (`--color-primary-lighter`)
- Encadré avantage : vert (#d1fae5 → #a7f3d0)

### 5. Animations

#### Animations principales
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Staggered animations
- Card 1 : délai `0.1s`
- Card 2 : délai `0.3s`
- Hero : animation immédiate

#### Interactions
- Hover sur lignes tableau → fond gris clair
- Hover sur liens navigation → fond bleu clair
- Transitions douces : `transition-base`

### 6. Responsive Design

#### Desktop (> 768px)
- Hero pleine hauteur (50vh)
- Cards en colonne avec max-width
- Tableaux 2 colonnes classiques

#### Tablette (≤ 768px)
- Hero réduit (40vh)
- Titres plus petits
- Navigation compacte
- Tableaux maintenus en 2 colonnes

#### Mobile (≤ 480px)
- **Tableaux transformés en liste verticale**
- Headers masqués
- Chaque ligne = card individuelle
- Labels avant chaque valeur :
  - "Type : Maison..."
  - "Prix : 7 000€"
- Meilleure lisibilité sur petit écran

### 7. Accessibilité

#### Prefers Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .card, .heroContent {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```
- Désactive toutes les animations si l'utilisateur préfère
- Respecte les préférences système

#### Scroll Anchor
- `scroll-margin-top: 120px` sur les cards
- Navigation interne fluide sans masquer le contenu

#### Contraste
- Texte blanc sur fond vert foncé (ratio AAA)
- Texte foncé sur fonds clairs (ratio AAA)

## 📁 Fichiers Modifiés

### `/src/app/honoraires/page.js`
- Structure complète avec hero, navigation, 2 cards
- Tableaux HTML sémantiques
- Encadrés avec icônes SVG
- Métadonnées SEO

### `/src/app/honoraires/page.module.css`
- 330 lignes de CSS moderne
- Variables CSS du design system
- Animations au scroll
- Media queries responsive
- Prefers-reduced-motion

## 🎨 Palette Utilisée

```css
--color-secondary: #2d6a4f (vert hero)
--color-primary: #2c5282 (bleu principal)
--color-primary-lighter: #e6f0f8 (bleu clair)
--color-success: #10b981 (vert avantage)
```

## 🚀 Résultat

✅ **Design premium** aligné avec la page d'accueil  
✅ **Animations légères** et professionnelles  
✅ **Tableaux structurés** avec hover effects  
✅ **Encadrés colorés** pour mettre en avant les infos importantes  
✅ **Navigation interne** sticky pour faciliter l'accès  
✅ **Responsive complet** avec adaptation intelligente mobile  
✅ **Accessibilité** respectée (prefers-reduced-motion)  
✅ **SEO** optimisé (H1, H2, métadonnées)  
✅ **Aucune information supprimée** - tout le contenu est conservé

## 📱 Preview

Le serveur de développement est démarré sur :
👉 **http://localhost:3000/honoraires**

---

*Dernière mise à jour : 16 janvier 2026*
