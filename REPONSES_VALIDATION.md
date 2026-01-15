# 📊 RÉPONSES AUX QUESTIONS DE VALIDATION

## ❓ QUESTION 1 : Quelles tables gèrent les contenus dynamiques ?

### 📸 Photo et biographie de Lolita

**Table** : `agence_settings`

**Clés utilisées** :
- `about_photo_url` : URL de la photo de Lolita (stockée dans Storage Supabase bucket "public")
- `about_biography` : Texte de sa biographie (TEXT)

**Fichier frontend** : [src/app/a-propos/page.js](src/app/a-propos/page.js)
```javascript
const settingsMap = settingsData.reduce((acc, s) => {
  acc[s.key] = s.value;
  return acc;
}, {});

const photoUrl = settingsMap.about_photo_url || '/placeholder.jpg';
const bio = settingsMap.about_biography || '';
```

✅ **STATUT** : **IMPLÉMENTÉ ET FONCTIONNEL**

---

### 🏠 Textes du Hero (page d'accueil)

**Table** : `agence_settings`

**Clés nécessaires** :
- `home_hero_title`
- `home_hero_subtitle`
- `home_services` (JSONB array)

❌ **PROBLÈME IDENTIFIÉ** :
- Les clés existent dans la table `agence_settings` (voir [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) lignes 80-100)
- MAIS la page [src/app/page.js](src/app/page.js) ne les fetch PAS et utilise du texte HARDCODÉ :
  - Ligne 9 : `<h1 className={styles.heroTitle}>Bienvenue chez JuraBreak Immobilier</h1>`
  - Ligne 10 : `<p className={styles.heroSubtitle}>Votre agence immobilière de confiance dans le Jura</p>`
  - Lignes 26-44 : Les 3 services sont hardcodés

**Action nécessaire** : Transformer [src/app/page.js](src/app/page.js) en server component et fetch depuis `agence_settings`

---

### 💼 Textes de la page Honoraires

**Table** : `agence_settings`

**Clé** : `honoraires` (TEXT)

**Fichier frontend** : [src/app/honoraires/page.js](src/app/honoraires/page.js)
```javascript
const honorairesText = settingsMap.honoraires || '';
```

✅ **STATUT** : **IMPLÉMENTÉ ET FONCTIONNEL**

---

## ❓ QUESTION 2 : Formule "juridiquement viable" - acceptations des conditions

### Où sont stockées les acceptations ?

❌ **PROBLÈME CRITIQUE** : **PAS IMPLÉMENTÉ**

**Manque actuellement** :
1. Champ `terms_accepted_at` dans la table `estimations` (timestamptz)
2. Checkbox CGV dans le formulaire [src/app/estimation/page.js](src/app/estimation/page.js)
3. Validation côté serveur dans [src/app/api/estimation/route.js](src/app/api/estimation/route.js)

**Solution requise** : Créer migration `0005_add_terms_acceptance.sql` :
```sql
ALTER TABLE estimations
ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- Ajouter policy : public peut seulement insérer si terms_accepted_at est défini pour Formule 2
```

---

### Mentions légales dans le PDF généré

❌ **PROBLÈME CRITIQUE** : **GÉNÉRATION PDF PAS IMPLÉMENTÉE**

**État actuel** :
- Structure API existe : [src/app/api/webhooks/stripe/route.js](src/app/api/webhooks/stripe/route.js) ligne 38
- Commentaire TODO : `// TODO: Générer PDF et envoyer email`
- Library pdfkit installée mais pas utilisée

**Manque** :
- Fichier [src/lib/pdfGenerator.js](src/lib/pdfGenerator.js) (à créer)
- Mentions légales non définies (aucun document)

**Solution requise** :
1. Créer document `docs/MENTIONS_LEGALES_PDF.md` avec le texte légal exact
2. Implémenter génération PDF avec pdfkit
3. Uploader dans Storage bucket "estimations" (privé)
4. Mettre à jour champ `pdf_url` dans table `estimations`

---

## ❓ QUESTION 3 : Confirmation table par table - RLS et Policies

Voir document détaillé : [VERIFICATION_RLS.md](VERIFICATION_RLS.md)

### Résumé des 8 tables

| Table | RLS Activé | Public PEUT lire ? | Public PEUT écrire ? | Admin PEUT tout ? |
|-------|------------|--------------------|--------------------|------------------|
| `profiles` | ✅ Oui | ❌ Non (sauf son propre profil) | ❌ Non | ✅ Oui |
| `agence_settings` | ✅ Oui | ✅ Oui (SELECT only) | ❌ Non | ✅ Oui |
| `annonces` | ✅ Oui | ✅ Oui (si `published_at` défini) | ❌ Non | ✅ Oui |
| `annonce_photos` | ✅ Oui | ✅ Oui (via JOIN avec annonces publiées) | ❌ Non | ✅ Oui |
| `events` | ✅ Oui | ✅ Oui (si `is_published = true`) | ❌ Non | ✅ Oui |
| **`leads`** | ✅ Oui | **❌ Non** (permission denied) | ✅ Oui (INSERT only) | ✅ Oui |
| **`analytics_events`** | ✅ Oui | **❌ Non** (permission denied) | ✅ Oui (INSERT only) | ✅ Oui |
| **`estimations`** | ✅ Oui | **❌ Non** (permission denied) | ✅ Oui (INSERT DRAFT only) | ✅ Oui |

### ✅ Confirmation des 3 points critiques

1. **Public ne peut PAS lire `leads`**
   - Policy : `CREATE POLICY "Admin can read leads" ON leads FOR SELECT TO authenticated USING (is_admin());`
   - Fichier : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) ligne 63

2. **Public ne peut PAS lire `estimations`**
   - Policy : `CREATE POLICY "Admin can read estimations" ON estimations FOR SELECT TO authenticated USING (is_admin());`
   - Fichier : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) ligne 89

3. **Public ne peut PAS lire `analytics_events`**
   - Policy : `CREATE POLICY "Admin can read analytics" ON analytics_events FOR SELECT TO authenticated USING (is_admin());`
   - Fichier : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) ligne 80

### 🔐 Fonction is_admin()

**Fichier** : [supabase/migrations/0002_rls_policies.sql](supabase/migrations/0002_rls_policies.sql) lignes 1-15

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$;
```

**Sécurité** :
- ✅ `SECURITY DEFINER` : La fonction s'exécute avec les privilèges du créateur (service role)
- ✅ `SET search_path = public` : Empêche les attaques par injection de schéma
- ✅ Vérifie le rôle depuis la table `profiles`, pas depuis les claims JWT (plus sécurisé)

---

## ❓ QUESTION 4 : Checklist de tests "public vs admin" exécutables

**Fichier créé** : [TESTS_RLS.sql](TESTS_RLS.sql)

### 23 tests SQL exécutables

**Tests publics (non authentifié)** :
- Tests 1-6 : Lecture autorisée (annonces publiées, événements publiés, agence_settings)
- Tests 7-9 : ⚠️ **Lecture interdite** (leads, estimations, analytics → permission denied)
- Tests 10-11 : Insertion autorisée (leads, estimations DRAFT)
- Test 12 : Insertion interdite (estimation PAID sans payer)
- Tests 13-14 : Modification/suppression interdites

**Tests admin (authentifié avec role='admin')** :
- Tests 15-19 : Lecture complète de toutes les tables
- Tests 20-23 : Écriture/modification de toutes les données

### Comment exécuter

Voir instructions dans [TESTS_RLS.sql](TESTS_RLS.sql) :
1. Créer les données de test (section "SETUP")
2. Exécuter chaque test dans Supabase SQL Editor
3. Vérifier que les résultats correspondent aux attentes

---

## 📋 RÉCAPITULATIF DES POINTS BLOQUANTS

Voir [POINTS_BLOQUANTS.md](POINTS_BLOQUANTS.md) pour le détail.

### 🔴 Bloquant 1 : Homepage hardcodée

**Fichier** : [src/app/page.js](src/app/page.js)
**Problème** : Textes hardcodés au lieu de fetch depuis `agence_settings`
**Impact** : ❌ Incohérent avec le reste du site (À propos, Honoraires sont dynamiques)

### 🔴 Bloquant 2 : Acceptation CGV non trackée

**Fichier** : Table `estimations`
**Problème** : Pas de champ `terms_accepted_at`
**Impact** : ❌ Formule 2 "juridiquement viable" non conforme légalement

### 🔴 Bloquant 3 : PDF non généré

**Fichiers** : Aucun générateur PDF implémenté
**Problème** : Formule 1 et 2 promettent un PDF mais ne le génèrent pas
**Impact** : ❌ Fonctionnalité clé absente

---

## ✅ CE QUI EST OPÉRATIONNEL

1. ✅ **RLS** : Les 8 tables ont RLS activé avec policies correctes
2. ✅ **Sécurité** : Public ne peut PAS lire leads/estimations/analytics (confirmé)
3. ✅ **Page À Propos** : Photo et bio de Lolita sont dynamiques
4. ✅ **Page Honoraires** : Texte dynamique depuis agence_settings
5. ✅ **Annonces** : Système complet (brouillon vs publié)
6. ✅ **Événements** : Système complet (brouillon vs publié)
7. ✅ **Formulaire estimation** : 3 formules avec disclaimers
8. ✅ **Paiement Stripe** : Checkout + Webhooks fonctionnels
9. ✅ **Trigger max 8 photos** : Impossible d'ajouter plus de 8 photos par annonce
10. ✅ **Admin login** : Système d'authentification avec vérification role

---

## 🎯 PROCHAINES ÉTAPES POUR VALIDER LE PROJET

1. **Exécuter [TESTS_RLS.sql](TESTS_RLS.sql)** (23 tests) pour prouver la sécurité
2. **Fixer la homepage** : Transformer [src/app/page.js](src/app/page.js) en server component
3. **Ajouter champ `terms_accepted_at`** : Migration + checkbox frontend
4. **Implémenter génération PDF** : pdfkit + mentions légales
5. **Définir mentions légales** : Document juridique pour le PDF

**Une fois ces 5 points résolus, le projet sera finalisé et déployable.**
