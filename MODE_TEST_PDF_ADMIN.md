# MODE TEST PDF ADMIN - Documentation Complète
## Génération PDF en test sans paiement (19 janvier 2026)

---

## 🎯 OBJECTIF

Permettre aux administrateurs de **tester la génération de PDF** sans passer par un paiement Stripe réel, tout en **préservant la logique produit** côté client.

### Problème résolu :
- ❌ Avant : impossible de valider le rendu PDF sans payer 49€/149€
- ❌ Formule gratuite génère un PDF en test → casse la logique produit
- ❌ Pas de traçabilité entre PDF test et PDF production

### Solution implémentée :
- ✅ Switch admin "Mode test PDF" ON/OFF
- ✅ Endpoint dédié admin pour générer PDF test
- ✅ Watermark et bandeau "MODE TEST" sur les PDFs
- ✅ Colonne `pdf_mode` dans la DB (test/prod)
- ✅ Boutons dans l'interface admin par estimation

---

## 🔐 SÉCURITÉ

### Accès strictement ADMIN
- Endpoint : `POST /api/admin/estimation/[id]/generate-pdf-test`
- Vérification : `profiles.role = 'admin'` obligatoire
- Jamais accessible côté client
- Mode test doit être activé dans les paramètres

### Séparation test / prod
- PDFs test : préfixe `TEST_` dans le nom du fichier
- Colonne `estimations.pdf_mode` : `'test'` ou `'prod'`
- Watermark visible sur toutes les pages du PDF test
- Bandeau rouge en haut de page : "MODE TEST"

---

## 🗄️ MODIFICATIONS BASE DE DONNÉES

### Migration 0014 : Mode test PDF Admin

```sql
-- 1. Nouveau paramètre global
INSERT INTO estimation_parametres_globaux (cle, valeur, description)
VALUES (
  'mode_test_pdf_admin',
  false,
  'Permet aux admins de générer des PDFs test sans paiement'
);

-- 2. Colonne pdf_mode dans estimations
ALTER TABLE estimations 
ADD COLUMN pdf_mode VARCHAR(10) DEFAULT 'prod' 
CHECK (pdf_mode IN ('prod', 'test'));

-- 3. Index pour filtrage
CREATE INDEX idx_estimations_pdf_mode ON estimations(pdf_mode);

-- 4. MAJ PDFs existants en mode prod
UPDATE estimations 
SET pdf_mode = 'prod' 
WHERE pdf_path IS NOT NULL AND pdf_mode IS NULL;
```

### Structure finale table `estimations`
- `pdf_path` : chemin du fichier PDF
- `pdf_generated_at` : date de génération
- `pdf_mode` : **'test'** (admin) ou **'prod'** (après paiement)

---

## 🔧 MODIFICATIONS TECHNIQUES

### 1. Endpoint Admin : `/api/admin/estimation/[id]/generate-pdf-test`

**Fichier** : `src/app/api/admin/estimation/[id]/generate-pdf-test/route.js`

```javascript
export async function POST(request, { params }) {
  // 1. Vérifier role = 'admin'
  // 2. Vérifier mode_test_pdf_admin = true
  // 3. Récupérer l'estimation
  // 4. Appeler /api/pdf/generate avec test_mode: true
  // 5. Mettre à jour pdf_mode = 'test'
  // 6. Retourner succès + warning
}
```

**Sécurité** :
- Header `X-Admin-Test: true` pour authentifier l'appel
- Refuse si mode test désactivé
- Accessible uniquement aux admins

---

### 2. Endpoint Génération PDF : `/api/pdf/generate`

**Fichier** : `src/app/api/pdf/generate/route.js`

```javascript
export async function POST(request) {
  const { estimation_id, test_mode = false } = await request.json()
  
  // Vérifier header X-Admin-Test si test_mode
  const isAdminTest = request.headers.get('X-Admin-Test') === 'true'
  if (test_mode && !isAdminTest) {
    return 403 // Refusé
  }
  
  // Générer PDF avec watermark si test_mode
  const pdfBuffer = await generateEstimationPDF(estimation, formule, { testMode: test_mode })
  
  // Upload avec préfixe TEST_ si mode test
  const prefix = test_mode ? 'TEST_' : ''
  const fileName = `estimations/${prefix}estimation_${id}_${timestamp}.pdf`
  
  // Upload dans Supabase Storage
  await supabase.storage.from('estimations').upload(fileName, pdfBuffer)
  
  return { success: true, pdf_path: fileName, test_mode }
}
```

---

### 3. Générateur PDF avec Watermark TEST

**Fichier** : `src/lib/pdfGenerator.js`

**Modifications** :
```javascript
export async function generateEstimationPDF(estimation, formule, options = {}) {
  const { testMode = false } = options
  
  if (testMode) {
    // WATERMARK diagonal "MODE TEST" (opacité 15%)
    doc.save()
    doc.rotate(45, { origin: [300, 400] })
    doc.fontSize(60)
       .fillColor('#ff0000', 0.15)
       .text('MODE TEST', 100, 350, { width: 400, align: 'center' })
    doc.restore()
    
    // BANDEAU rouge en haut de page
    doc.rect(0, 0, 595, 30).fill('#ff0000')
    doc.fontSize(12)
       .fillColor('#ffffff')
       .text('⚠️ PDF GÉNÉRÉ EN MODE TEST - NE PAS UTILISER EN PRODUCTION', 50, 8)
  }
  
  // ... reste du PDF
}
```

**Résultat visuel** :
- Watermark "MODE TEST" en diagonale sur toutes les pages
- Bandeau rouge en haut : "⚠️ PDF GÉNÉRÉ EN MODE TEST"

---

### 4. Interface Admin - Switch et Boutons

**Fichier** : `src/app/admin/(protected)/estimation/page.js`

#### A. Switch "Mode test PDF (admin)"

Dans l'onglet **"Paramètres Globaux"** :

```jsx
<div className={styles.parametreItem}>
  <h4>🧪 MODE TEST PDF ADMIN</h4>
  <p>Permet aux admins de générer des PDFs test sans paiement</p>
  <label className={styles.switch}>
    <input
      type="checkbox"
      checked={param.valeur === true}
      onChange={(e) => onUpdateParametre('mode_test_pdf_admin', e.target.checked)}
    />
    <span className={styles.slider}></span>
  </label>
</div>
```

**Style spécial** : Bordure orange + fond clair pour le distinguer

---

#### B. Nouvel onglet "Estimations (Test PDF)"

Liste des estimations avec actions :

```jsx
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Client</th>
      <th>Formule</th>
      <th>PDF</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {estimations.map(est => (
      <tr>
        <td>#{est.id.slice(0, 8)}</td>
        <td>{est.profiles.nom} {est.profiles.prenom}</td>
        <td>🟢 Gratuite / 🔵 Standard / ⭐ Premium</td>
        <td>
          {est.pdf_path ? (
            <span>✅ Généré <Badge>{est.pdf_mode}</Badge></span>
          ) : (
            <span>❌ Aucun PDF</span>
          )}
        </td>
        <td>
          <button onClick={() => handleGeneratePDFTest(est.id)}>
            🧪 Générer PDF (test)
          </button>
          {est.pdf_path && (
            <button onClick={() => handleDownloadPDF(est)}>
              📥 Télécharger
            </button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Fonctions** :
- `handleGeneratePDFTest()` : Appelle l'endpoint admin
- `handleDownloadPDF()` : Télécharge depuis Supabase Storage

---

## 📊 LOGIQUE PRODUIT PRÉSERVÉE

### Côté Client (public)

#### 🟢 Formule Gratuite
- ✅ Affichage écran uniquement
- ❌ **Pas de PDF généré**
- ❌ Pas d'email
- ❌ Aucun bouton "Télécharger PDF"

#### 🔵 Standard (49€)
- ✅ Affiche "PDF après paiement"
- ✅ PDF généré en mode `prod` après Stripe
- ✅ Email si activé par admin

#### ⭐ Premium (149€)
- ✅ PDF détaillé en mode `prod` après Stripe
- ✅ Email automatique

---

### Côté Admin (test)

#### Mode test PDF = OFF (par défaut)
- Règles normales appliquées
- Pas de génération manuelle possible

#### Mode test PDF = ON
- **Admin peut générer PDF pour TOUTE formule**
- Même formule gratuite → PDF marqué `TEST`
- PDF stocké normalement (vérification storage)
- Colonne `pdf_mode = 'test'` dans DB
- Badge visible dans l'interface admin

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Activer le mode test
1. Se connecter en tant qu'admin
2. Aller dans **Admin > Estimation > Paramètres Globaux**
3. Activer le switch **"Mode test PDF (admin)"**
4. Vérifier message de confirmation

### Test 2 : Générer PDF test pour formule gratuite
1. Aller dans **Admin > Estimation > Estimations (Test PDF)**
2. Trouver une estimation avec `formule = 'gratuite'`
3. Cliquer sur **"🧪 Générer PDF (test)"**
4. Attendre confirmation : "✅ PDF test généré avec succès"
5. Vérifier badge **TEST** apparaît dans colonne PDF

### Test 3 : Télécharger et vérifier le PDF test
1. Cliquer sur **"📥 Télécharger"**
2. Ouvrir le PDF téléchargé
3. **Vérifier** :
   - ✅ Bandeau rouge en haut : "MODE TEST"
   - ✅ Watermark diagonal "MODE TEST" visible
   - ✅ Contenu de l'estimation correct
   - ✅ Nom du fichier commence par `TEST_`

### Test 4 : Vérifier DB
```sql
SELECT id, formule, pdf_path, pdf_mode, pdf_generated_at
FROM estimations
WHERE pdf_mode = 'test'
ORDER BY pdf_generated_at DESC;
```

**Attendu** :
- Ligne avec `pdf_mode = 'test'`
- `pdf_path` commence par `estimations/TEST_`
- `pdf_generated_at` rempli

### Test 5 : Vérifier Storage Supabase
1. Aller dans Supabase > Storage > estimations
2. Chercher fichiers commençant par `TEST_`
3. Vérifier taille et date de création
4. Télécharger directement depuis Storage
5. Comparer avec téléchargement depuis admin

### Test 6 : Désactiver le mode test
1. Désactiver le switch "Mode test PDF"
2. Essayer de générer un PDF test
3. **Vérifier erreur** : "Mode test PDF désactivé"

### Test 7 : Utilisateur non-admin
1. Se connecter avec un compte client
2. Vérifier que l'endpoint `/api/admin/estimation/[id]/generate-pdf-test` retourne **403 Forbidden**

### Test 8 : Génération PDF prod après paiement
1. Créer une estimation Standard
2. Payer via Stripe (webhookcallback)
3. Vérifier PDF généré avec `pdf_mode = 'prod'`
4. Vérifier **pas de watermark** dans le PDF prod

---

## 📋 CHECKLIST DÉPLOIEMENT

### Avant déploiement
- [x] Migration 0014 créée
- [x] Endpoint admin créé avec sécurité
- [x] Endpoint /api/pdf/generate créé
- [x] pdfGenerator.js modifié pour watermark
- [x] Interface admin mise à jour
- [x] Styles CSS ajoutés
- [ ] Tests manuels effectués (voir ci-dessus)

### Commandes de déploiement
```bash
# 1. Appliquer migration
psql $DATABASE_URL -f supabase/migrations/0014_mode_test_pdf_admin.sql

# 2. Vérifier paramètre créé
psql $DATABASE_URL -c "SELECT * FROM estimation_parametres_globaux WHERE cle = 'mode_test_pdf_admin';"

# 3. Vérifier colonne ajoutée
psql $DATABASE_URL -c "\d estimations" | grep pdf_mode

# 4. Push code
git add .
git commit -m "feat: Mode test PDF admin avec watermark + traçabilité"
git push origin main

# 5. Vérifier déploiement Vercel
# 6. Tester en production
```

### Après déploiement
- [ ] Activer le mode test
- [ ] Générer 1 PDF test par formule (gratuite, standard, premium)
- [ ] Vérifier watermarks présents
- [ ] Vérifier badges TEST dans admin
- [ ] Vérifier Storage Supabase
- [ ] Désactiver le mode test
- [ ] Confirmer que génération normale (prod) fonctionne

---

## ⚙️ CONFIGURATION ADMIN

### Paramètres globaux disponibles

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `service_actif` | Boolean | `true` | Active/désactive le service estimation |
| `generation_pdf_active` | Boolean | `true` | Autorise génération PDF (payant) |
| `envoi_email_auto_actif` | Boolean | `false` | Envoi email automatique |
| **`mode_test_pdf_admin`** | **Boolean** | **`false`** | **Mode test PDF admin** |

### Workflow recommandé

1. **En développement** :
   - Mode test PDF = **ON**
   - Tester tous les scénarios
   - Valider rendu PDF

2. **En production** :
   - Mode test PDF = **OFF** par défaut
   - Activer uniquement pour validation ponctuelle
   - Désactiver immédiatement après

---

## 🚨 POINTS D'ATTENTION

### Sécurité
- ⚠️ Mode test réservé UNIQUEMENT aux admins
- ⚠️ Vérifier role à chaque appel endpoint
- ⚠️ Header `X-Admin-Test` obligatoire
- ⚠️ Ne JAMAIS exposer côté client

### Logique produit
- ✅ Formule gratuite côté client = **jamais de PDF**
- ✅ Mode test n'affecte pas le comportement client
- ✅ PDFs test clairement identifiables (watermark + badge)
- ✅ Séparation stricte test/prod en DB

### Performance
- Les PDFs test sont stockés comme les PDFs prod
- Penser à nettoyer périodiquement les PDFs test anciens
- Filtrage facile via `pdf_mode = 'test'`

### Traçabilité
- Colonne `pdf_mode` permet de filtrer
- Prefix `TEST_` dans le nom de fichier
- Badge visible dans l'interface admin
- Logs serveur distincts `[PDF TEST]` vs `[PDF PROD]`

---

## 📞 SUPPORT

### En cas d'erreur "Mode test PDF désactivé"
→ Vérifier switch admin activé

### PDF généré mais pas de watermark
→ Vérifier paramètre `testMode` passé à `generateEstimationPDF()`

### Erreur 403 Forbidden
→ Vérifier role = 'admin' dans `profiles`

### PDF non trouvé dans Storage
→ Vérifier `pdf_path` dans table `estimations`
→ Chercher avec prefix `TEST_` ou `estimations/`

---

**Date d'implémentation** : 19 janvier 2026  
**Version** : 1.0  
**Statut** : ✅ Implémenté, prêt pour tests
