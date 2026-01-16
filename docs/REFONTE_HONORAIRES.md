# Refonte de la page Honoraires

## 🎯 Objectif
Refaire la page "Honoraires" pour qu'elle soit alignée avec le design premium de la page d'accueil, avec une mise en page moderne, aérée et des animations légères.

## ✅ Réalisations

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
