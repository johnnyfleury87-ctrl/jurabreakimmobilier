# Design System - JuraBreak Immobilier

Ce document décrit le design system unifié mis en place sur tout le site JuraBreak Immobilier.

## 📁 Structure

```
src/
├── styles/
│   └── theme.css              # Variables CSS globales et design tokens
├── components/
│   └── ui/
│       ├── Button.js          # Composant bouton réutilisable
│       ├── Card.js            # Composant carte réutilisable
│       ├── PageContainer.js   # Conteneur de page standardisé
│       ├── SectionTitle.js    # Titres de section uniformes
│       ├── PageTransition.js  # Transitions entre les pages
│       └── index.js           # Export centralisé
```

## 🎨 Design Tokens

### Couleurs
- **Primary**: `#2c5282` (Bleu principal)
- **Secondary**: `#2d6a4f` (Vert - page d'accueil)
- **Background**: `#f9fafb` (Gris très clair)
- **Text**: `#1a1a1a` (Gris foncé)

### Rayons (Border Radius)
- `--radius-sm`: 8px
- `--radius-md`: 12px
- `--radius-lg`: 16px
- `--radius-btn`: 12px (boutons)
- `--radius-card`: 16px (cartes)

### Ombres
- `--shadow-card`: Ombre douce pour les cartes
- `--shadow-card-hover`: Ombre plus marquée au hover
- `--shadow-button`: Ombre pour les boutons
- `--shadow-button-hover`: Ombre au hover des boutons

### Typographie
- **Font**: System UI (san-serif natif)
- **Tailles**: de `--text-xs` (12px) à `--text-6xl` (60px)
- **Poids**: normal (400), medium (500), semibold (600), bold (700)

### Espacements
Échelle de `--space-1` (4px) à `--space-24` (96px)

### Transitions
- **Durées**: fast (150ms), base (200ms), slow (300ms)
- **Timing**: `cubic-bezier(0.4, 0, 0.2, 1)`

## 🧩 Composants UI

### Button
```jsx
import { Button } from '@/components/ui'

// Variants
<Button variant="primary">Primaire</Button>
<Button variant="secondary">Secondaire</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Petit</Button>
<Button size="md">Moyen</Button>
<Button size="lg">Grand</Button>

// Avec lien
<Button href="/contact">Contactez-nous</Button>

// Full width
<Button fullWidth>Pleine largeur</Button>
```

### Card
```jsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui'

// Carte simple
<Card hoverable padding="lg">
  <CardContent>
    <h3>Titre</h3>
    <p>Contenu...</p>
  </CardContent>
</Card>

// Carte cliquable
<Card clickable onClick={handleClick}>
  <CardContent>...</CardContent>
</Card>

// Avec sections
<Card>
  <CardHeader>En-tête</CardHeader>
  <CardContent>Contenu</CardContent>
  <CardFooter>Pied de page</CardFooter>
</Card>
```

### PageContainer
```jsx
import { PageContainer } from '@/components/ui'

<PageContainer 
  spacing="lg"          // none | sm | md | lg | xl
  maxWidth="xl"         // sm | md | lg | xl | 2xl | full
  background="gray"     // white | gray | transparent
>
  {/* Contenu de la page */}
</PageContainer>
```

### SectionTitle
```jsx
import { SectionTitle } from '@/components/ui'

<SectionTitle 
  level="h1"                    // h1 | h2 | h3 | h4
  align="center"                // left | center | right
  supertitle="Découvrez"        // Petit texte au-dessus
  subtitle="Description..."     // Sous-titre
  spacing="lg"                  // none | sm | md | lg
>
  Titre Principal
</SectionTitle>
```

## 🎬 Animations

### Animations disponibles
- `fadeIn`: Apparition en fondu
- `fadeInUp`: Fondu + montée
- `fadeInDown`: Fondu + descente
- `slideInLeft`: Glissement depuis la gauche
- `slideInRight`: Glissement depuis la droite
- `scaleIn`: Apparition avec zoom

### Classes utilitaires
```css
.animate-fade-in-up
.animate-slide-in-left
.animate-delay-100  /* Délai de 100ms */
.animate-delay-200  /* Délai de 200ms */
```

### Transitions de boutons et cartes
- **Hover**: Montée légère (translateY(-2px ou -4px)) + ombre renforcée
- **Active**: Retour à la position normale
- **Focus**: Outline accessible

### Transitions de page
Toutes les pages bénéficient automatiquement d'une transition `fadeInUp` grâce au composant `PageTransition` dans `app/template.js`.

## ♿ Accessibilité

### Préférences utilisateur
Le design system respecte `prefers-reduced-motion` :
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations désactivées ou réduites */
}
```

### Focus visible
Tous les éléments interactifs ont un focus ring accessible :
```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Contraste
Tous les textes respectent les normes WCAG AA pour le contraste.

## 📱 Responsive

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 968px
- **Desktop**: > 968px

### Container
Le container s'adapte automatiquement avec des paddings cohérents :
- Mobile: 16px
- Desktop: 32px

## 🚀 Utilisation

### Import global du thème
Le fichier `theme.css` est importé dans `globals.css` :
```css
@import '../styles/theme.css';
```

### Import des composants
```jsx
import { Button, Card, PageContainer, SectionTitle } from '@/components/ui'
```

### Exemple de page complète
```jsx
import { PageContainer, SectionTitle, Card, Button } from '@/components/ui'

export default function MaPage() {
  return (
    <PageContainer spacing="lg" maxWidth="xl" background="gray">
      <SectionTitle 
        level="h1" 
        align="center"
        subtitle="Sous-titre de la page"
        spacing="lg"
      >
        Titre de la page
      </SectionTitle>
      
      <Card hoverable padding="lg">
        <h2>Section</h2>
        <p>Contenu...</p>
        <Button href="/action">Action</Button>
      </Card>
    </PageContainer>
  )
}
```

## 📄 Pages refactorisées

Toutes les pages suivantes utilisent maintenant le design system :

✅ **Page d'accueil** (`/`) - Hero vert + présentation  
✅ **À propos** (`/a-propos`) - Cards avec photo et bio  
✅ **Honoraires** (`/honoraires`) - Cards de tarifs  
✅ **Annonces** (`/annonces`) - Grille de cards  
✅ **Événements** (`/evenements`) - Cards d'événements  
✅ **Contact** (`/contact`) - Formulaire + infos  
✅ **Estimation** (`/estimation`) - Formules + formulaire  
✅ **Header** - Navigation avec animations  
✅ **Footer** - Pied de page uniforme  

## 🎯 Avantages

1. **Cohérence**: Design uniforme sur tout le site
2. **Maintenabilité**: Modifications centralisées dans `theme.css`
3. **Réutilisabilité**: Composants UI partagés
4. **Performance**: Animations optimisées et respectueuses
5. **Accessibilité**: Focus visible, prefers-reduced-motion, contraste
6. **Responsive**: Adapté mobile/tablette/desktop
7. **DX**: Developer experience améliorée avec composants typés

## 🔧 Maintenance

### Modifier une couleur
Éditer `src/styles/theme.css` :
```css
:root {
  --color-primary: #nouvelle-couleur;
}
```

### Ajouter un composant
1. Créer `src/components/ui/MonComposant.js`
2. Créer `src/components/ui/MonComposant.module.css`
3. Exporter dans `src/components/ui/index.js`

### Modifier une animation
Éditer les keyframes dans `theme.css` ou les transitions dans les modules CSS.

---

**Design System créé le 16 janvier 2026**  
**Version: 1.0.0**
