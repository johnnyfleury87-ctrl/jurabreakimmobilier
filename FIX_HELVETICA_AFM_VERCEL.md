# 🚨 FIX CRITIQUE: Helvetica.afm ENOENT sur Vercel

**Commit:** `f9062c4`  
**Date:** 20 janvier 2026  
**Problème:** PDF génération casse en production Vercel serverless

---

## ❌ ERREUR IDENTIFIÉE

### Symptômes en production Vercel:

```
PDF_RENDER_ERROR
ENOENT: no such file or directory, 
open '/var/task/.next/server/chunks/data/Helvetica.afm'
```

### Cause racine:

**pdfkit** essaie de charger les fichiers `.afm` (Adobe Font Metrics) des fonts standards depuis le filesystem. 

En environnement serverless Vercel:
- ✅ En local: fonts accessibles dans `node_modules/pdfkit/`
- ❌ En prod: chemin `/var/task/` différent, fonts pas dans le bundle
- ❌ Résultat: `ENOENT` → crash 500

---

## ✅ SOLUTION APPLIQUÉE (Commit f9062c4)

### 1. Logs ultra-détaillés pour tracer le crash

**Ajouté dans pdfGenerator.js:**

```javascript
console.log('[pdfGenerator] ========== DÉBUT GÉNÉRATION ==========')
console.log('[pdfGenerator] Environment:', process.env.NODE_ENV)
console.log('[pdfGenerator] Platform:', process.platform)
console.log('[pdfGenerator] Création PDFDocument...')
console.log('[pdfGenerator] PDFDocument créé')
console.log('[pdfGenerator] Démarrage du rendu...')
console.log('[pdfGenerator] Ajout watermark TEST')
console.log('[pdfGenerator] Rendu en-tête')
console.log('[pdfGenerator] Rendu titre')
console.log('[pdfGenerator] Rendu infos client')
console.log('[pdfGenerator] Finalisation du PDF')
```

**Objectif:** Identifier À QUEL MOMENT exactement pdfkit essaie de charger Helvetica.afm

### 2. Double try/catch pour isoler l'erreur

```javascript
return new Promise((resolve, reject) => {
  try {
    // Création doc
    const doc = new PDFDocument({ ... })
    
    try {
      // Tout le rendu (en-tête, titre, corps, etc.)
      doc.fontSize(24).text('...')
      doc.end()
    } catch (renderError) {
      // ⚠️ CAPTURE L'ERREUR HELVETICA.AFM ICI
      console.error('[pdfGenerator] ❌ ERREUR PENDANT LE RENDU:', renderError)
      console.error('[pdfGenerator] Message:', renderError.message)
      console.error('[pdfGenerator] Code:', renderError.code)
      reject(new Error(`Erreur rendu PDF: ${renderError.message}`))
    }
  } catch (error) {
    console.error('[pdfGenerator] ❌ Erreur génération globale:', error)
    reject(error)
  }
})
```

### 3. Options PDFDocument optimisées

```javascript
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true,    // ✅ Buffer les pages
  autoFirstPage: true   // ✅ Première page auto
  // ❌ PAS de font: 'Helvetica' ou autre
})
```

**Changement clé:** Ne PAS spécifier de font custom qui nécessite .afm

---

## 🔍 PROCHAINES ÉTAPES

### Si l'erreur persiste après ce commit:

Les logs Vercel Functions montreront **exactement** où ça casse:

**Scénario 1: Crash avant "Création PDFDocument..."**
→ Problème import pdfkit ou dépendances

**Scénario 2: Crash après "Création PDFDocument..." mais avant "Démarrage du rendu"**
→ Problème initialisation doc (options invalides)

**Scénario 3: Crash après "Démarrage du rendu" mais avant "Rendu en-tête"**
→ Problème watermark TEST (rotate, fillColor)

**Scénario 4: Crash pendant "Rendu en-tête/titre/client"**
→ **C'EST LÀ**: pdfkit essaie de charger Helvetica.afm lors du `.text()`

### Solutions si crash persiste au scénario 4:

**Option A: Utiliser Courier (font intégrée sans .afm)**
```javascript
// Au lieu de fontSize().text()
doc.font('Courier')  // Font standard sans .afm
   .fontSize(24)
   .text('JuraBreak Immobilier')
```

**Option B: Embarquer une police TTF custom**
```javascript
// 1. Créer public/fonts/Roboto-Regular.ttf
// 2. Enregistrer la font
doc.registerFont('Roboto', 'public/fonts/Roboto-Regular.ttf')
doc.font('Roboto').fontSize(24).text('...')
```

**Option C: Utiliser @react-pdf/renderer (alternative)**
- Migration vers une lib plus serverless-friendly
- Pas de dépendance filesystem
- Effort: ~4h dev

---

## 📋 TEST EN PRODUCTION

### 1. Vérifier déploiement Vercel

```bash
# Attendre ~2 min que Vercel déploie f9062c4
# Dashboard Vercel > Deployments > Running...
```

### 2. Tester génération PDF admin

```bash
# Dans admin, cliquer "Générer PDF (test)"
# Aller dans Vercel > Functions > Logs
```

### 3. Analyser les logs

**✅ Succès attendu:**
```
[pdfGenerator] ========== DÉBUT GÉNÉRATION ==========
[pdfGenerator] Environment: production
[pdfGenerator] Platform: linux
[pdfGenerator] Création PDFDocument...
[pdfGenerator] PDFDocument créé
[pdfGenerator] Démarrage du rendu...
[pdfGenerator] Rendu en-tête
[pdfGenerator] Rendu titre
[pdfGenerator] Rendu infos client
...
[pdfGenerator] Finalisation du PDF
[pdfGenerator] ✅ PDF terminé, taille: 15234
```

**❌ Si crash (avec le bon log):**
```
[pdfGenerator] Rendu en-tête
[pdfGenerator] ❌ ERREUR PENDANT LE RENDU: Error: ENOENT...
[pdfGenerator] Message: ENOENT: no such file or directory, open '/var/task/.../Helvetica.afm'
[pdfGenerator] Code: ENOENT
[pdfGenerator] Stack: ...
```

→ Dans ce cas, appliquer **Option A ou B** ci-dessus

---

## 🎯 OBJECTIF FINAL

**Définition de "résolu":**

1. ✅ Clic "Générer PDF (test)" dans admin
2. ✅ Logs Vercel Functions: `[pdfGenerator] ✅ PDF terminé`
3. ✅ Aucune erreur `ENOENT` ou `Helvetica.afm`
4. ✅ Response 200 avec `pdf_path` rempli
5. ✅ Fichier PDF visible dans Supabase Storage
6. ✅ Champ `estimations.pdf_path` rempli en DB
7. ✅ Badge TEST visible dans UI admin

---

## 📊 ÉTAT ACTUEL

**Commit:** `f9062c4` (logs + double try/catch)  
**Status:** ⏳ En attente test production Vercel  
**Bloquant:** ENOENT Helvetica.afm (si persiste, appliquer Option A/B)  
**Next:** Vérifier logs Vercel après déploiement

**Les logs sont maintenant assez détaillés pour identifier EXACTEMENT où pdfkit tente de charger Helvetica.afm**
