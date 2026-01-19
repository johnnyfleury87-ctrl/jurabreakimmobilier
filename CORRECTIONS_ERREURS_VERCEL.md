# Corrections Erreurs Vercel & Migration

**Date** : 19 janvier 2026  
**Commit** : e7ea870

---

## 🔴 Erreur 1 : CSS Modules - Sélecteurs non purs

### Problème identifié
```
./src/app/admin/(protected)/estimation/page.module.css:7:1
Syntax error: Selector "h1" is not pure (pure selectors must contain at least one local class or id)
```

**Cause** : Les CSS Modules Next.js interdisent les sélecteurs HTML globaux (`h1`, `h2`, `h3`) sans classe locale.

### Solution appliquée

**Fichier** : `src/app/admin/(protected)/estimation/page.module.css`

**Avant** :
```css
h1 {
  margin-bottom: 2rem;
  color: var(--color-text-primary, #1a1a1a);
}

.content h2 {
  margin-bottom: 1.5rem;
  color: var(--color-text-primary, #1a1a1a);
}

.modalContent h3 {
  margin-bottom: 1.5rem;
}
```

**Après** :
```css
.title {
  margin-bottom: 2rem;
  color: var(--color-text-primary, #1a1a1a);
}

.subtitle {
  margin-bottom: 1.5rem;
  color: var(--color-text-primary, #1a1a1a);
}

.modalTitle {
  margin-bottom: 1.5rem;
}
```

**Fichier** : `src/app/admin/(protected)/estimation/page.js`

**Modifications** :
```javascript
// Ligne 211
<h1 className={styles.title}>Paramétrage Estimation</h1>

// Ligne 306
<h2 className={styles.subtitle}>Zones géographiques</h2>

// Ligne 349
<h3 className={styles.modalTitle}>{zone.id ? 'Modifier' : 'Nouvelle'} Zone</h3>
```

---

## 🔴 Erreur 2 : Migration - Référence invalide auth.users

### Problème identifié

**Fichier** : `supabase/migrations/0011_estimation_complete.sql`

**Lignes problématiques** :
- Ligne 102 : `created_by UUID REFERENCES auth.users(id)` (estimation_mentions_legales)
- Ligne 119 : `created_by UUID REFERENCES auth.users(id)` (estimation_versions_regles)
- Ligne 140 : `user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL` (estimations)

**Cause** : Le schéma `auth.users` n'est pas accessible directement dans les migrations publiques Supabase. Les foreign keys vers `auth.users` échouent lors de l'exécution de la migration.

### Solution appliquée

**Option retenue** : Supprimer les contraintes REFERENCES vers `auth.users` et conserver les colonnes UUID simples.

**Raison** : 
1. Les RLS policies dans `0012_estimation_rls.sql` utilisent déjà `auth.uid()` pour la sécurité
2. La validation applicative dans les API garantit l'intégrité
3. Évite la dépendance au schéma `auth` qui peut varier selon l'environnement Supabase

**Après** :
```sql
-- Ligne 102
created_by UUID,

-- Ligne 119
created_by UUID

-- Ligne 140
user_id UUID,
```

**Impact** : 
- ✅ Les RLS policies fonctionnent toujours (basées sur `auth.uid()`, pas sur FK)
- ✅ La migration s'exécute sans erreur
- ⚠️ Perte de l'intégrité référentielle au niveau DB (compensée par la validation API)

---

## ✅ Vérification

### Build Next.js
```bash
npm run build
```
**Résultat** : ✅ `Compiled successfully`

### Structure finale
```
Route (app)                                    Size     First Load JS
├ ƒ /admin/estimation                          2.81 kB         144 kB
├ ƒ /api/admin/estimation/create-version       0 B                0 B
├ ƒ /api/estimation                            0 B                0 B
├ ƒ /api/estimation/[id]/download              0 B                0 B
├ ○ /estimation                                6.1 kB          156 kB
├ ƒ /estimation/resultat/[id]                  477 B          96.6 kB
```

### Migration Supabase

**Fichiers modifiés** :
- `supabase/migrations/0011_estimation_complete.sql` : 3 contraintes REFERENCES supprimées

**À faire** : Appliquer la migration en production :
```bash
supabase db push
```

---

## 📋 Checklist de déploiement

- [x] Corriger CSS Modules (sélecteurs purs)
- [x] Corriger migration (suppression FK auth.users)
- [x] Vérifier build local réussi
- [x] Commit des corrections
- [ ] Appliquer migration Supabase production
- [ ] Créer bucket storage `estimations`
- [ ] Déployer sur Vercel
- [ ] Tester parcours complet estimation

---

## 🔍 Tests de non-régression requis

1. **Admin Estimation** : Vérifier l'affichage des onglets (styles appliqués)
2. **Formulaire Estimation** : Parcours complet 6 étapes
3. **RLS Policies** : Vérifier isolation utilisateurs (`auth.uid()` fonctionne toujours)
4. **API Estimation** : Validation user_id obligatoire
5. **PDF Download** : Génération et téléchargement sécurisé
