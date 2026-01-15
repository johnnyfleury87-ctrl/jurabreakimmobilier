# 🔍 DIAGNOSTIC VERCEL 404 NOT_FOUND

**Date :** 15 janvier 2026  
**Status :** ✅ **RÉSOLU**

---

## 📋 RÉSUMÉ EXÉCUTIF

Le site affichait une erreur **404 NOT_FOUND** sur Vercel alors que `npm run dev` fonctionnait en local. Le diagnostic a révélé **4 problèmes critiques** empêchant le déploiement correct.

### Résultat final
- ✅ Build production réussi (`npm run build`)
- ✅ Serveur production OK (`npm run start`)
- ✅ Toutes les routes générées correctement (18/18)
- ✅ Configuration Vercel corrigée

---

## 🐛 CAUSES IDENTIFIÉES

### 1. ❌ Configuration Vercel incompatible (vercel.json)

**Fichier concerné :** `vercel.json`

**Problème :**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",    ← ❌ INCOMPATIBLE App Router
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url"  ← ❌ Syntaxe legacy
  }
}
```

**Explication :**
- `outputDirectory: ".next"` : Next.js 14 App Router gère automatiquement l'output. Spécifier `.next` peut perturber le déploiement.
- Variables d'environnement avec `@` : Syntaxe Vercel v1 (legacy) non compatible avec la configuration moderne.
- Vercel détecte automatiquement Next.js et applique les bonnes config.

**Correctif appliqué :**
```json
{}
```
→ Laisser Vercel détecter automatiquement la configuration Next.js.

---

### 2. ❌ Erreur SSG sur la page d'accueil

**Fichier concerné :** `src/app/page.js`

**Problème :**
```bash
Failed to fetch settings: TypeError: r.from is not a function
at c (/workspaces/jurabreakimmobilier/.next/server/app/page.js:1:4689)
```

**Explication :**
- La page d'accueil est par défaut **statique (SSG)** dans Next.js 14.
- Le client Supabase n'est pas disponible au moment du **build** statique.
- L'erreur `r.from is not a function` indique que `createClient()` ne retourne pas un objet valide pendant le SSG.

**Correctif appliqué :**
```javascript
// src/app/page.js
export const dynamic = 'force-dynamic'  // ← Forcer le rendu dynamique (SSR)

export default async function HomePage() {
  // ... reste du code inchangé
}
```

**Justification :**
- Forcer le mode **dynamic** garantit que la page est rendue **côté serveur** (SSR).
- Le client Supabase est correctement initialisé à chaque requête.
- Pas de tentative de pré-rendu statique qui échouerait.

---

### 3. ❌ useSearchParams sans Suspense boundary

**Fichier concerné :** `src/app/contact/page.js`

**Problème :**
```bash
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/contact"
Error occurred prerendering page "/contact"
```

**Explication :**
- Next.js 14 **exige** que `useSearchParams()` soit enveloppé dans un composant `<Suspense>`.
- Sans cela, le pré-rendu échoue et la page ne se génère pas.

**Correctif appliqué :**
```javascript
// src/app/contact/page.js
'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.css'

function ContactForm() {
  const searchParams = useSearchParams()
  const annonceId = searchParams.get('annonce')
  
  // ... reste du formulaire ...
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="container">Chargement...</div>}>
      <ContactForm />
    </Suspense>
  )
}
```

**Justification :**
- Séparer la logique qui utilise `useSearchParams()` dans un composant enfant.
- Envelopper ce composant dans `<Suspense>` avec un fallback.
- Respect strict des exigences Next.js 14.

---

### 4. ❌ Dépendance manquante : iconv-lite

**Logs build :**
```bash
⚠ Compiled with warnings

./node_modules/restructure/src/DecodeStream.js
Module not found: Can't resolve 'iconv-lite' in '/workspaces/jurabreakimmobilier/node_modules/restructure/src'

Import trace:
./node_modules/restructure/src/DecodeStream.js
./node_modules/restructure/index.js
./node_modules/fontkit/dist/module.mjs
./node_modules/pdfkit/js/pdfkit.es5.js
./src/lib/pdfGenerator.js
```

**Explication :**
- Le package `pdfkit` dépend de `iconv-lite` (via `fontkit` et `restructure`).
- Cette dépendance n'était pas listée explicitement dans `package.json`.
- Webpack ne pouvait pas résoudre le module lors du build.

**Correctif appliqué :**
```bash
npm install iconv-lite --save
```

**Résultat :**
```bash
✓ Compiled successfully  (sans warnings)
```

---

## 🧪 PREUVES DE VALIDATION

### Test 1 : Build production local

**Commande :**
```bash
npm run build
```

**Résultat :**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (18/18)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ƒ /                                    350 B          96.4 kB
├ ○ /_not-found                          873 B          88.2 kB
├ ƒ /a-propos                            416 B          92.9 kB
├ ƒ /admin                               350 B          96.4 kB
...
└ ○ /mentions-legales                    316 B          87.7 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

✅ **18/18 pages générées avec succès**

---

### Test 2 : Serveur production local

**Commande :**
```bash
npm run start
```

**Résultat :**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000

✓ Starting...
✓ Ready in 294ms
```

✅ **Serveur démarre correctement en mode production**

---

### Test 3 : Mode développement

**Commande :**
```bash
npm run dev
```

**Résultat :**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 2.3s
```

✅ **Mode dev toujours fonctionnel**

---

## ✅ CHECK-LIST VERCEL FINALISÉE

### Configuration projet

- [x] **Root Directory** : `./` (racine du dépôt)
- [x] **Framework** : Next.js (détection automatique)
- [x] **Build Command** : `npm run build` (par défaut)
- [x] **Install Command** : `npm install` (par défaut)
- [x] **Output Directory** : Automatique (`.next`)
- [x] **Node Version** : Compatible avec Next.js 14 (≥18.17)

### Fichiers requis

- [x] `src/app/layout.js` → Layout racine Next.js App Router
- [x] `src/app/page.js` → Page d'accueil (mode dynamic)
- [x] `next.config.js` → Configuration Next.js
- [x] `package.json` → Dépendances et scripts
- [x] `vercel.json` → Configuration Vercel (vide = auto)

### Variables d'environnement Vercel

**À configurer dans Vercel Dashboard :**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_FORMULE1=price_...
STRIPE_PRICE_ID_FORMULE2=price_...

# Email
EMAIL_PROVIDER_API_KEY=re_...

# Base URL
BASE_URL=https://votredomaine.vercel.app
```

⚠️ **IMPORTANT :** Ces variables doivent être configurées dans **Settings → Environment Variables** sur Vercel.

---

## 📊 COMPARAISON AVANT/APRÈS

| Aspect | Avant | Après |
|--------|-------|-------|
| **Local dev** | ✅ OK | ✅ OK |
| **Build local** | ❌ Erreurs | ✅ Succès |
| **Vercel deploy** | ❌ 404 | ✅ Prévu OK |
| **vercel.json** | Config legacy | Config auto |
| **Page accueil** | SSG échoue | SSR dynamique |
| **Page contact** | Suspense manquant | Suspense OK |
| **Dépendances** | iconv-lite manquant | Installé |

---

## 🚀 DÉPLOIEMENT VERCEL

### Étapes pour déployer

1. **Pusher les modifications :**
   ```bash
   git add .
   git commit -m "fix: Corriger 404 Vercel (vercel.json, SSR, Suspense, iconv-lite)"
   git push origin main
   ```

2. **Configurer les variables d'environnement :**
   - Aller sur Vercel Dashboard → Settings → Environment Variables
   - Ajouter toutes les variables listées ci-dessus
   - Sélectionner : Production, Preview, Development

3. **Déclencher un nouveau déploiement :**
   - Vercel déploiera automatiquement à chaque push sur `main`
   - Ou déclencher manuellement : Deployments → Redeploy

4. **Vérifier le déploiement :**
   - Consulter les logs de build sur Vercel
   - Tester `https://votredomaine.vercel.app/`
   - Vérifier que toutes les pages s'affichent

---

## 📝 RÉSUMÉ DES FICHIERS MODIFIÉS

| Fichier | Modification | Justification |
|---------|-------------|---------------|
| `vercel.json` | Vidé `{}` | Laisser Vercel auto-détecter Next.js |
| `src/app/page.js` | Ajout `export const dynamic = 'force-dynamic'` | Forcer SSR pour Supabase |
| `src/app/contact/page.js` | Wrappé `useSearchParams()` dans `<Suspense>` | Respecter exigences Next.js 14 |
| `package.json` | Ajout `iconv-lite` | Dépendance requise par pdfkit |

---

## 🔗 RESSOURCES

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Vercel Configuration](https://vercel.com/docs/projects/project-configuration)
- [Next.js Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [useSearchParams + Suspense](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)

---

**✅ Diagnostic complété avec succès le 15 janvier 2026**
