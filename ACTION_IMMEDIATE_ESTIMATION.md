# ⚡ ACTION IMMÉDIATE - MODULE ESTIMATION

## 🎯 CE QUI A ÉTÉ CORRIGÉ

✅ Migration 0011 v2 : 100% idempotente (peut être relancée)
✅ Migration repair : ajoute colonnes manquantes si ancien schéma
✅ Seed 100 communes Jura avec codes postaux
✅ Supprimé tous les joins vers `profiles` 
✅ PDF generator adapté au nouveau schéma
✅ Calculator adapte fiabilité selon formule
✅ Logs PDF détaillés avec stack trace

## 🚀 DÉPLOIEMENT EN 3 ÉTAPES

### 1️⃣ AUDIT DB (5 min)
```sql
-- Dans Supabase SQL Editor, exécuter:
-- supabase/checks/check_estimation_prod.sql

-- SAUVEGARDER les résultats
-- Noter: user_id existe? estimations_old existe?
```

### 2️⃣ MIGRATIONS DB (10 min)

**Cas A:** Table estimations n'existe pas OU vous voulez repartir de zéro
```sql
-- 1. Sauvegarder si besoin
ALTER TABLE estimations RENAME TO estimations_old;

-- 2. Exécuter migration v2
-- supabase/migrations/0011_estimation_complete_v2.sql

-- 3. Seed communes
-- supabase/seed/communes_jura_39.sql

-- 4. RLS
-- supabase/migrations/0012_estimation_rls.sql
```

**Cas B:** Table estimations existe avec ancien schéma (user_id manquant)
```sql
-- 1. Exécuter repair
-- supabase/migrations/0011b_repair_estimations_schema.sql

-- 2. Seed communes
-- supabase/seed/communes_jura_39.sql

-- 3. RLS
-- supabase/migrations/0012_estimation_rls.sql
```

### 3️⃣ DÉPLOYER CODE (5 min)
```bash
# Code déjà commité
git push origin main

# Attendre Vercel build (3-5 min)
```

## ✅ TESTS RAPIDES

```bash
# 1. API Communes
curl "https://votre-domaine.com/api/estimation/communes?code_postal=39100"
# Résultat attendu: {"success": true, "communes": [...], "count": 5}

# 2. Admin Estimations
# Se connecter → /admin/estimation
# Résultat attendu: liste charge sans erreur PGRST200

# 3. PDF Test
# Admin → Estimation → Activer "Mode test PDF"
# Bouton "Générer PDF test" → 200 + téléchargement OK
# PDF doit avoir watermark rouge "MODE TEST"
```

## 🚨 SI ERREUR

### PGRST200 "relationship profiles"
→ Encore un join quelque part. Chercher:
```bash
grep -r "profiles(" src/
```

### Erreur "column user_id does not exist"
→ Migration repair pas appliquée. Exécuter `0011b_repair_estimations_schema.sql`

### PDF 500 INTERNAL_ERROR
→ Vercel > Logs > Functions > Chercher `[PDF TEST]`
→ Noter stack trace complète
→ Vérifier `SUPABASE_SERVICE_ROLE_KEY` dans Vercel env

### Communes vides
→ Vérifier seed exécuté: `SELECT COUNT(*) FROM estimation_communes;`

## 📖 DOCS COMPLÈTES

- **Guide détaillé:** [GUIDE_DEPLOIEMENT_ESTIMATION_FIX.md](GUIDE_DEPLOIEMENT_ESTIMATION_FIX.md)
- **Résumé complet:** [RESUME_CORRECTIONS_ESTIMATION.md](RESUME_CORRECTIONS_ESTIMATION.md)

## ⏱️ TEMPS TOTAL: ~20 minutes

5 min audit + 10 min migrations + 5 min déploiement code = **20 min**

---

**Status:** Prêt pour prod ✅  
**Date:** 20 jan 2026  
**Commit:** `6522c0a`
