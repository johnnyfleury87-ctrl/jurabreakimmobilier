# 🧪 CHECKLIST TESTS PUBLIC vs ADMIN (Exécutables)

## Instructions

Ces tests sont à exécuter dans **Supabase SQL Editor**.

### Préparation

1. Créer un utilisateur admin (voir `scripts/seed_admin.sql`)
2. Créer des données de test (voir section "Setup Test Data")
3. Exécuter les tests dans l'ordre

---

## 📋 SETUP : Données de Test

```sql
-- 1. Créer une annonce publiée
INSERT INTO annonces (id, slug, titre, description, type_bien, prix, ville, code_postal, statut, published_at, is_deleted)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'test-maison',
  'Maison de Test',
  'Une belle maison de test',
  'maison',
  250000.00,
  'Lons-le-Saunier',
  '39000',
  'EN_VENTE',
  NOW(),
  false
);

-- 2. Créer une annonce BROUILLON (non publiée)
INSERT INTO annonces (id, slug, titre, description, type_bien, prix, ville, code_postal, statut, published_at, is_deleted)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'test-appartement-draft',
  'Appartement BROUILLON',
  'Ne devrait pas être visible',
  'appartement',
  150000.00,
  'Dole',
  '39100',
  'EN_VENTE',
  NULL, -- ⚠️ PAS PUBLIÉ
  false
);

-- 3. Créer une photo pour l'annonce publiée
INSERT INTO annonce_photos (id, annonce_id, url, position)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'https://example.com/photo1.jpg',
  0
);

-- 4. Créer une photo pour l'annonce brouillon
INSERT INTO annonce_photos (id, annonce_id, url, position)
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'https://example.com/photo2.jpg',
  0
);

-- 5. Créer un événement publié
INSERT INTO events (id, titre, description, date_event, lieu, is_published)
VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  'Portes Ouvertes',
  'Venez découvrir nos biens',
  NOW() + INTERVAL '7 days',
  'Lons-le-Saunier',
  true
);

-- 6. Créer un événement BROUILLON
INSERT INTO events (id, titre, description, date_event, lieu, is_published)
VALUES (
  '66666666-6666-6666-6666-666666666666'::uuid,
  'Événement Privé',
  'Ne devrait pas être visible',
  NOW() + INTERVAL '14 days',
  'Dole',
  false -- ⚠️ PAS PUBLIÉ
);

-- 7. Créer un lead
INSERT INTO leads (id, nom, prenom, email, telephone, message, type_demande, statut)
VALUES (
  '77777777-7777-7777-7777-777777777777'::uuid,
  'Dupont',
  'Jean',
  'jean.dupont@example.com',
  '0612345678',
  'Je suis intéressé par la maison de test',
  'contact',
  'nouveau'
);

-- 8. Créer une estimation
INSERT INTO estimations (id, formule, nom, prenom, email, adresse_bien, type_bien, surface, statut)
VALUES (
  '88888888-8888-8888-8888-888888888888'::uuid,
  'formule_0',
  'Martin',
  'Sophie',
  'sophie.martin@example.com',
  '123 Rue du Test, 39000 Lons-le-Saunier',
  'maison',
  120.00,
  'DRAFT'
);

-- 9. Créer un analytics event
INSERT INTO analytics_events (id, event_type, event_data)
VALUES (
  '99999999-9999-9999-9999-999999999999'::uuid,
  'page_view',
  '{"page": "/annonces"}'::jsonb
);
```

---

## 🔴 TESTS EN MODE PUBLIC (Non Authentifié)

### ⚠️ Comment tester en mode public

Dans Supabase SQL Editor, par défaut vous êtes en mode "service role" (admin).

Pour tester en mode public :
1. Utiliser l'API Supabase depuis le front
2. OU utiliser `set_config` pour simuler :

```sql
-- Simuler un utilisateur non authentifié
SET LOCAL role TO anon;
```

---

### TEST 1 : Public PEUT lire annonces publiées

```sql
-- Devrait retourner 1 ligne (la maison publiée)
SELECT id, titre, slug, published_at
FROM annonces
WHERE is_deleted = false AND published_at IS NOT NULL;
```

**Résultat attendu** : 
- ✅ 1 ligne : "Maison de Test"
- ❌ PAS : "Appartement BROUILLON"

---

### TEST 2 : Public NE PEUT PAS lire annonces brouillon

```sql
-- Devrait retourner 0 ligne
SELECT id, titre
FROM annonces
WHERE slug = 'test-appartement-draft';
```

**Résultat attendu** : 
- ✅ 0 ligne (brouillon invisible)

---

### TEST 3 : Public PEUT lire photos des annonces publiées

```sql
-- Devrait retourner 1 ligne
SELECT ap.id, ap.url, a.titre
FROM annonce_photos ap
JOIN annonces a ON ap.annonce_id = a.id
WHERE a.is_deleted = false AND a.published_at IS NOT NULL;
```

**Résultat attendu** :
- ✅ 1 ligne : photo de "Maison de Test"

---

### TEST 4 : Public NE PEUT PAS lire photos des brouillons

```sql
-- Devrait retourner 0 ligne
SELECT ap.*
FROM annonce_photos ap
WHERE annonce_id = '22222222-2222-2222-2222-222222222222'::uuid;
```

**Résultat attendu** :
- ✅ 0 ligne (photo du brouillon invisible)

---

### TEST 5 : Public PEUT lire événements publiés

```sql
-- Devrait retourner 1 ligne
SELECT id, titre
FROM events
WHERE is_published = true;
```

**Résultat attendu** :
- ✅ 1 ligne : "Portes Ouvertes"

---

### TEST 6 : Public NE PEUT PAS lire événements brouillon

```sql
-- Devrait retourner 0 ligne
SELECT id, titre
FROM events
WHERE is_published = false;
```

**Résultat attendu** :
- ✅ 0 ligne

---

### TEST 7 : Public NE PEUT PAS lire les leads ⚠️ CRITIQUE

```sql
-- Devrait échouer avec "permission denied"
SELECT * FROM leads;
```

**Résultat attendu** :
- ✅ **ERREUR** : `permission denied for table leads`

---

### TEST 8 : Public NE PEUT PAS lire les estimations ⚠️ CRITIQUE

```sql
-- Devrait échouer avec "permission denied"
SELECT * FROM estimations;
```

**Résultat attendu** :
- ✅ **ERREUR** : `permission denied for table estimations`

---

### TEST 9 : Public NE PEUT PAS lire les analytics ⚠️ CRITIQUE

```sql
-- Devrait échouer avec "permission denied"
SELECT * FROM analytics_events;
```

**Résultat attendu** :
- ✅ **ERREUR** : `permission denied for table analytics_events`

---

### TEST 10 : Public PEUT insérer un lead (formulaire contact)

```sql
-- Devrait réussir
INSERT INTO leads (nom, prenom, email, message, type_demande, statut)
VALUES ('Test', 'User', 'test@example.com', 'Test message', 'contact', 'nouveau')
RETURNING id;
```

**Résultat attendu** :
- ✅ Insertion réussie, retourne un UUID

---

### TEST 11 : Public PEUT insérer une estimation DRAFT

```sql
-- Devrait réussir
INSERT INTO estimations (formule, nom, prenom, email, adresse_bien, type_bien, surface, statut)
VALUES ('formule_0', 'Test', 'User', 'test@example.com', '1 Rue Test', 'maison', 100.00, 'DRAFT')
RETURNING id;
```

**Résultat attendu** :
- ✅ Insertion réussie

---

### TEST 12 : Public NE PEUT PAS créer estimation directement PAID

```sql
-- Devrait échouer avec "new row violates row-level security policy"
INSERT INTO estimations (formule, nom, prenom, email, adresse_bien, type_bien, surface, statut)
VALUES ('formule_1', 'Hacker', 'Evil', 'hack@example.com', '1 Rue Test', 'maison', 100.00, 'PAID')
RETURNING id;
```

**Résultat attendu** :
- ✅ **ERREUR** : `new row violates row-level security policy`

---

### TEST 13 : Public NE PEUT PAS modifier une annonce

```sql
-- Devrait échouer
UPDATE annonces
SET prix = 1.00
WHERE id = '11111111-1111-1111-1111-111111111111'::uuid;
```

**Résultat attendu** :
- ✅ **ERREUR** ou 0 ligne modifiée (permission denied)

---

### TEST 14 : Public NE PEUT PAS supprimer une annonce

```sql
-- Devrait échouer
DELETE FROM annonces
WHERE id = '11111111-1111-1111-1111-111111111111'::uuid;
```

**Résultat attendu** :
- ✅ **ERREUR** ou 0 ligne supprimée

---

## 🟢 TESTS EN MODE ADMIN (Authentifié avec role='admin')

### ⚠️ Comment tester en mode admin

1. Se connecter avec l'utilisateur admin créé
2. Dans le code, utiliser `createClient()` avec le token admin

OU en SQL :

```sql
-- Simuler connexion admin (remplacer par UUID réel de l'admin)
SELECT set_config('request.jwt.claims', '{"sub": "UUID_ADMIN_ICI"}', false);
```

---

### TEST 15 : Admin PEUT lire toutes les annonces (y compris brouillons)

```sql
-- Devrait retourner 2 lignes (publiée + brouillon)
SELECT id, titre, published_at
FROM annonces;
```

**Résultat attendu** :
- ✅ 2 lignes : "Maison de Test" ET "Appartement BROUILLON"

---

### TEST 16 : Admin PEUT lire tous les événements

```sql
-- Devrait retourner 2 lignes
SELECT id, titre, is_published
FROM events;
```

**Résultat attendu** :
- ✅ 2 lignes (publié + brouillon)

---

### TEST 17 : Admin PEUT lire les leads ⚠️ CRITIQUE

```sql
-- Devrait réussir
SELECT id, nom, prenom, email, message
FROM leads;
```

**Résultat attendu** :
- ✅ Au moins 1 ligne (les leads créés)

---

### TEST 18 : Admin PEUT lire les estimations ⚠️ CRITIQUE

```sql
-- Devrait réussir
SELECT id, formule, nom, email, statut
FROM estimations;
```

**Résultat attendu** :
- ✅ Au moins 1 ligne

---

### TEST 19 : Admin PEUT lire les analytics

```sql
-- Devrait réussir
SELECT id, event_type, event_data
FROM analytics_events;
```

**Résultat attendu** :
- ✅ Au moins 1 ligne

---

### TEST 20 : Admin PEUT créer une annonce

```sql
-- Devrait réussir
INSERT INTO annonces (slug, titre, type_bien, prix, ville, code_postal, statut, is_deleted)
VALUES ('admin-test', 'Annonce Admin', 'maison', 300000.00, 'Test', '39000', 'EN_VENTE', false)
RETURNING id;
```

**Résultat attendu** :
- ✅ Insertion réussie

---

### TEST 21 : Admin PEUT modifier une annonce

```sql
-- Devrait réussir
UPDATE annonces
SET prix = 999999.00
WHERE slug = 'test-maison'
RETURNING id, prix;
```

**Résultat attendu** :
- ✅ 1 ligne modifiée, nouveau prix = 999999.00

---

### TEST 22 : Admin PEUT modifier le statut d'un lead

```sql
-- Devrait réussir
UPDATE leads
SET statut = 'traite'
WHERE id = '77777777-7777-7777-7777-777777777777'::uuid
RETURNING id, statut;
```

**Résultat attendu** :
- ✅ 1 ligne modifiée, statut = 'traite'

---

### TEST 23 : Admin PEUT modifier le statut d'une estimation

```sql
-- Devrait réussir (simule webhook Stripe)
UPDATE estimations
SET statut = 'PAID', prix_paye = 49.00
WHERE id = '88888888-8888-8888-8888-888888888888'::uuid
RETURNING id, statut, prix_paye;
```

**Résultat attendu** :
- ✅ 1 ligne modifiée, statut = 'PAID'

---

## 📊 RÉCAPITULATIF DES TESTS

| Test | Catégorie | Résultat Attendu |
|------|-----------|------------------|
| 1-6 | Public read (autorisé) | ✅ Réussite |
| 7-9 | Public read (interdit) | ✅ Permission denied |
| 10-11 | Public insert (autorisé) | ✅ Réussite |
| 12 | Public insert PAID (interdit) | ✅ Policy violation |
| 13-14 | Public update/delete (interdit) | ✅ Permission denied |
| 15-19 | Admin read all | ✅ Réussite |
| 20-23 | Admin write all | ✅ Réussite |

**Total : 23 tests**

---

## ✅ VALIDATION FINALE

Tous les tests doivent passer avec les résultats attendus.

Si un test échoue :
1. Vérifier que les migrations ont été exécutées dans l'ordre
2. Vérifier que l'utilisateur admin existe avec `role = 'admin'`
3. Vérifier les policies dans le dashboard Supabase (Table Editor > Policies)
4. Exécuter `scripts/verify_rls.sql` pour diagnostiquer

**Ces tests confirment que la sécurité RLS est correctement implémentée.**
