# 🔧 RÉSOLUTION DE PROBLÈMES - Admin JuraBreak

## 🚨 Erreurs fréquentes et solutions

### ❌ ERREUR 401: "Non autorisé" sur `/api/admin/annonces`

**Symptôme:**
- La liste des annonces n'apparaît pas
- Console: `GET /api/admin/annonces 401 Unauthorized`
- Message: "Erreur lors du chargement des annonces"

**Causes possibles:**

#### 1️⃣ Variables d'environnement manquantes

**Vérification:**
```bash
cat .env.local | grep SUPABASE
```

**Attendu:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Solution:**
1. Aller sur Supabase Dashboard > Settings > API
2. Copier URL et ANON KEY
3. Coller dans `.env.local`
4. Redémarrer le serveur (`npm run dev`)

---

#### 2️⃣ Email non dans l'allowlist

**Vérification:**
```bash
grep -A 5 "ADMIN_EMAILS" src/lib/auth/config.js
```

**Attendu:**
```javascript
export const ADMIN_EMAILS = [
  'contact@jurabreak.fr',
  'lolita@jurabreak.fr',
]
```

**Solution:**
- Ajouter votre email à `ADMIN_EMAILS`
- Redémarrer le serveur

---

#### 3️⃣ Session Supabase expirée

**Solution:**
1. Se déconnecter: `/admin/logout`
2. Se reconnecter: `/admin/login`
3. Vérifier les cookies (F12 > Application > Cookies)
   - Doit contenir: `sb-xxx-auth-token`

---

#### 4️⃣ Logs API pour déboguer

**Activer logs détaillés:**

Fichier: `src/app/api/admin/annonces/route.js`

Les logs sont déjà activés:
```javascript
console.log('🔍 GET /api/admin/annonces - Auth check:', {
  hasUser: !!user,
  email: user?.email,
  authError: authError?.message
})
```

**Vérifier dans la console serveur (terminal npm run dev):**
```
🔍 GET /api/admin/annonces - Auth check: {
  hasUser: true,
  email: 'lolita@jurabreak.fr',
  authError: undefined
}
✅ Admin autorisé: lolita@jurabreak.fr
✅ 5 annonces récupérées
```

Si vous voyez `❌ Email non autorisé: xxx@example.com`, ajouter l'email à l'allowlist.

---

### ❌ ERREUR 404: Routes admin introuvables

**Symptôme:**
- Console: `GET /admin/leads 404`
- Console: `GET /admin/estimations 404`
- Liens dans la sidebar ne fonctionnent pas

**Explication:**
Ces routes ont été **volontairement supprimées** pour nettoyer l'admin.

**Solution:**
✅ **C'est normal !** La sidebar a été nettoyée.

Seules les routes existantes:
- `/admin` (dashboard)
- `/admin/annonces` (liste)
- `/admin/annonces/new` (créer)
- `/admin/annonces/[id]/edit` (modifier)
- `/admin/logout` (déconnexion)

---

### ❌ Photos ne s'uploadent pas

**Symptôme:**
- Upload photos bloque
- Console: `POST /api/admin/annonces/123/photos 500`
- Erreur: "Bucket not found"

**Solution:**

#### 1️⃣ Créer le bucket Supabase Storage

**Via Dashboard:**
1. Aller sur Supabase Dashboard
2. Storage > Create bucket
3. Nom: `annonces`
4. Public: ✅ Coché
5. Create

**Via SQL:**
```sql
-- Exécuter dans Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('annonces', 'annonces', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

#### 2️⃣ Appliquer les policies RLS

```bash
psql $DATABASE_URL -f supabase/migrations/0008_storage_annonces_photos.sql
```

Ou via Supabase SQL Editor, copier le contenu de:
`supabase/migrations/0008_storage_annonces_photos.sql`

#### 3️⃣ Vérifier les permissions

**Policies attendues:**
- `Les admins peuvent uploader des photos` (INSERT)
- `Les admins peuvent supprimer des photos` (DELETE)
- `Tout le monde peut voir les photos` (SELECT)
- `Les admins peuvent mettre à jour des photos` (UPDATE)

---

### ❌ Honoraires ne se calculent pas

**Symptôme:**
- Formulaire ne montre pas les honoraires
- Ou affiche 0€

**Solution:**

Vérifier que les champs sont remplis:
- **Type de bien:** maison/appartement/immeuble
- **Transaction:** VENTE ou LOCATION
- **Prix:** > 0 (pour vente)
- **Loyer HC:** > 0 (pour location)

**Règles honoraires:**

**VENTE:**
- Maison >100k = 7 000€
- Appartement >100k = 6 000€
- Immeuble 100k-500k = 9 000€
- Immeuble >500k = 15 000€
- Tous biens 50k-100k = 5 000€
- Tous biens 30k-50k = 3 500€
- Tous biens <30k = 2 500€

**LOCATION:**
- 1-399€ = 80% du loyer
- 400-799€ = 75% du loyer
- 800-1499€ = 60% du loyer
- \+ état des lieux: 3€/m²

---

### ❌ Annonce publique pas mise à jour immédiatement

**Symptôme:**
- Création/modification d'annonce OK
- Mais `/annonces` public ne change pas

**Solution:**

#### 1️⃣ En développement (npm run dev)

**C'est normal en mode dev.** Faire:
1. Refresh manuel de `/annonces` (F5)
2. Ou redémarrer le serveur

#### 2️⃣ En production (Vercel)

**Vérifier revalidation:**

Fichier: `src/app/api/admin/annonces/route.js`
```javascript
import { revalidatePath } from 'next/cache'

// Après create/update/delete:
revalidatePath('/annonces')
revalidatePath(`/annonces/${annonce.slug}`)
```

**Si ça ne fonctionne toujours pas:**
1. Vérifier que l'app est en mode `production` (pas `standalone`)
2. Check Vercel deployment logs
3. Désactiver ISR temporairement pour tester

---

### ❌ DEV_ADMIN_BYPASS actif en production

**Symptôme:**
- Bandeau jaune: "⚠️ DEV ADMIN BYPASS ACTIF"
- Tout le monde peut accéder à l'admin

**Solution:**

**CRITIQUE: Désactiver immédiatement !**

1. **Local (.env.local):**
   ```bash
   # DEV_ADMIN_BYPASS=false
   # Ou supprimer complètement la ligne
   ```

2. **Vercel (production):**
   - Aller sur Vercel Dashboard > Settings > Environment Variables
   - Supprimer `DEV_ADMIN_BYPASS`
   - Ou mettre à `false`
   - Redeploy

3. **Vérifier:**
   - Ne plus voir le bandeau jaune
   - Login obligatoire pour accéder à `/admin`

---

## 🧪 Tests de validation

**Exécuter le script de test:**
```bash
./scripts/test-admin-api.sh
```

**Attendu:**
```
✅ TOUS LES TESTS PASSÉS

L'admin est prêt à être utilisé:
  1. Démarrer: npm run dev
  2. Ouvrir: http://localhost:3000/admin/login
  3. Se connecter avec: lolita@jurabreak.fr
```

---

## 📞 Besoin d'aide supplémentaire ?

### Vérifier la console serveur (terminal)

Les logs serveur donnent des indices:
```bash
# Terminal où vous avez lancé npm run dev
# Chercher:
🔍 GET /api/admin/annonces - Auth check: ...
✅ ou ❌ messages
```

### Vérifier la console navigateur (F12)

```
❌ À surveiller:
- 404 Not Found (route manquante)
- 401 Unauthorized (auth échoue)
- 500 Server Error (bug serveur)
- CORS errors (config Supabase?)
```

### Vérifier Supabase Dashboard

1. **Auth > Users:** Vérifier que l'utilisateur existe
2. **Storage > annonces:** Vérifier que le bucket existe
3. **SQL Editor:** Tester queries directement
4. **Logs:** Voir les erreurs RLS/policies

---

## 📚 Documentation complète

- [CHECKLIST_ADMIN_PROPRE.md](./CHECKLIST_ADMIN_PROPRE.md) - Tests complets
- [QUICKSTART_ADMIN_PROPRE.md](./QUICKSTART_ADMIN_PROPRE.md) - Démarrage rapide
- [docs/ADMIN_SYSTEM.md](./docs/ADMIN_SYSTEM.md) - Architecture admin

---

**Si le problème persiste:**
1. Redémarrer le serveur
2. Vider le cache navigateur (Ctrl+Shift+Delete)
3. Tester en navigation privée
4. Vérifier les logs Supabase

**En dernier recours:**
```bash
# Réinitialiser node_modules
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

**Bonne chance !** 🚀
