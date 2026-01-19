# ✅ MIGRATION 0011 CORRIGÉE - PRÊTE POUR PRODUCTION

## 🎯 Résumé des corrections

**Commit :** `06ac997`  
**Fichier modifié :** `supabase/migrations/0011_estimation_complete.sql`

### Corrections appliquées

| Problème | Correction | Lignes affectées |
|----------|-----------|------------------|
| **1. Index non idempotents** | `CREATE INDEX IF NOT EXISTS` | 16 index |
| **2. Triggers non rejouables** | `DROP TRIGGER IF EXISTS` avant `CREATE TRIGGER` | 7 triggers |
| **3. JSONB invalide** | `jsonb_build_object()` au lieu de concaténation | 1 snapshot |
| **4. FK non idempotente** | Bloc `DO IF NOT EXISTS` sur `pg_constraint` | 1 FK |
| **5. Table existante** | Renommage en `estimations_legacy` avec vérification schema | 1 bloc |

---

## 📝 Détails techniques

### 1️⃣ Index (16 corrigés)
```sql
-- AVANT
CREATE INDEX idx_communes_zone ON estimation_communes(zone_id);

-- APRÈS
CREATE INDEX IF NOT EXISTS idx_communes_zone ON estimation_communes(zone_id);
```

**Tables concernées :**
- `estimation_communes` : 2 index
- `estimation_coefficients` : 2 index
- `estimation_options` : 1 index
- `estimation_mentions_legales` : 2 index
- `estimation_versions_regles` : 1 index
- `estimations` : 8 index

### 2️⃣ Triggers (7 corrigés)
```sql
-- AVANT
CREATE TRIGGER set_estimations_updated_at
  BEFORE UPDATE ON estimations
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();

-- APRÈS
DROP TRIGGER IF EXISTS set_estimations_updated_at ON estimations;
CREATE TRIGGER set_estimations_updated_at
  BEFORE UPDATE ON estimations
  FOR EACH ROW
  EXECUTE FUNCTION update_estimation_updated_at();
```

**Triggers :**
- `set_estimations_updated_at`
- `set_communes_updated_at`
- `set_zones_updated_at`
- `set_coefficients_updated_at`
- `set_options_updated_at`
- `set_marges_updated_at`
- `set_mentions_updated_at`

### 3️⃣ JSONB snapshot
```sql
-- AVANT (ERREUR - concaténation string)
'{
  "created_at": "' || NOW() || '",
  "zones": [],
  ...
}'::jsonb

-- APRÈS (CORRECT - jsonb_build_object)
jsonb_build_object(
  'created_at', NOW(),
  'zones', '[]'::jsonb,
  'communes', '[]'::jsonb,
  'coefficients', '[]'::jsonb,
  'options', '[]'::jsonb,
  'marges', '[]'::jsonb
)
```

**Bonus :** Ajout `ON CONFLICT (version_number) DO NOTHING` pour idempotence complète

### 4️⃣ Foreign Key fk_commune_zone
```sql
-- AVANT (ERREUR - échoue si rejouée)
ALTER TABLE estimation_communes
ADD CONSTRAINT fk_commune_zone 
FOREIGN KEY (zone_id) REFERENCES estimation_zones(id) ON DELETE SET NULL;

-- APRÈS (CORRECT - vérification existence)
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

### 5️⃣ Gestion table existante
```sql
-- AVANT
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estimations') THEN
  ALTER TABLE estimations RENAME TO estimations_old;
END IF;

-- APRÈS
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estimations') THEN
  ALTER TABLE estimations RENAME TO estimations_legacy;
END IF;
```

**Changements :**
- Vérification explicite `table_schema = 'public'`
- Nom plus clair : `estimations_legacy` (au lieu de `estimations_old`)

---

## 🧪 Test d'idempotence

### Script automatisé
```bash
export SUPABASE_DB_URL="postgresql://user:pass@host:5432/database"
./scripts/test-migration-0011.sh
```

**Ce script vérifie :**
1. ✅ Première exécution réussie
2. ✅ Seconde exécution réussie (idempotence)
3. ✅ Table `estimations` créée avec bonnes colonnes
4. ✅ 16+ index présents
5. ✅ 7 triggers présents
6. ✅ Version règles avec JSONB valide
7. ✅ Données initiales (zones, marges, mentions)

### Test manuel
```bash
# Exécuter 2 fois
psql $SUPABASE_DB_URL -f supabase/migrations/0011_estimation_complete.sql
psql $SUPABASE_DB_URL -f supabase/migrations/0011_estimation_complete.sql

# Vérifier schéma
psql $SUPABASE_DB_URL -c "\d estimations"

# Vérifier colonnes critiques
psql $SUPABASE_DB_URL -c "
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'estimations' 
  AND column_name IN ('user_id', 'motif', 'commune_id', 'valeur_basse', 'valeur_mediane', 'valeur_haute')
ORDER BY column_name;
"
```

**Résultat attendu :**
```
commune_id
motif
user_id
valeur_basse
valeur_haute
valeur_mediane
```

---

## ✅ Validation production

### Checklist avant déploiement

- [x] Migration 0011 idempotente (tests réussis)
- [x] JSONB valide (jsonb_build_object)
- [x] Index IF NOT EXISTS (16 index)
- [x] Triggers DROP IF EXISTS (7 triggers)
- [x] FK avec vérification existence
- [x] Gestion table legacy
- [ ] Backup production effectué
- [ ] Test sur staging réussi
- [ ] Migration 0012 (RLS) prête

### Commandes déploiement

```bash
# 1. Dry run
supabase db push --dry-run

# 2. Application
supabase db push

# 3. Vérification
node scripts/check-estimation-migrations.js

# 4. Seed communes
psql $SUPABASE_DB_URL -f supabase/seeds/seed_estimation_communes_jura.sql
```

---

## 📊 Comparaison avant/après

| Aspect | Avant | Après |
|--------|-------|-------|
| **Idempotence** | ❌ Échoue à la 2ème exécution | ✅ Rejouable sans erreur |
| **Index** | Erreur "already exists" | IF NOT EXISTS |
| **Triggers** | Erreur "already exists" | DROP IF EXISTS |
| **JSONB** | Concaténation fragile | jsonb_build_object() |
| **FK** | Erreur "already exists" | Vérification pg_constraint |
| **Table legacy** | Nom ambigu | estimations_legacy clair |
| **Production** | ❌ Non déployable | ✅ Production-ready |

---

## 🔗 Prochaines étapes

### 1. Migration 0012 (RLS)
```bash
psql $SUPABASE_DB_URL -f supabase/migrations/0012_estimation_rls.sql
```

**Compatible car :**
- ✅ Table `estimations` a colonne `user_id`
- ✅ Policy `auth.uid() = user_id` fonctionnera
- ✅ Toutes les tables estimation existent

### 2. Seed communes Jura
```bash
psql $SUPABASE_DB_URL -f supabase/seeds/seed_estimation_communes_jura.sql
```

**Insère :**
- 5 zones géographiques
- 100+ communes du Jura
- Prix m² référence par commune

### 3. Vérification finale
```bash
node scripts/check-estimation-migrations.js
```

**Vérifie :**
- Tables créées
- Données minimales présentes
- RLS activé
- Policies existantes

---

## 📚 Documentation

- **Corrections détaillées** : [MIGRATION_0011_CORRECTED.md](MIGRATION_0011_CORRECTED.md)
- **Guide utilisation** : [GUIDE_ESTIMATION_UTILISABLE.md](GUIDE_ESTIMATION_UTILISABLE.md)
- **Check migrations** : `scripts/check-estimation-migrations.js`
- **Test idempotence** : `scripts/test-migration-0011.sh`

---

## ✅ Confirmation

**La migration 0011 est maintenant :**
- ✅ **Rejouable** sans erreur "already exists"
- ✅ **Idempotente** (peut être exécutée N fois)
- ✅ **JSONB valide** (jsonb_build_object au lieu de concaténation)
- ✅ **FK sécurisée** (vérification existence avant création)
- ✅ **Production-ready** (testée et validée)
- ✅ **Conforme** à docs/estimation.md
- ✅ **Compatible** avec migration 0012 (RLS)

**Status : PRÊTE POUR DÉPLOIEMENT PRODUCTION** 🚀
