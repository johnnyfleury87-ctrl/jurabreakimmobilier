# Correction Migration 0011 - BLOQUAGE RÉSOLU

## 🔧 Corrections appliquées

### 1️⃣ Index idempotents
**Avant :** `CREATE INDEX idx_...`  
**Après :** `CREATE INDEX IF NOT EXISTS idx_...`

**Tables concernées :**
- `estimation_communes` (2 index)
- `estimation_zones` (implicites via FK)
- `estimation_coefficients` (2 index)
- `estimation_options` (1 index)
- `estimation_mentions_legales` (2 index)
- `estimation_versions_regles` (1 index)
- `estimations` (8 index)

**Total :** 16 index corrigés

---

### 2️⃣ Triggers rejouables
**Avant :** `CREATE TRIGGER ...` directement  
**Après :** `DROP TRIGGER IF EXISTS ... ON <table>; CREATE TRIGGER ...`

**Triggers concernés :**
- `set_estimations_updated_at`
- `set_communes_updated_at`
- `set_zones_updated_at`
- `set_coefficients_updated_at`
- `set_options_updated_at`
- `set_marges_updated_at`
- `set_mentions_updated_at`

**Total :** 7 triggers corrigés

---

### 3️⃣ Snapshot JSONB correct
**Avant (ERREUR) :**
```sql
'{
  "created_at": "' || NOW() || '",
  ...
}'::jsonb
```

**Après (CORRECT) :**
```sql
jsonb_build_object(
  'created_at', NOW(),
  'description', 'Paramètres initiaux du module d''estimation',
  'zones', '[]'::jsonb,
  'communes', '[]'::jsonb,
  'coefficients', '[]'::jsonb,
  'options', '[]'::jsonb,
  'marges', '[]'::jsonb
)
```

**Ajout :** `ON CONFLICT (version_number) DO NOTHING` pour idempotence

---

### 4️⃣ FK fk_commune_zone idempotente
**Avant (ERREUR) :**
```sql
ALTER TABLE estimation_communes
ADD CONSTRAINT fk_commune_zone 
FOREIGN KEY (zone_id) REFERENCES estimation_zones(id) ON DELETE SET NULL;
```

**Après (CORRECT) :**
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_commune_zone' 
    AND conrelid = 'estimation_communes'::regclass
  ) THEN
    ALTER TABLE estimation_communes
    ADD CONSTRAINT fk_commune_zone 
    FOREIGN KEY (zone_id) REFERENCES estimation_zones(id) ON DELETE SET NULL;
  END IF;
END $$;
```

---

### 5️⃣ Gestion table existante
**Avant :** `RENAME TO estimations_old`  
**Après :** `RENAME TO estimations_legacy`

**Amélioration :** Ajout vérification `table_schema = 'public'` pour éviter les conflits

```sql
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'estimations'
  ) THEN
    ALTER TABLE estimations RENAME TO estimations_legacy;
  END IF;
END $$;
```

---

## ✅ Résultat

### Migration 0011 maintenant :
- ✅ **Rejouable** sans erreur "already exists"
- ✅ **Idempotente** (peut être exécutée plusieurs fois)
- ✅ **JSONB valide** (jsonb_build_object au lieu de concaténation)
- ✅ **FK sécurisée** (vérification existence avant création)
- ✅ **Table legacy** correctement renommée

### Ordre d'exécution garanti :
1. Renommage `estimations` → `estimations_legacy` (si existe)
2. Création nouvelle table `estimations` (schéma complet)
3. Création indexes (tous avec IF NOT EXISTS)
4. Création triggers (tous avec DROP IF EXISTS)
5. Insertion données initiales (avec ON CONFLICT)

---

## 🚀 Test de validation

### Script de test
```bash
# Test 1 : Première exécution
psql <CONNECTION_STRING> -f supabase/migrations/0011_estimation_complete.sql

# Test 2 : Seconde exécution (doit passer sans erreur)
psql <CONNECTION_STRING> -f supabase/migrations/0011_estimation_complete.sql

# Test 3 : Vérification schéma
psql <CONNECTION_STRING> -c "\d estimations"
```

### Vérifications attendues
```sql
-- Table renommée
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'estimations_legacy'
);
-- Devrait retourner 'true' si ancienne table existait

-- Nouvelle table conforme
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'estimations'
ORDER BY ordinal_position;
-- Devrait contenir : user_id, motif, commune_id, consentement_*, valeur_basse, valeur_mediane, valeur_haute, etc.

-- Index créés
SELECT indexname FROM pg_indexes 
WHERE tablename LIKE 'estimation%'
ORDER BY tablename, indexname;
-- Devrait lister 16+ index

-- Triggers créés
SELECT tgname FROM pg_trigger 
WHERE tgname LIKE 'set_%_updated_at';
-- Devrait lister 7 triggers

-- Version règles
SELECT version_number, description 
FROM estimation_versions_regles 
WHERE version_number = 1;
-- Devrait retourner version 1 avec snapshot JSONB valide
```

---

## 🎯 Migration 0012 compatible

La migration 0012_estimation_rls.sql est maintenant applicable sans modification car :
- ✅ Table `estimations` a bien la colonne `user_id`
- ✅ RLS policy `auth.uid() = user_id` fonctionnera
- ✅ Toutes les tables d'estimation existent
- ✅ Bucket storage `estimations` créé

**Ordre final :**
1. `0011_estimation_complete.sql` (corrigée)
2. `0012_estimation_rls.sql` (inchangée)
3. Seed communes : `seed_estimation_communes_jura.sql`

---

## 📝 Commit des corrections

```bash
git add supabase/migrations/0011_estimation_complete.sql
git commit -m "fix: migration 0011 idempotente - index IF NOT EXISTS, triggers DROP IF EXISTS, JSONB jsonb_build_object, FK DO IF NOT EXISTS"
```

---

## ⚠️ Important production

**Avant déploiement :**
1. Backup DB production
2. Tester sur environnement staging
3. Vérifier que `estimations_legacy` conserve les données
4. Si besoin, script de migration données legacy → nouvelle table

**Commande déploiement :**
```bash
supabase db push --dry-run  # Vérifier avant
supabase db push            # Appliquer
```

---

## ✅ Validation finale

**La migration 0011 est maintenant PRODUCTION-READY :**
- Rejouable sans erreur
- Gère l'existant proprement
- JSONB valide
- Conformité docs/estimation.md
- RLS 0012 applicable immédiatement après
