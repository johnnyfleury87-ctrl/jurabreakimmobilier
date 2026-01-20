# 🔧 GUIDE DÉPLOIEMENT - FIX MODULE ESTIMATION

## ⚠️ IMPORTANT : EXÉCUTER DANS L'ORDRE

### ÉTAPE 1 : AUDIT DB PRODUCTION

1. **Se connecter à Supabase Dashboard > SQL Editor**

2. **Exécuter le fichier d'audit** : `supabase/checks/check_estimation_prod.sql`
   - Copier/coller tout le contenu dans l'éditeur SQL
   - Exécuter et sauvegarder les résultats
   - **NE PAS PASSER À L'ÉTAPE 2 SANS CES RÉSULTATS**

3. **Analyser les résultats :**
   - Vérifier si `user_id` existe dans estimations
   - Vérifier si `estimations_old` existe déjà
   - Noter les index existants
   - Noter les contraintes existantes

---

### ÉTAPE 2 : APPLIQUER LES MIGRATIONS CORRECTIVES ⚠️

**⚠️ RÈGLE ABSOLUE:** La migration 0011 est déjà appliquée en prod. **ON NE LA TOUCHE PLUS.**

**Appliquer les migrations correctives (100% additives):**

1. **Exécuter** : `supabase/migrations/0013_fix_estimation_schema.sql`
   - Ajoute `user_id` si absent (SANS FK vers profiles)
   - Ajoute toutes les colonnes manquantes (surface_habitable, etat_bien, etc.)
   - Migre les données depuis anciennes colonnes si elles existent
   - Crée les index manquants
   - Applique valeurs par défaut safe

2. **Vérifier :**
   ```sql
   -- Vérifier que user_id existe
   SELECT EXISTS(
     SELECT 1 FROM information_schema.columns 
     WHERE table_name='estimations' AND column_name='user_id'
   );
   -- Doit retourner true
   
   -- Vérifier colonnes critiques
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name='estimations' 
   AND column_name IN ('user_id', 'surface_habitable', 'etat_bien', 'code_postal')
   ORDER BY column_name;
   -- Doit retourner les 4 colonnes
   ```

3. **Exécuter** : `supabase/migrations/0014_fix_estimation_rls.sql`
   - Recrée les policies RLS avec user_id
   - S'assure que RLS est activé

4. **Vérifier :**
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename='estimations';
   -- Doit afficher les policies users et admins
   ```

---

### ÉTAPE 3 : ALIMENTER LES COMMUNES DU JURA

1. **Exécuter** : `supabase/seed/communes_jura_39.sql`
   - Ajoute ~100 communes du Jura avec codes postaux
   - Associe chaque commune à une zone de prix

2. **Vérifier :**
   ```sql
   SELECT COUNT(*) FROM estimation_communes;
   -- Doit retourner > 80
   
   SELECT code_postal, COUNT(*) 
   FROM estimation_communes 
   GROUP BY code_postal 
   ORDER BY code_postal;
   -- Vérifier la répartition
   ```

---

### ÉTAPE 4 : VÉRIFIER STORAGE BUCKET

```sql
-- Vérifier que le bucket 'estimations' existe
SELECT * FROM storage.buckets WHERE id='estimations';

-- Si absent, créer :
INSERT INTO storage.buckets (id, name, public)
VALUES ('estimations', 'estimations', false);
```

---

### ÉTAPE 5 : DÉPLOYER LE CODE (VERCEL)

1. **Commit et push les modifications :**
   ```bash
   git add .
   git commit -m "fix(estimation): migration v2 + schéma cohérent + suppression joins profiles"
   git push origin main
   ```

2. **Vérifier le déploiement Vercel :**
   - Aller sur Vercel Dashboard
   - Attendre le build (3-5 min)
   - Vérifier les logs : pas d'erreur de build

3. **Vérifier les variables d'environnement :**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **OBLIGATOIRE pour PDF**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

---

### ÉTAPE 6 : TESTS EN PRODUCTION

#### Test 1 : API Communes
```bash
curl "https://votre-domaine.com/api/estimation/communes?code_postal=39100"
```
**Résultat attendu :**
```json
{
  "success": true,
  "communes": [
    {"id": "...", "nom": "Dole", "code_postal": "39100", ...}
  ],
  "count": 5
}
```

#### Test 2 : Admin - Liste estimations
```bash
# Se connecter en tant qu'admin via l'interface
# Aller sur /admin/estimation
```
**Résultat attendu :**
- Liste des estimations chargée
- Pas d'erreur PGRST200
- Pas d'erreur "relation profiles"

#### Test 3 : Génération PDF Test
1. Se connecter en tant qu'admin
2. Aller sur `/admin/estimation`
3. Activer "Mode test PDF" dans les paramètres
4. Créer une estimation test OU sélectionner une existante
5. Cliquer "Générer PDF (test)"

**Résultat attendu :**
- Bouton "Générer PDF (test)" → 200 OK
- Message de succès
- PDF téléchargeable avec watermark "MODE TEST"

**Si erreur 500 :**
- Aller sur Vercel > Logs > Functions
- Chercher `[PDF TEST]` ou `PDF_TEST_ERROR`
- Noter l'erreur exacte (stack trace)

---

### ÉTAPE 7 : MIGRATION DES ANCIENNES DONNÉES (SI NÉCESSAIRE)

**Si vous aviez des estimations dans l'ancienne table `estimations_old` :**

```sql
-- Script de migration des données (adapter selon vos besoins)
INSERT INTO estimations (
  id,
  user_id,
  nom,
  prenom,
  email,
  motif,
  type_bien,
  surface_habitable,
  commune_nom,
  code_postal,
  etat_bien,
  formule,
  statut,
  created_at
)
SELECT 
  id,
  user_id,
  nom,
  prenom,
  email,
  'curiosite' as motif, -- Adapter selon vos données
  type_bien,
  COALESCE(surface_habitable, surface) as surface_habitable,
  COALESCE(commune, 'Non renseignée') as commune_nom,
  COALESCE(code_postal, '39000') as code_postal,
  CASE 
    WHEN etat_general = 'neuf' THEN 'tres_bon'
    WHEN etat_general = 'excellent' THEN 'tres_bon'
    WHEN etat_general = 'bon' THEN 'bon'
    WHEN etat_general = 'moyen' THEN 'correct'
    ELSE 'a_renover'
  END as etat_bien,
  COALESCE(formule, 'gratuite') as formule,
  COALESCE(statut, 'DRAFT') as statut,
  created_at
FROM estimations_old
WHERE NOT EXISTS (
  SELECT 1 FROM estimations WHERE estimations.id = estimations_old.id
);
```

---

### ÉTAPE 10 : CHECKLIST POST-DÉPLOIEMENT

- [ ] Audit DB exécuté et résultats sauvegardés
- [ ] Table `estimations` a le bon schéma (user_id, surface_habitable, etc.)
- [ ] Table `estimation_communes` contient > 80 communes
- [ ] RLS activé sur toutes les tables estimation
- [ ] Bucket Storage `estimations` existe et est privé
- [ ] Variables d'environnement Vercel correctes (surtout SERVICE_ROLE_KEY)
- [ ] Déploiement Vercel OK sans erreur
- [ ] API `/api/estimation/communes?code_postal=39100` retourne des communes
- [ ] Admin peut voir la liste des estimations sans erreur PGRST200
- [ ] Admin peut générer un PDF test avec succès
- [ ] Ancienne table `estimations_old` sauvegardée (si migration nécessaire)

---

## 🚨 EN CAS DE PROBLÈME

### Erreur PGRST200 "relationship profiles"
**Cause :** Code qui fait encore un join vers profiles
**Solution :**
```bash
# Rechercher dans le code
grep -r "profiles(" src/
grep -r "select('.*profiles" src/
```

### Erreur "column user_id does not exist"
**Cause :** Migration 0011 v2 pas appliquée
**Solution :** Exécuter ÉTAPE 3

### PDF 500 INTERNAL_ERROR
**Causes possibles :**
1. `SUPABASE_SERVICE_ROLE_KEY` manquante
2. Champ manquant dans estimation (surface_habitable, commune_nom, etc.)
3. Bucket Storage non créé

**Debug :**
```bash
# Logs Vercel
# Chercher "PDF_TEST_ERROR" ou "[PDF TEST]"
# Regarder la stack trace complète
```

### Communes vides dans le formulaire
**Causes :**
1. Seed pas exécuté
2. Code postal inexistant dans la table
3. RLS bloque l'accès public

**Solution :**
```sql
-- Vérifier communes
SELECT * FROM estimation_communes WHERE code_postal='39100';

-- Vérifier RLS
SELECT * FROM pg_policies WHERE tablename='estimation_communes';
```

---

## 📊 ÉTAT FINAL ATTENDU

### Structure DB
```
Tables estimation* créées ✅
- estimation_communes (avec ~100 communes Jura)
- estimation_zones (4 zones)
- estimation_coefficients (7 coefficients)
- estimation_options (7 options)
- estimation_marges (3 niveaux)
- estimation_mentions_legales (6 motifs)
- estimation_versions_regles (1 version initiale)
- estimation_parametres_globaux (2 paramètres)
- estimation_config_formules (3 formules)
- estimations (table principale avec nouveau schéma)
- estimations_old (ancienne table sauvegardée)
```

### Colonne estimations
```
✅ user_id UUID
✅ nom, prenom, email (dénormalisés)
✅ motif, motif_autre_detail
✅ type_bien, surface_habitable, surface_terrain
✅ commune_id, commune_nom, code_postal
✅ etat_bien (a_renover | correct | bon | tres_bon)
✅ options_selectionnees JSONB
✅ formule (gratuite | standard | premium)
✅ valeur_basse, valeur_mediane, valeur_haute
✅ niveau_fiabilite
✅ pdf_path, pdf_mode
```

### RLS activé
```
✅ estimations: users voient leurs propres + admins voient tout
✅ estimation_communes: lecture publique
✅ estimation_options: lecture publique
✅ Storage estimations: admins + service_role peuvent uploader
```

### Code
```
✅ Aucun join vers profiles depuis estimations
✅ pdfGenerator utilise le nouveau schéma
✅ API communes filtre par code_postal
✅ API generate-pdf-test avec logs complets
```

---

## 📞 SUPPORT

Si problème persistant :
1. Sauvegarder les logs Vercel complets
2. Sauvegarder le résultat de l'audit DB
3. Noter l'erreur exacte + stack trace
4. Partager les informations collectées
