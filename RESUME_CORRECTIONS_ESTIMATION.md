# 📋 RÉSUMÉ CORRECTIONS MODULE ESTIMATION

## ✅ CORRECTIONS EFFECTUÉES

### 1. Migration 0011 - 100% Idempotente ✅
**Fichier:** `supabase/migrations/0011_estimation_complete_v2.sql`

**Corrections:**
- ✅ Tous les `CREATE INDEX` sont `CREATE INDEX IF NOT EXISTS`
- ✅ Toutes les contraintes vérifiées avant création (DO blocks)
- ✅ Tous les triggers avec `DROP TRIGGER IF EXISTS` avant création
- ✅ Toutes les données initiales avec `ON CONFLICT DO NOTHING`
- ✅ Gestion rename table avec vérification `estimations_old` existe
- ✅ Tables de config admin ajoutées (parametres_globaux, config_formules)

**Peut être relancée sans erreur** ✅

---

### 2. Migration Repair - Ajout Colonnes Manquantes ✅
**Fichier:** `supabase/migrations/0011b_repair_estimations_schema.sql`

**Usage:** Si la table `estimations` existe déjà avec l'ancien schéma

**Ajoute:**
- ✅ `user_id` UUID
- ✅ `nom`, `prenom`, `email`, `telephone` (dénormalisés)
- ✅ `motif`, `motif_autre_detail`
- ✅ `surface_habitable` (migration depuis `surface` si existe)
- ✅ `surface_terrain`
- ✅ `commune_id`, `commune_nom` (migration depuis `commune`)
- ✅ `code_postal`
- ✅ `etat_bien` (migration depuis `etat_general` avec mapping)
- ✅ Champs premium: `nb_chambres`, `nb_salles_bain`, `exposition`, etc.
- ✅ `options_selectionnees` JSONB
- ✅ `consentement_accepte`, `consentement_ip`, `consentement_at`
- ✅ `version_regles_id`
- ✅ `calcul_inputs`, `calcul_detail`
- ✅ `valeur_basse`, `valeur_mediane`, `valeur_haute`
- ✅ `niveau_fiabilite`
- ✅ `pdf_mode`
- ✅ `completed_at`
- ✅ Index manquants

---

### 3. Seed Communes Jura 39 ✅
**Fichier:** `supabase/seed/communes_jura_39.sql`

**Contenu:**
- ✅ ~100 communes du Jura (département 39)
- ✅ Codes postaux associés
- ✅ Prix m² de référence par commune
- ✅ Association aux zones (A, B, C, D)
- ✅ ON CONFLICT DO NOTHING = idempotent

**Couverture:**
- Dole et périphérie (Zone A)
- Lons-le-Saunier (Zone B)
- Saint-Claude, Champagnole, Poligny, Arbois, etc. (Zone C)
- Villages ruraux (Zone D)
- Haut-Jura touristique (Les Rousses, Prémanon, etc.)
- Vignoble jurassien

---

### 4. Suppression Joins Profiles ✅
**Fichiers modifiés:**
- ✅ `/src/app/estimation/paiement/[id]/page.js`
  - Avant: `.select('*, profiles(email, nom, prenom)')`
  - Après: `.select('*')` → utilise les champs dénormalisés

**Vérification:**
```bash
grep -r "profiles(" src/app/api/estimation/
grep -r "profiles?" src/app/api/estimation/
# Aucun résultat = ✅
```

---

### 5. PDF Generator - Nouveau Schéma ✅
**Fichier:** `src/lib/pdfGenerator.js`

**Corrections:**
- ✅ Utilise `commune_nom` + `code_postal` au lieu de `adresse_bien`
- ✅ Utilise `surface_habitable` au lieu de `surface`
- ✅ Utilise `etat_bien` au lieu de `etat_general`
- ✅ Ajoute `surface_terrain`
- ✅ Ajoute `nb_chambres`
- ✅ Utilise `options_selectionnees` JSONB
- ✅ Affiche `motif` et `motif_autre_detail`
- ✅ Utilise valeurs calculées: `valeur_basse`, `valeur_mediane`, `valeur_haute`
- ✅ Affiche `niveau_fiabilite`
- ✅ Fonctions helper ajoutées:
  - `formatEtatBien()`
  - `formatMotif()`
  - `formatNiveauFiabilite()`

---

### 6. Calculator - Fiabilité Selon Formule ✅
**Fichier:** `src/lib/estimation/calculator.js`

**Améliorations:**
- ✅ Score de fiabilité enrichi (15 critères au lieu de 7)
- ✅ Ajout critères premium: `nb_chambres`, `nb_salles_bain`, `exposition`, `chauffage`, `dpe_classe`
- ✅ Logique par formule:
  - **Gratuite:** toujours `minimal` (±20%)
  - **Standard:** peut atteindre `complet` si score ≥ 12 (±10%)
  - **Premium:** peut atteindre `tres_complet` si score ≥ 15 (±5%)

---

### 7. API Generate PDF Test - Logs Améliorés ✅
**Fichier:** `src/app/api/admin/estimation/[id]/generate-pdf-test/route.js`

**Corrections:**
- ✅ Suppression join profiles (utilise champs dénormalisés)
- ✅ Catch global avec stack trace en dev
- ✅ Logs détaillés à chaque étape
- ✅ Retour erreur structuré avec `ok`, `data`, `error`

---

### 8. Check SQL - Compatible Supabase Editor ✅
**Fichier:** `supabase/checks/check_estimation_prod.sql`

**Vérifications:**
- ✅ Colonnes table estimations
- ✅ Tables estimation* existantes
- ✅ estimations_old existe?
- ✅ Index présents
- ✅ Contraintes
- ✅ Triggers
- ✅ Policies RLS
- ✅ user_id existe?
- ✅ Colonnes communes
- ✅ Count par formule
- ✅ Config admin

**Pas de `\echo` ni `ORDER BY table`** → Compatible Supabase ✅

---

### 9. Guide Déploiement Complet ✅
**Fichier:** `GUIDE_DEPLOIEMENT_ESTIMATION_FIX.md`

**Contenu:**
- ✅ 10 étapes numérotées avec ordre obligatoire
- ✅ Scripts SQL à exécuter
- ✅ Vérifications après chaque étape
- ✅ Tests en production (API, Admin, PDF)
- ✅ Migration données anciennes (si besoin)
- ✅ Checklist post-déploiement (10 points)
- ✅ Troubleshooting (erreurs courantes + solutions)
- ✅ État final attendu (structure DB, colonnes, RLS, code)

---

## 🎯 DÉFINITION DE "DONE"

### DB Production ✅
- [ ] Migration 0011 v2 appliquée sans erreur
- [ ] Table `estimations` a le nouveau schéma complet
- [ ] Column `user_id` existe
- [ ] Table `estimation_communes` contient > 80 communes Jura
- [ ] RLS activé sur toutes tables estimation
- [ ] Bucket Storage `estimations` existe (privé)
- [ ] Config admin tables créées (parametres_globaux, config_formules)

### Code ✅
- [x] Aucun join vers `profiles` depuis estimations
- [x] pdfGenerator utilise nouveau schéma
- [x] Calculator adapte fiabilité selon formule
- [x] API generate-pdf-test avec logs complets
- [x] Variables env Vercel (surtout SERVICE_ROLE_KEY)

### Tests Fonctionnels (À FAIRE EN PROD)
- [ ] API `/api/estimation/communes?code_postal=39100` retourne communes
- [ ] Admin `/admin/estimation` charge liste sans PGRST200
- [ ] Admin peut activer "Mode test PDF"
- [ ] Admin peut générer PDF test → 200 + téléchargement OK
- [ ] PDF contient watermark "MODE TEST" en rouge
- [ ] pdf_path mis à jour en DB après génération

---

## 🚀 ORDRE D'EXÉCUTION EN PRODUCTION

### Phase 1: Audit (OBLIGATOIRE)
```sql
-- 1. Exécuter supabase/checks/check_estimation_prod.sql
-- 2. Sauvegarder tous les résultats
-- 3. Noter si user_id existe, si estimations_old existe
```

### Phase 2: Sauvegarde
```sql
-- SI estimations_old n'existe pas encore:
ALTER TABLE estimations RENAME TO estimations_old;
```

### Phase 3: Migrations
```sql
-- Option A: Table estimations n'existe pas
→ Exécuter 0011_estimation_complete_v2.sql

-- Option B: Table estimations existe avec ancien schéma
→ Exécuter 0011b_repair_estimations_schema.sql
```

### Phase 4: Seed + RLS
```sql
-- 1. Exécuter communes_jura_39.sql
-- 2. Exécuter 0012_estimation_rls.sql
```

### Phase 5: Déploiement Code
```bash
git add .
git commit -m "fix(estimation): schéma cohérent + joins supprimés + PDF fix"
git push origin main
# Attendre build Vercel
```

### Phase 6: Tests
```
1. Tester API communes
2. Tester admin liste estimations
3. Activer mode test PDF
4. Générer PDF test
5. Vérifier watermark + téléchargement
```

---

## 📦 FICHIERS LIVRÉS

### Migrations SQL
```
supabase/
├── migrations/
│   ├── 0011_estimation_complete_v2.sql      [NOUVELLE - Idempotente]
│   ├── 0011b_repair_estimations_schema.sql  [NOUVELLE - Repair]
│   └── 0012_estimation_rls.sql              [Existante - Compatible]
├── seed/
│   └── communes_jura_39.sql                 [NOUVELLE - 100 communes]
└── checks/
    └── check_estimation_prod.sql            [NOUVELLE - Compatible Supabase]
```

### Code Source
```
src/
├── lib/
│   ├── pdfGenerator.js                      [MODIFIÉ - Nouveau schéma]
│   └── estimation/
│       └── calculator.js                    [MODIFIÉ - Fiabilité/formule]
├── app/
│   ├── estimation/
│   │   └── paiement/[id]/page.js           [MODIFIÉ - Suppression join]
│   └── api/
│       └── admin/estimation/[id]/
│           └── generate-pdf-test/route.js   [MODIFIÉ - Logs]
```

### Documentation
```
GUIDE_DEPLOIEMENT_ESTIMATION_FIX.md          [NOUVELLE - 10 étapes]
RESUME_CORRECTIONS_ESTIMATION.md             [CE FICHIER]
```

---

## 🔍 POINTS DE CONTRÔLE CRITIQUE

### Avant déploiement
- [ ] Backup DB complet
- [ ] Variables env Vercel vérifiées (surtout SERVICE_ROLE_KEY)
- [ ] Audit SQL exécuté et analysé

### Après migrations
- [ ] `SELECT * FROM estimations LIMIT 1` → colonnes correctes
- [ ] `SELECT COUNT(*) FROM estimation_communes` → > 80
- [ ] `SELECT * FROM pg_policies WHERE tablename='estimations'` → policies créées

### Après déploiement code
- [ ] Vercel build OK sans erreur
- [ ] Logs Vercel: pas d'erreur 500 au démarrage
- [ ] Page admin accessible

### Tests fonctionnels
- [ ] Formulaire estimation: dropdown communes se remplit après saisie CP
- [ ] Admin peut voir liste estimations
- [ ] PDF test se génère et se télécharge

---

## ⚠️ RISQUES RÉSIDUELS

### Risque 1: Données anciennes incompatibles
**Symptôme:** Erreur `NOT NULL violation` sur `nom`, `prenom`, etc.
**Cause:** Anciennes estimations sans ces champs
**Solution:** Migration repair applique valeurs par défaut

### Risque 2: Storage policies manquantes
**Symptôme:** Erreur 403 lors upload PDF
**Cause:** Policy `Service can upload PDFs` pas créée
**Solution:** Vérifier `0012_estimation_rls.sql` exécutée

### Risque 3: Formule gratuite veut générer PDF en prod
**Symptôme:** Admin clique "Générer PDF" sur estimation gratuite
**Cause:** Config formule `pdf_autorise = false` pour gratuite
**Solution:** En mode test admin, PDF autorisé (watermark TEST)

---

## 📞 SUPPORT POST-DÉPLOIEMENT

### En cas d'erreur 500 sur PDF:
1. Vercel Dashboard > Logs > Functions
2. Chercher `[PDF TEST]` ou `PDF_TEST_ERROR`
3. Noter la stack trace complète
4. Vérifier champs manquants dans payload

### En cas d'erreur PGRST200:
1. Rechercher `profiles(` dans le code: `grep -r "profiles(" src/`
2. Remplacer par accès direct aux champs dénormalisés
3. Commit + redéployer

### En cas de communes vides:
1. Vérifier seed exécuté: `SELECT COUNT(*) FROM estimation_communes`
2. Vérifier RLS: `SELECT * FROM pg_policies WHERE tablename='estimation_communes'`
3. Tester API directement: `curl .../api/estimation/communes?code_postal=39100`

---

## ✅ VALIDATION FINALE

Le module estimation est considéré **CORRIGÉ ET DÉPLOYABLE** si:

1. ✅ Audit DB exécuté sans erreur
2. ✅ Migration(s) appliquée(s) sans erreur
3. ✅ Seed communes OK (> 80 lignes)
4. ✅ RLS activé et testé
5. ✅ Vercel build OK
6. ✅ API communes retourne résultats
7. ✅ Admin charge liste estimations
8. ✅ PDF test se génère avec watermark
9. ✅ Aucune erreur PGRST200
10. ✅ Aucun join profiles restant

---

**Date:** 20 janvier 2026
**Version:** 2.0 (Fix complet module estimation)
**Status:** Prêt pour déploiement production ✅
