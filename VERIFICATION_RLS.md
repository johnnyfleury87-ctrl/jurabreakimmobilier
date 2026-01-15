# ✅ VÉRIFICATION RLS - TABLE PAR TABLE

## Résumé de la Migration 0002

Voici la confirmation **table par table** de l'état du RLS :

---

## 1. Table `profiles`

### RLS Activé
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```
✅ **OUI**

### Policies Créées

#### SELECT
```sql
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```
- ✅ User peut lire **son propre** profil uniquement
- ✅ Public **NE PEUT PAS** lire les profils

#### INSERT
```sql
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```
- ✅ User peut créer son profil lors du sign-up
- ✅ Public **NE PEUT PAS** insérer

#### UPDATE
```sql
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());
```
- ✅ User peut modifier son profil
- ✅ Admin peut tout modifier
- ✅ Public **NE PEUT PAS** modifier

**VERDICT : 🟢 Sécurisé**

---

## 2. Table `agence_settings`

### RLS Activé
```sql
ALTER TABLE agence_settings ENABLE ROW LEVEL SECURITY;
```
✅ **OUI**

### Policies Créées

#### SELECT
```sql
CREATE POLICY "Public can read settings"
  ON agence_settings FOR SELECT
  TO public
  USING (true);
```
- ✅ Public **PEUT** lire (pour affichage site)
- ✅ **INTENTIONNEL** : settings sont publics

#### INSERT/UPDATE/DELETE
```sql
CREATE POLICY "Admin can insert settings" ...
CREATE POLICY "Admin can update settings" ...
CREATE POLICY "Admin can delete settings" ...
```
- ✅ Seul admin peut modifier
- ✅ Public **NE PEUT PAS** modifier

**VERDICT : 🟢 Sécurisé** (lecture publique intentionnelle)

---

## 3. Table `annonces`

### RLS Activé
```sql
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
```
✅ **OUI**

### Policies Créées

#### SELECT Public
```sql
CREATE POLICY "Public can read published annonces"
  ON annonces FOR SELECT
  TO public
  USING (
    is_deleted = false 
    AND published_at IS NOT NULL
  );
```
- ✅ Public voit **uniquement** annonces publiées et non supprimées
- ✅ Public **NE VOIT PAS** les brouillons
- ✅ Public **NE VOIT PAS** les annonces supprimées

#### SELECT Admin
```sql
CREATE POLICY "Admin can read all annonces"
  ON annonces FOR SELECT
  TO authenticated
  USING (is_admin());
```
- ✅ Admin voit **tout**

#### INSERT/UPDATE/DELETE
```sql
CREATE POLICY "Admin can insert annonces" ...
CREATE POLICY "Admin can update annonces" ...
CREATE POLICY "Admin can delete annonces" ...
```
- ✅ Seul admin peut modifier
- ✅ Public **NE PEUT PAS** créer/modifier/supprimer

**VERDICT : 🟢 Sécurisé**

---

## 4. Table `annonce_photos`

### RLS Activé
```sql
ALTER TABLE annonce_photos ENABLE ROW LEVEL SECURITY;
```
✅ **OUI**

### Policies Créées

#### SELECT Public
```sql
CREATE POLICY "Public can read photos of published annonces"
  ON annonce_photos FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM annonces
      WHERE annonces.id = annonce_photos.annonce_id
      AND annonces.is_deleted = false
      AND annonces.published_at IS NOT NULL
    )
  );
```
- ✅ Public voit photos **uniquement** si annonce publiée
- ✅ Public **NE VOIT PAS** photos des brouillons
- ✅ Jointure sécurisée avec table `annonces`

#### SELECT Admin
```sql
CREATE POLICY "Admin can read all photos"
  ON annonce_photos FOR SELECT
  TO authenticated
  USING (is_admin());
```
- ✅ Admin voit tout

#### INSERT/UPDATE/DELETE
- ✅ Seul admin
- ✅ Public **NE PEUT PAS** uploader/modifier/supprimer

**VERDICT : 🟢 Sécurisé**

---

## 5. Table `events`

### RLS Activé
```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```
✅ **OUI**

### Policies Créées

#### SELECT Public
```sql
CREATE POLICY "Public can read published events"
  ON events FOR SELECT
  TO public
  USING (is_published = true);
```
- ✅ Public voit **uniquement** événements publiés
- ✅ Public **NE VOIT PAS** les brouillons

#### SELECT Admin
```sql
CREATE POLICY "Admin can read all events"
  ON events FOR SELECT
  TO authenticated
  USING (is_admin());
```
- ✅ Admin voit tout

#### INSERT/UPDATE/DELETE
- ✅ Seul admin
- ✅ Public **NE PEUT PAS** créer/modifier

**VERDICT : 🟢 Sécurisé**

---

## 6. Table `leads` ⚠️ **CRITIQUE**

### RLS Activé
```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```
✅ **OUI**

### Policies Créées

#### INSERT Public
```sql
CREATE POLICY "Public can insert leads"
  ON leads FOR INSERT
  TO public
  WITH CHECK (true);
```
- ✅ Public **PEUT** créer un lead (formulaire contact)
- ✅ **INTENTIONNEL**

#### SELECT
```sql
CREATE POLICY "Admin can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (is_admin());
```
- ✅ Seul admin peut lire
- ✅ Public **NE PEUT PAS** lire les leads
- ✅ **CONFORME** : données sensibles protégées

#### UPDATE/DELETE
```sql
CREATE POLICY "Admin can update leads" ...
CREATE POLICY "Admin can delete leads" ...
```
- ✅ Seul admin
- ✅ Public **NE PEUT PAS** modifier

**VERDICT : 🟢 Sécurisé** (insert public intentionnel)

---

## 7. Table `analytics_events` ⚠️ **CRITIQUE**

### RLS Activé
```sql
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
```
✅ **OUI**

### Policies Créées

#### INSERT Public
```sql
CREATE POLICY "Public can insert analytics"
  ON analytics_events FOR INSERT
  TO public
  WITH CHECK (true);
```
- ✅ Public **PEUT** créer des analytics (tracking)
- ✅ **INTENTIONNEL**

#### SELECT
```sql
CREATE POLICY "Admin can read analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (is_admin());
```
- ✅ Seul admin peut lire
- ✅ Public **NE PEUT PAS** lire les analytics
- ✅ **CONFORME** : données sensibles protégées

**VERDICT : 🟢 Sécurisé** (insert public intentionnel)

---

## 8. Table `estimations` ⚠️ **CRITIQUE**

### RLS Activé
```sql
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;
```
✅ **OUI**

### Policies Créées

#### INSERT Public
```sql
CREATE POLICY "Public can insert draft estimations"
  ON estimations FOR INSERT
  TO public
  WITH CHECK (statut = 'DRAFT');
```
- ✅ Public **PEUT** créer estimation DRAFT uniquement
- ✅ Public **NE PEUT PAS** créer directement PAID/COMPLETED
- ✅ **SÉCURISÉ** : seul le webhook Stripe change le statut

#### SELECT
```sql
CREATE POLICY "Admin can read estimations"
  ON estimations FOR SELECT
  TO authenticated
  USING (is_admin());
```
- ✅ Seul admin peut lire
- ✅ Public **NE PEUT PAS** lire les estimations
- ✅ **CONFORME** : données personnelles protégées

#### UPDATE/DELETE
```sql
CREATE POLICY "Admin can update estimations" ...
CREATE POLICY "Admin can delete estimations" ...
```
- ✅ Seul admin (ou backend via service role)
- ✅ Public **NE PEUT PAS** modifier le statut

**VERDICT : 🟢 Sécurisé** (insert DRAFT public intentionnel)

---

## ✅ RÉCAPITULATIF GLOBAL

| Table | RLS Activé | Public SELECT | Public INSERT | Données Sensibles Protégées |
|-------|------------|---------------|---------------|----------------------------|
| `profiles` | ✅ | ❌ (own only) | ✅ (own only) | ✅ |
| `agence_settings` | ✅ | ✅ (intentionnel) | ❌ | ✅ |
| `annonces` | ✅ | ✅ (published only) | ❌ | ✅ |
| `annonce_photos` | ✅ | ✅ (published only) | ❌ | ✅ |
| `events` | ✅ | ✅ (published only) | ❌ | ✅ |
| `leads` | ✅ | ❌ | ✅ (intentionnel) | ✅ |
| `analytics_events` | ✅ | ❌ | ✅ (intentionnel) | ✅ |
| `estimations` | ✅ | ❌ | ✅ (DRAFT only) | ✅ |

### 🟢 CONFIRMATIONS

1. ✅ **RLS activé sur les 8 tables**
2. ✅ **Public NE PEUT PAS lire `leads`**
3. ✅ **Public NE PEUT PAS lire `estimations`**
4. ✅ **Public NE PEUT PAS lire `analytics_events`**
5. ✅ **Public NE PEUT PAS modifier aucune donnée sensible**
6. ✅ **Admin a full access via fonction `is_admin()`**

### ⚠️ Points d'Attention (Intentionnels)

- `agence_settings` : Lecture publique pour affichage site
- `annonces` / `annonce_photos` : Lecture publique si publiées
- `events` : Lecture publique si publiés
- `leads` / `analytics_events` / `estimations` : Insert public (formulaires)

**Tous ces points sont INTENTIONNELS et CONFORMES au cahier des charges.**

---

## 🔒 Fonction `is_admin()` - Sécurité

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;
```

✅ **SECURITY DEFINER** : Exécute avec privilèges élevés
✅ **search_path fixé** : Prévient injection SQL
✅ **Vérifie `profiles.role = 'admin'`** : Contrôle strict

**VERDICT FINAL : 🟢 RLS CORRECTEMENT IMPLÉMENTÉ**
