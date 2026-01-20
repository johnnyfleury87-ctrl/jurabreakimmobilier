# ⚡ MIGRATION CORRECTIVE - RÉSUMÉ

## ⚠️ RÈGLE ABSOLUE

**Migration 0011 déjà appliquée en prod → ON NE LA TOUCHE PLUS**

## ✅ NOUVELLES MIGRATIONS CRÉÉES (100% ADDITIVES)

### Migration 0013: Fix Schéma
**Fichier:** `supabase/migrations/0013_fix_estimation_schema.sql`

**Ajoute (si absent):**
- ✅ `user_id` UUID (SANS foreign key vers profiles)
- ✅ Champs client: `nom`, `prenom`, `email`, `telephone`
- ✅ `motif`, `motif_autre_detail`
- ✅ `surface_habitable` (migration depuis `surface` si existe)
- ✅ `surface_terrain`
- ✅ `commune_id`, `commune_nom` (migration depuis `commune`)
- ✅ `code_postal`
- ✅ `etat_bien` (migration depuis `etat_general`)
- ✅ `nb_pieces`, `nb_chambres`, `nb_salles_bain`, `exposition`, etc.
- ✅ `options_selectionnees` JSONB
- ✅ `consentement_accepte`, `consentement_ip`, `consentement_at`
- ✅ `formule`
- ✅ `version_regles_id`
- ✅ `calcul_inputs`, `calcul_detail`
- ✅ `valeur_basse`, `valeur_mediane`, `valeur_haute`
- ✅ `niveau_fiabilite`, `calcule_at`
- ✅ `pdf_mode`, `completed_at`
- ✅ Index: `user_id`, `email`, `code_postal`, `commune_id`
- ✅ Valeurs par défaut safe pour éviter NULL

**Peut être relancée sans erreur** ✅

---

### Migration 0014: Fix RLS
**Fichier:** `supabase/migrations/0014_fix_estimation_rls.sql`

**Actions:**
- ✅ DROP + CREATE policies utilisateurs (avec `user_id`)
- ✅ Policy "Users can view own estimations"
- ✅ Policy "Users can create own estimations"
- ✅ Policy "Users can update own estimations"
- ✅ Policies admin (view + update)
- ✅ Enable RLS sur `estimations`

**Peut être relancée sans erreur** ✅

---

## 🚀 DÉPLOIEMENT

### Ordre d'exécution:
1. **Audit DB** (5 min): `supabase/checks/check_estimation_prod.sql`
2. **Migration 0013** (2 min): Ajoute colonnes
3. **Migration 0014** (1 min): Fix RLS
4. **Seed communes** (1 min): 100 communes Jura

**Total: ~10 minutes**

---

## 🎯 POURQUOI CETTE APPROCHE

### ❌ Ce qu'on NE fait PAS:
- ❌ Modifier 0011 (déjà appliquée)
- ❌ Renommer tables
- ❌ Supprimer colonnes
- ❌ Casser l'existant

### ✅ Ce qu'on fait:
- ✅ Migrations ADDITIVES uniquement
- ✅ Ajouter ce qui manque
- ✅ Migrer données si anciennes colonnes existent
- ✅ Idempotent (relançable)
- ✅ Zéro downtime

---

## 📦 FICHIERS LIVRÉS

```
supabase/
├── migrations/
│   ├── 0011_estimation_complete.sql    [EXISTANTE - NE PAS TOUCHER]
│   ├── 0012_estimation_rls.sql         [EXISTANTE - NE PAS TOUCHER]
│   ├── 0013_fix_estimation_schema.sql  [NOUVELLE - ADDITIVE ✅]
│   └── 0014_fix_estimation_rls.sql     [NOUVELLE - FIX RLS ✅]
├── seed/
│   └── communes_jura_39.sql            [NOUVELLE - 100 communes ✅]
└── checks/
    └── check_estimation_prod.sql       [NOUVELLE - Audit ✅]
```

---

## ✅ CRITÈRES DE SUCCÈS

Après application:
- [ ] `SELECT column_name FROM information_schema.columns WHERE table_name='estimations' AND column_name='user_id'` → retourne 1 ligne
- [ ] `SELECT COUNT(*) FROM estimation_communes` → > 80
- [ ] `SELECT * FROM pg_policies WHERE tablename='estimations'` → policies actives
- [ ] Admin charge liste estimations sans PGRST200
- [ ] API communes retourne résultats
- [ ] PDF test se génère

---

**Stratégie:** Corriger sans casser ✅  
**Date:** 20 janvier 2026  
**Migrations:** 0013 + 0014 (additives)
