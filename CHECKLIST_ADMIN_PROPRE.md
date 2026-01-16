# ✅ CHECKLIST DE VALIDATION - Admin JuraBreak

## 📋 Objectif
Valider que l'interface admin fonctionne parfaitement avec **zéro erreur console**, un CRUD complet des annonces avec photos, et une mise à jour immédiate côté public.

---

## 🔧 A) Préparation

### 1. Vérifier les variables d'environnement
```bash
# Vérifier .env.local
grep "NEXT_PUBLIC_SUPABASE" .env.local
grep "DEV_ADMIN_BYPASS" .env.local
```

**Attendu:**
- `NEXT_PUBLIC_SUPABASE_URL` configuré
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuré
- `DEV_ADMIN_BYPASS=false` (ou commenté) en production

### 2. Appliquer les migrations Supabase
```bash
# Si pas encore appliqué
cd supabase
supabase db push

# Ou via script
./scripts/apply-migrations.sh
```

**Attendu:**
- Migration 0008_storage_annonces_photos.sql appliquée
- Bucket `annonces` créé dans Supabase Storage
- Policies RLS configurées

### 3. Créer l'utilisateur admin (si besoin)
```sql
-- Dans Supabase SQL Editor
-- Créer un profil admin pour lolita@jurabreak.fr
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'lolita@jurabreak.fr'),
  'lolita@jurabreak.fr',
  'admin',
  'Lolita',
  'JuraBreak'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## 🧪 B) Tests fonctionnels (dans l'ordre)

### ✅ TEST 1: Connexion admin
**Action:**
1. Aller sur `/admin/login`
2. Se connecter avec `lolita@jurabreak.fr`
3. Vérifier redirection vers `/admin`

**Résultat attendu:**
- ✅ Connexion réussie
- ✅ Redirection vers dashboard
- ✅ Email affiché dans la sidebar
- ✅ **0 erreur console**

---

### ✅ TEST 2: Dashboard sans erreurs
**Action:**
1. Sur `/admin` (dashboard)
2. Ouvrir la console navigateur (F12)
3. Observer les requêtes réseau

**Résultat attendu:**
- ✅ Sidebar affiche uniquement:
  - 📊 Dashboard
  - 🏠 Annonces
  - 🚪 Déconnexion
- ✅ Aucun lien vers `/admin/leads`, `/admin/estimations`, `/admin/evenements`, `/admin/settings`
- ✅ Carte "Annonces" visible avec le nombre actuel
- ✅ **0 x 404 en console**
- ✅ **0 x 401 en console**

---

### ✅ TEST 3: Liste des annonces OK
**Action:**
1. Cliquer sur "🏠 Annonces" dans la sidebar
2. Observer le chargement
3. Vérifier la console

**Résultat attendu:**
- ✅ URL: `/admin/annonces`
- ✅ Liste des annonces s'affiche (ou message "Aucune annonce")
- ✅ Boutons visibles:
  - "+ Nouvelle annonce"
  - "🧪 Annonce test"
- ✅ Filtres fonctionnels: Toutes / Visibles / Cachées / Supprimées
- ✅ **0 erreur console**
- ✅ **GET /api/admin/annonces retourne 200**

---

### ✅ TEST 4: Créer une annonce + photos
**Action:**
1. Cliquer sur "+ Nouvelle annonce"
2. Remplir le formulaire:
   - **Titre:** `Test maison Lons-le-Saunier`
   - **Type de bien:** Maison
   - **Transaction:** Vente
   - **Ville:** Lons-le-Saunier
   - **Code postal:** 39000
   - **Prix:** 250000
   - **Surface:** 120 m²
   - **Pièces:** 5
   - **Chambres:** 3
3. **Ajouter 3 photos** (depuis mobile si possible)
4. Vérifier que les photos s'affichent en preview
5. Cliquer sur "Créer l'annonce"

**Résultat attendu:**
- ✅ Formulaire complet et responsive mobile
- ✅ Preview des 3 photos avec badge "Couverture" sur la 1ère
- ✅ Honoraires calculés automatiquement (7000€ pour maison >100k)
- ✅ Annonce créée avec succès
- ✅ Redirection vers `/admin/annonces`
- ✅ Nouvelle annonce visible dans la liste
- ✅ **0 erreur console**

---

### ✅ TEST 5: Vérification côté public immédiat
**Action:**
1. Ouvrir un nouvel onglet
2. Aller sur `/annonces` (site public)
3. Chercher l'annonce créée

**Résultat attendu:**
- ✅ Annonce `Test maison Lons-le-Saunier` visible
- ✅ Photos affichées correctement
- ✅ Prix: 250 000 €
- ✅ Honoraires: 7 000 € TTC
- ✅ **Mise à jour immédiate** (pas de délai cache)

---

### ✅ TEST 6: Modifier une annonce
**Action:**
1. Retour sur `/admin/annonces`
2. Cliquer sur "✏️ Modifier" sur l'annonce test
3. Modifier:
   - **Statut:** Sous compromis
   - **Supprimer 1 photo**
4. Enregistrer

**Résultat attendu:**
- ✅ Formulaire pré-rempli avec données existantes
- ✅ Photos existantes affichées
- ✅ Suppression de photo fonctionne
- ✅ Sauvegarde réussie
- ✅ **Statut mis à jour dans la liste**
- ✅ **0 erreur console**

---

### ✅ TEST 7: Changer le statut (dropdown)
**Action:**
1. Sur `/admin/annonces`
2. Dans la carte de l'annonce, changer le statut via le dropdown
3. Passer de "Sous compromis" à "Vendu"

**Résultat attendu:**
- ✅ Dropdown change immédiatement
- ✅ Badge coloré mis à jour
- ✅ **Requête PUT /api/admin/annonces/[id] réussie (200)**
- ✅ **0 erreur console**

---

### ✅ TEST 8: Masquer/Afficher annonce
**Action:**
1. Cliquer sur l'icône 👁️ (visible) → devient 🔒 (masqué)
2. Vérifier côté public `/annonces`
3. Re-cliquer sur 🔒 → redevient 👁️

**Résultat attendu:**
- ✅ Toggle fonctionne
- ✅ Annonce masquée n'apparaît plus sur `/annonces` public
- ✅ Annonce réaffichée réapparaît immédiatement
- ✅ **0 erreur console**

---

### ✅ TEST 9: Supprimer annonce (soft delete)
**Action:**
1. Cliquer sur 🗑️ sur l'annonce test
2. Confirmer la suppression
3. Vérifier côté public

**Résultat attendu:**
- ✅ Confirmation demandée
- ✅ Annonce disparaît de la liste (si filtre != "Supprimées")
- ✅ En cliquant sur filtre "Supprimées", l'annonce est là
- ✅ **Annonce n'apparaît plus sur `/annonces` public**
- ✅ **DELETE soft: is_deleted=true, pas de suppression physique**
- ✅ **0 erreur console**

---

### ✅ TEST 10: Upload photos mobile
**Action:**
1. Ouvrir `/admin/annonces/new` sur mobile (ou émulateur)
2. Cliquer sur input file
3. Sélectionner 5 photos depuis la galerie
4. Vérifier preview
5. Créer l'annonce

**Résultat attendu:**
- ✅ Input `multiple` permet sélection multi
- ✅ 5 thumbnails affichés
- ✅ Upload de toutes les photos réussi
- ✅ Photos visibles dans l'annonce publique
- ✅ **0 erreur console**

---

### ✅ TEST 11: Calcul honoraires automatique
**Action:**
1. Créer plusieurs annonces avec différents types/prix:
   - Maison 80 000€ → devrait afficher 5 000€
   - Appartement 150 000€ → 6 000€
   - Immeuble 600 000€ → 15 000€
   - Location 350€/mois, 50m² → 280€ + 150€ état lieux

**Résultat attendu:**
- ✅ Honoraires calculés automatiquement dans le formulaire
- ✅ Affichage en temps réel pendant la saisie
- ✅ Sauvegarde correcte en base (`honoraires_transaction`, `honoraires_location`, etc.)
- ✅ Affichage correct sur page publique annonce

---

## 🎯 C) Validation finale

### Console propre (CRITIQUE)
```
✅ 0 x 404 Not Found
✅ 0 x 401 Unauthorized
✅ 0 x 403 Forbidden
✅ 0 x 500 Server Error
✅ Aucune erreur JavaScript
✅ Aucun warning React/Next.js majeur
```

### Fonctionnalités complètes
```
✅ Login admin (email+password)
✅ Dashboard sans liens morts
✅ Liste annonces avec filtres
✅ Création annonce + multi-photos
✅ Édition annonce + gestion photos
✅ Suppression soft delete
✅ Toggle visible/masqué
✅ Changement statut (A_VENDRE, SOUS_COMPROMIS, etc.)
✅ Calcul honoraires automatique
✅ Upload photos mobile (input multiple)
✅ Mise à jour immédiate côté public (revalidatePath)
```

### Responsive mobile
```
✅ Formulaires utilisables sur mobile
✅ Input file multiple fonctionne
✅ Boutons accessibles (pas trop petits)
✅ Sidebar admin adaptée mobile
```

---

## 🚀 D) Déploiement Vercel

### Avant de déployer
1. **Désactiver DEV_ADMIN_BYPASS:**
   ```bash
   # Dans .env.local (local) et Vercel (prod)
   # DEV_ADMIN_BYPASS=false # ou supprimer la ligne
   ```

2. **Configurer variables Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (si besoin API admin avancées)

3. **Appliquer migrations Supabase:**
   ```bash
   supabase db push
   ```

4. **Tester en production:**
   - Login admin
   - Créer 1 annonce
   - Vérifier console (F12)

### Post-déploiement
```
✅ Admin accessible uniquement avec login
✅ API /api/admin/* protégées (401 si non admin)
✅ Emails allowlist respectés (lolita@jurabreak.fr, contact@jurabreak.fr)
✅ Aucune erreur 404/401 en production
```

---

## 📞 Support

**Problème 401 persistant?**
1. Vérifier que l'utilisateur est bien dans `auth.users` Supabase
2. Vérifier que son email est dans `ADMIN_EMAILS` (`src/lib/auth/config.js`)
3. Check cookies Supabase dans DevTools > Application > Cookies
4. Tester avec mode navigation privée (clear cache)

**Photos ne s'uploadent pas?**
1. Vérifier bucket `annonces` existe dans Supabase Storage
2. Check policies RLS sur `storage.objects`
3. Limites taille fichier (Supabase Free: 50MB/fichier max)

**Annonces publiques pas mises à jour?**
1. Vérifier `revalidatePath('/annonces')` dans API routes
2. Check build Next.js (ISR activé?)
3. En dev: parfois besoin de refresh manuel

---

## ✅ VALIDATION GLOBALE

**Cocher uniquement si TOUT est vert:**

- [ ] 0 erreur console (404, 401, JS)
- [ ] Login admin fonctionne
- [ ] CRUD annonces complet (Create, Read, Update, Delete)
- [ ] Upload multi-photos mobile OK
- [ ] Calcul honoraires automatique
- [ ] Statuts et visibilité fonctionnent
- [ ] Mise à jour publique immédiate
- [ ] Responsive mobile OK
- [ ] Prêt pour production Vercel

**Signature:** _________________ | **Date:** ________________

---

**FIN DE LA CHECKLIST** 🎉
