# Module Estimation - Guide d'utilisation

## 📋 Fichiers créés

### 1. Vérification des migrations

- **`supabase/checks/check_estimation_migrations.sql`**
  - Script SQL de vérification complète
  - Vérifie l'existence des 8 tables
  - Vérifie les données minimales
  - Vérifie RLS et policies
  - Vérifie les indexes

- **`scripts/check-estimation-migrations.js`**
  - Script Node de vérification automatisé
  - Sortie formatée avec statut OK/KO
  - Exit code 0 si OK, 1 si erreurs

### 2. Dataset & Seed communes Jura

- **`docs/data/communes-jura.csv`**
  - 210+ communes du Jura
  - 5 zones (Centre, Nord, Haut-Jura, Vignoble, Petite Montagne)
  - Prix m² référence par commune

- **`supabase/seeds/seed_estimation_communes_jura.sql`**
  - Seed SQL complet
  - Crée les zones avec UUID fixes
  - Insère toutes les communes
  - Gestion des conflits (ON CONFLICT DO UPDATE)
  - Vérifications finales

### 3. API & UX

- **`src/app/api/estimation/communes/route.js`**
  - GET `/api/estimation/communes?code_postal=xxxxx`
  - Retourne communes actives pour le code postal

- **`src/components/estimation/EstimationForm.js`** (modifié)
  - Champ "Code postal" en premier
  - Champ "Commune" désactivé jusqu'à saisie code postal
  - Auto-sélection si commune unique
  - Chargement dynamique des communes

- **`src/app/admin/(protected)/page.js`** (modifié)
  - Ajout lien "📐 Estimation" dans sidebar

---

## 🚀 Exécution

### 1) Vérifier que les migrations sont appliquées

**Option A : Script SQL**
```bash
psql <SUPABASE_CONNECTION_STRING> -f supabase/checks/check_estimation_migrations.sql
```

**Option B : Script Node**
```bash
node scripts/check-estimation-migrations.js
```

**Résultat attendu :**
```
✅ RÉSULTAT : Toutes les migrations sont OK
```

**Si KO :**
```bash
supabase db push
```

---

### 2) Seed des communes du Jura

**Méthode 1 : Via psql**
```bash
psql <SUPABASE_CONNECTION_STRING> -f supabase/seeds/seed_estimation_communes_jura.sql
```

**Méthode 2 : Via Supabase CLI**
```bash
supabase db reset --seed
# OU
cat supabase/seeds/seed_estimation_communes_jura.sql | supabase db execute
```

**Méthode 3 : Via Dashboard Supabase**
1. Aller dans SQL Editor
2. Copier-coller le contenu de `seed_estimation_communes_jura.sql`
3. Exécuter

**Vérification :**
```sql
SELECT COUNT(*) FROM estimation_communes WHERE actif = true;
-- Devrait retourner 100+ communes

SELECT z.nom as zone, COUNT(c.id) as nb_communes
FROM estimation_zones z
LEFT JOIN estimation_communes c ON c.zone_id = z.id
GROUP BY z.nom;
```

---

### 3) Tester le flux complet

#### A) Accès admin

1. **Connexion admin**
   ```
   http://localhost:3000/admin/login
   ```

2. **Dashboard → Estimation**
   - Cliquer sur "📐 Estimation" dans le menu
   - Vérifier l'affichage des 7 onglets :
     - Communes
     - Zones
     - Coefficients
     - Options / Plus-values
     - Marges Fourchette
     - Mentions légales
     - Versioning

3. **Test paramétrage**
   - Onglet "Zones" : vérifier 5 zones chargées
   - Onglet "Communes" : vérifier 100+ communes
   - Onglet "Marges" : vérifier 3 niveaux (minimal, complet, très complet)

#### B) Parcours client estimation

1. **Page estimation**
   ```
   http://localhost:3000/estimation
   ```

2. **Étape 1 : Authentification**
   - Créer un compte ou se connecter
   - ✅ Passe automatiquement à l'étape 2

3. **Étape 2 : Motif**
   - Sélectionner un motif (ex: "Curiosité")
   - Cliquer "Suivant →"

4. **Étape 3 : Données du bien** ⭐ NOUVELLE UX
   - **Type de bien** : Maison
   - **Surface habitable** : 120 m²
   - **Surface terrain** : 500 m²
   - **Code postal** : `39000` ← SAISIR EN PREMIER
     - Les communes s'affichent automatiquement
   - **Commune** : Sélectionner "Lons-le-Saunier"
   - **Année construction** : 2000
   - **État** : Bon
   - Cliquer "Suivant →"

5. **Étape 4 : Options**
   - Cocher des options (ex: "Garage", "Terrasse")
   - Cliquer "Suivant →"

6. **Étape 5 : Consentement**
   - Cocher "J'accepte les conditions"
   - Cliquer "Suivant →"

7. **Étape 6 : Formule**
   - Sélectionner "Gratuite"
   - Cliquer "Obtenir mon estimation"

8. **Page résultat**
   ```
   /estimation/resultat/[id]
   ```
   - ✅ Affichage **FOURCHETTE** (basse - haute)
   - ✅ Valeur médiane
   - ✅ Niveau de fiabilité
   - ✅ Bouton "📄 Télécharger le rapport PDF"

9. **Test PDF**
   - Cliquer sur "Télécharger le rapport PDF"
   - ✅ Téléchargement du PDF avec 7 sections :
     1. Page de couverture
     2. Contexte & motif
     3. Description du bien
     4. Méthodologie
     5. Résultat (FOURCHETTE)
     6. Limites & responsabilité
     7. Mentions légales

---

## 🧪 Tests de vérification

### Test 1 : Code postal → Communes

**Scénario :**
1. Saisir `39100` (Dole)
2. Vérifier que plusieurs communes apparaissent :
   - Dole
   - Choisey
   - Damparis
   - Foucherans
   - Sampans
   - Villette-lès-Dole

**API :**
```bash
curl http://localhost:3000/api/estimation/communes?code_postal=39100
```

**Réponse attendue :**
```json
{
  "success": true,
  "communes": [
    {"id": "...", "nom": "Dole", "code_postal": "39100", ...},
    {"id": "...", "nom": "Choisey", "code_postal": "39100", ...}
  ],
  "count": 6
}
```

### Test 2 : Commune unique

**Scénario :**
1. Saisir `39200` (Saint-Claude)
2. Vérifier que la commune est auto-sélectionnée

### Test 3 : Calcul serveur

**Vérification :**
1. Inspecter le réseau après soumission
2. POST `/api/estimation` → response contient `valeur_basse`, `valeur_mediane`, `valeur_haute`
3. Aucun calcul client dans le code React

### Test 4 : RLS utilisateur

**Scénario :**
1. Créer estimation avec User A
2. Se déconnecter, se connecter avec User B
3. User B ne doit PAS voir l'estimation de User A
4. Admin voit toutes les estimations

---

## 📁 Structure finale

```
jurabreakimmobilier/
├── docs/
│   └── data/
│       └── communes-jura.csv              ← Dataset 210+ communes
├── scripts/
│   └── check-estimation-migrations.js     ← Vérification Node
├── supabase/
│   ├── checks/
│   │   └── check_estimation_migrations.sql ← Vérification SQL
│   ├── migrations/
│   │   ├── 0011_estimation_complete.sql   ← Déjà existant
│   │   └── 0012_estimation_rls.sql        ← Déjà existant
│   └── seeds/
│       └── seed_estimation_communes_jura.sql ← Seed communes
├── src/
│   ├── app/
│   │   ├── admin/(protected)/
│   │   │   ├── page.js                    ← Sidebar + lien Estimation
│   │   │   └── estimation/
│   │   │       └── page.js                ← Admin paramétrage
│   │   ├── api/
│   │   │   └── estimation/
│   │   │       ├── route.js               ← POST/GET estimations
│   │   │       ├── communes/
│   │   │       │   └── route.js           ← GET communes par CP
│   │   │       └── [id]/download/
│   │   │           └── route.js           ← PDF download
│   │   └── estimation/
│   │       ├── page.js                    ← Formulaire client
│   │       └── resultat/[id]/
│   │           └── page.js                ← Affichage résultat
│   ├── components/
│   │   └── estimation/
│   │       └── EstimationForm.js          ← UX code postal → communes
│   └── lib/
│       └── estimation/
│           ├── calculator.js              ← Calcul serveur
│           └── pdfGenerator.js            ← Génération PDF
```

---

## ✅ Checklist finale

- [x] Migrations vérifiables (scripts SQL + Node)
- [x] Dataset communes Jura (210+ communes, 5 zones)
- [x] Seed SQL communes avec zones
- [x] API GET communes par code postal
- [x] UX code postal → communes (auto-chargement)
- [x] Lien "Estimation" dans sidebar admin
- [x] Accès admin `/admin/estimation` fonctionnel

---

## 🎯 Résultat

**Le module estimation est maintenant :**
- ✅ Vérifiable (scripts de check)
- ✅ Utilisable (seed communes Jura + UX code postal)
- ✅ Accessible (lien admin + workflow complet)
- ✅ Démo-ready (parcours client fonctionnel)

**Aucune fonctionnalité inventée, aucun refactor inutile.**
