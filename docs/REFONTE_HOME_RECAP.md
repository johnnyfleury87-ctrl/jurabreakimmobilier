# 🎨 Refonte Page d'Accueil - Architecture & Design

## ✅ Structure implémentée

### 1️⃣ HERO SECTION (Plein écran)

```
┌─────────────────────────────────────────────────────────┐
│                  FOND VERT #2d6a4f                      │
│           (motif géométrique hexagonal discret)         │
│                                                         │
│  ┌──────────────────────┐    ┌──────────────────────┐ │
│  │                      │    │                      │ │
│  │  GRAND TITRE H1      │    │                      │ │
│  │  (Blanc, 3.5rem)     │    │   ESPACE VIDE       │ │
│  │                      │    │   (respiration)     │ │
│  │  Paragraphe court    │    │                      │ │
│  │  (Blanc, 1.25rem)    │    │                      │ │
│  │                      │    │                      │ │
│  │  [Voir les annonces] │    │                      │ │
│  │  (Bouton CTA blanc)  │    │                      │ │
│  │                      │    │                      │ │
│  └──────────────────────┘    └──────────────────────┘ │
│     CONTENU GAUCHE              COLONNE DROITE         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Caractéristiques** :
- ✅ Fond vert uni professionnel
- ✅ Motif hexagonal très discret (opacity 8%)
- ✅ Contenu aligné à **gauche**
- ✅ Beaucoup d'espace à droite (respiration)
- ✅ Plein écran (min-height: 100vh)
- ✅ Design sobre et premium

---

### 2️⃣ TRANSITION

```
┌─────────────────────────────────────────────────────────┐
│               FIN SECTION VERTE                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│            DÉBUT SECTION BLANCHE                        │
```

**Caractéristiques** :
- ✅ Séparation nette et propre
- ✅ Pas d'effet excessif
- ✅ Transition visuelle claire

---

### 3️⃣ SECTION PRÉSENTATION (Fond blanc)

```
┌─────────────────────────────────────────────────────────┐
│                    FOND BLANC #ffffff                   │
│                                                         │
│  ┌──────────────────────┐    ┌──────────────────────┐ │
│  │                      │    │                      │ │
│  │   ESPACE VIDE        │    │  "Bonjour"          │ │
│  │   (futur visuel)     │    │  (petit intro)      │ │
│  │                      │    │                      │ │
│  │                      │    │  TITRE H2 FORT      │ │
│  │                      │    │  (2.5rem)           │ │
│  │                      │    │                      │ │
│  │                      │    │  Texte narratif     │ │
│  │                      │    │  storytelling       │ │
│  │                      │    │                      │ │
│  │                      │    │  [En savoir plus]   │ │
│  │                      │    │  (Bouton secondaire)│ │
│  │                      │    │                      │ │
│  └──────────────────────┘    └──────────────────────┘ │
│     COLONNE GAUCHE              CONTENU DROITE         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Caractéristiques** :
- ✅ Fond blanc pur
- ✅ Contenu aligné à **droite**
- ✅ Colonne gauche vide (réservée)
- ✅ Petit texte intro uppercase
- ✅ Titre de présentation fort
- ✅ Texte descriptif
- ✅ Bouton outline (bordure verte)

---

## 🎨 Palette de couleurs

```css
Vert principal:     #2d6a4f  /* Hero, accents, boutons */
Noir texte:         #1a1a1a  /* Titres */
Gris texte:         #4a4a4a  /* Paragraphes */
Blanc:              #ffffff  /* Fond section 2, bouton hero */
Motif hexagone:     rgba(255,255,255,0.08) /* Très discret */
```

---

## 📐 Espacements

```
Hero Section:
- Padding vertical: 0 (plein écran)
- Grid: 2 colonnes égales
- Gap: 4rem
- Max-width: 1400px

Section Présentation:
- Padding vertical: 8rem (desktop)
- Grid: 2 colonnes égales
- Gap: 4rem
- Max-width: 1400px
```

---

## 📱 Responsive

### Desktop (> 968px)
- Layout 2 colonnes
- Tous les espacements complets

### Tablet/Mobile (< 968px)
- Layout 1 colonne
- Colonnes vides cachées
- Espaces réduits
- Boutons pleine largeur

---

## ✨ Points clés

### Ce qui a été RESPECTÉ :
- ✅ Architecture 2 sections (Hero vert + Présentation blanc)
- ✅ Contenu gauche dans hero
- ✅ Contenu droite dans présentation
- ✅ Espaces vides pour respiration
- ✅ Design sobre et professionnel
- ✅ Pas de surcharge visuelle
- ✅ Hiérarchie claire

### Ce qui a été ÉVITÉ :
- ❌ Pas de stats inventées
- ❌ Pas de composants en trop
- ❌ Pas de suppression de boutons
- ❌ Pas d'animations excessives
- ❌ Pas de réinterprétation

---

## 📂 Fichiers modifiés

```
src/app/page.js              # Structure JSX
src/app/page.module.css      # Styles complets
```

**Total : 2 fichiers** (modification simple et ciblée)

---

## 🎯 Résultat

Une page d'accueil **sobre, aérée et professionnelle** qui :
- Attire l'attention avec le hero vert
- Guide l'œil naturellement
- Respire avec ses espaces vides
- Présente Lolita de manière personnelle
- Incite à l'action avec 2 CTA clairs

**Design premium sans surcharge visuelle.** ✨
