# Guide de Configuration Supabase

## Étape 1 : Créer le projet

1. Aller sur [https://supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter :
   - URL du projet (ex: `https://xxxxx.supabase.co`)
   - Anon key (clé publique)
   - Service role key (clé privée - NE JAMAIS EXPOSER AU CLIENT)

## Étape 2 : Exécuter les migrations SQL

Dans le dashboard Supabase, aller dans **SQL Editor** et exécuter les fichiers dans l'ordre :

### 1. Migration 0001 - Tables initiales
Copier-coller le contenu de `/supabase/migrations/0001_init.sql`

Vérifier :
- ✅ 8 tables créées
- ✅ Contraintes appliquées
- ✅ Index créés

### 2. Migration 0002 - RLS & Policies
Copier-coller le contenu de `/supabase/migrations/0002_rls_policies.sql`

Vérifier :
- ✅ Fonction `is_admin()` créée
- ✅ RLS activé sur toutes les tables
- ✅ Policies créées (vérifier dans Table Editor > Policies)

### 3. Migration 0003 - Triggers
Copier-coller le contenu de `/supabase/migrations/0003_triggers.sql`

Vérifier :
- ✅ Trigger `enforce_max_8_photos` créé
- ✅ Trigger `set_updated_at` créé pour toutes les tables

### 4. Migration 0004 - Storage
Copier-coller le contenu de `/supabase/migrations/0004_storage_buckets.sql`

⚠️ **IMPORTANT** : Les buckets Storage doivent être créés manuellement

## Étape 3 : Créer les Storage Buckets

Aller dans **Storage** dans le dashboard Supabase :

### Bucket `annonces`
1. Cliquer sur "New bucket"
2. Nom : `annonces`
3. Public : ✅ OUI
4. Créer

### Bucket `public`
1. Cliquer sur "New bucket"
2. Nom : `public`
3. Public : ✅ OUI
4. Créer

### Bucket `estimations`
1. Cliquer sur "New bucket"
2. Nom : `estimations`
3. Public : ❌ NON (privé)
4. Créer

Ensuite, exécuter les policies Storage de la migration 0004.

## Étape 4 : Créer un utilisateur admin

### Via Supabase Auth Dashboard

1. Aller dans **Authentication** > **Users**
2. Cliquer sur "Add user"
3. Entrer :
   - Email : `admin@jurabreak.fr` (ou votre email)
   - Mot de passe : (choisir un mot de passe sécurisé)
4. Créer l'utilisateur
5. Noter l'UUID de l'utilisateur (colonne `id`)

### Via SQL

Aller dans **SQL Editor** et exécuter :

```sql
-- Remplacer 'UUID_DE_L_UTILISATEUR' par l'UUID réel de l'étape précédente
INSERT INTO profiles (id, email, role)
VALUES ('UUID_DE_L_UTILISATEUR'::uuid, 'admin@jurabreak.fr', 'admin')
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', email = 'admin@jurabreak.fr';
```

Vérifier :
```sql
SELECT id, email, role FROM profiles WHERE role = 'admin';
```

Vous devriez voir votre utilisateur admin.

## Étape 5 : Vérifier la configuration

### Exécuter le script de vérification

Dans **SQL Editor**, exécuter le contenu de `/scripts/verify_rls.sql`

Vérifier que :
- ✅ Toutes les tables ont `rls_enabled = true`
- ✅ Chaque table a au moins une policy
- ✅ Aucune table sensible sans protection
- ✅ La fonction `is_admin()` existe et a `is_security_definer = true`

### Tester les permissions

#### Test 1 : Accès public aux annonces
```sql
-- Se déconnecter (mode anonyme)
-- Exécuter :
SELECT * FROM annonces WHERE is_deleted = false AND published_at IS NOT NULL;
```
Devrait retourner les annonces publiées.

#### Test 2 : Accès refusé aux leads
```sql
-- Mode anonyme
SELECT * FROM leads;
```
Devrait échouer avec "permission denied".

#### Test 3 : Admin full access
```sql
-- Se connecter avec l'utilisateur admin
-- Exécuter :
SELECT * FROM leads;
SELECT * FROM estimations;
SELECT * FROM analytics_events;
```
Devrait fonctionner.

## Étape 6 : Peupler les settings par défaut

Les settings de base ont été insérés automatiquement par la migration 0001.

Pour personnaliser :

```sql
UPDATE agence_settings 
SET value = '"contact@jurabreak.fr"'::jsonb 
WHERE key = 'contact_email';

UPDATE agence_settings 
SET value = '"06 XX XX XX XX"'::jsonb 
WHERE key = 'contact_phone';

-- Ajouter la biographie
UPDATE agence_settings 
SET value = '"Votre biographie ici..."'::jsonb 
WHERE key = 'about_biography';
```

## Étape 7 : Configurer les URLs dans Next.js

Dans le projet Next.js, créer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Étape 8 : Tester localement

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000` et vérifier :
- ✅ La page d'accueil se charge
- ✅ Pas d'erreur console liée à Supabase
- ✅ Connexion admin fonctionne à `/admin/login`

## Troubleshooting

### Erreur : "relation does not exist"
➡️ Les migrations n'ont pas été exécutées correctement. Ré-exécuter dans l'ordre.

### Erreur : "permission denied for table"
➡️ RLS est activé mais les policies ne sont pas correctes. Vérifier la migration 0002.

### Erreur : "function is_admin() does not exist"
➡️ La fonction n'a pas été créée. Exécuter la première partie de la migration 0002.

### Les images ne s'affichent pas
➡️ Vérifier que les buckets Storage sont créés et publics (sauf `estimations`).

### L'admin ne peut pas se connecter
➡️ Vérifier que le profil existe avec `role = 'admin'` dans la table `profiles`.

## Support

Pour toute question sur la configuration Supabase, consulter :
- [Documentation Supabase](https://supabase.com/docs)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
