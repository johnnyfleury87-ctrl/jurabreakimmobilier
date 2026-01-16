# 🧪 CHECKLIST TEST ADMIN - 16 JANVIER 2026

**Serveur:** `http://localhost:3000`  
**User test:** `lolita@jurabreak.fr`

---

## ✅ TEST 1 : PAGE LOGIN (2 min)

### 1.1 Accès au login
- [ ] Ouvrir `http://localhost:3000/admin`
- [ ] Devrait rediriger vers `/admin/login` (si non connecté)
- [ ] Page login s'affiche correctement

### 1.2 Connexion magic link
- [ ] Entrer email: `lolita@jurabreak.fr`
- [ ] Cliquer "Envoyer le lien magique"
- [ ] Message de succès s'affiche
- [ ] Email reçu (vérifier inbox ou logs Supabase)

**Si problème:**
```bash
# Vérifier que l'utilisateur existe dans Supabase
# Dashboard > Authentication > Users
# Email: lolita@jurabreak.fr doit être listé
```

---

## ✅ TEST 2 : DASHBOARD ADMIN (1 min)

### 2.1 Après connexion
- [ ] Arrive sur `/admin` (dashboard)
- [ ] Aucune erreur 500
- [ ] Aucune page blanche
- [ ] Sidebar visible avec menu
- [ ] Email `lolita@jurabreak.fr` affiché en bas

### 2.2 Cards statistiques
- [ ] Card "Messages contact" affiche un nombre (même 0)
- [ ] Card "Estimations" affiche un nombre
- [ ] Card "Annonces" affiche un nombre
- [ ] Card "Événements" affiche un nombre
- [ ] Pas de "undefined" ni "null"

**Si erreur 500:**
```bash
# Vérifier les logs terminal
# Vérifier .env.local
# Vérifier que les tables existent dans Supabase
```

---

## ✅ TEST 3 : CRÉER ANNONCE TEST (2 min)

### 3.1 Navigation
- [ ] Cliquer sur "🏠 Annonces" dans la sidebar
- [ ] Arrive sur `/admin/annonces`
- [ ] Liste des annonces s'affiche (même vide)

### 3.2 Bouton annonce test
- [ ] Bouton "🧪 Annonce test" visible en haut
- [ ] Cliquer dessus
- [ ] Popup de confirmation apparaît
- [ ] Confirmer
- [ ] Loading pendant 1-2 secondes
- [ ] Message "✅ Annonce test créée avec succès !"
- [ ] Annonce apparaît dans la liste

### 3.3 Vérifications annonce créée
- [ ] Titre : "Maison test - [date/heure]"
- [ ] Type : Maison
- [ ] Prix : 250 000 €
- [ ] Ville : Lons-le-Saunier
- [ ] Statut : "À vendre" (badge vert)
- [ ] Visible : Œil ouvert 👁️

---

## ✅ TEST 4 : HONORAIRES AUTO (1 min)

### 4.1 Calcul automatique
- [ ] Annonce test créée avec prix 250 000 €
- [ ] Type : Maison
- [ ] Honoraires attendus : **7 000 € TTC** (maison > 100k)

### 4.2 Vérifier dans la base
```bash
# Option 1: Supabase Dashboard
# Table editor > annonces > Regarder la colonne honoraires_transaction

# Option 2: Console navigateur
# F12 > Network > Voir la réponse de l'API POST
```

**Attendu dans la réponse API:**
```json
{
  "annonce": {
    "prix": 250000,
    "type_bien": "maison",
    "honoraires_transaction": 7000,
    ...
  },
  "honoraires": {
    "type": "VENTE",
    "total": 7000,
    ...
  }
}
```

---

## ✅ TEST 5 : CÔTÉ PUBLIC (2 min)

### 5.1 Liste des annonces
- [ ] Ouvrir nouvel onglet : `http://localhost:3000/annonces`
- [ ] Annonce test apparaît dans la liste
- [ ] Photo placeholder si pas de photo
- [ ] Prix : 250 000 €
- [ ] Badge "À vendre" visible
- [ ] Localisation : Lons-le-Saunier (39000)

### 5.2 Page détail
- [ ] Cliquer sur l'annonce
- [ ] Page `/annonces/[slug]` s'ouvre
- [ ] Toutes les infos affichées
- [ ] **Section honoraires visible**
- [ ] Honoraires : 7 000 € TTC
- [ ] Prix total affiché (prix + honoraires)

---

## ✅ TEST 6 : MODIFIER ANNONCE (3 min)

### 6.1 Modifier le prix
- [ ] Retour sur `/admin/annonces`
- [ ] Cliquer "✏️ Modifier" sur l'annonce test
- [ ] Changer le prix à **150 000 €**
- [ ] Cliquer "Enregistrer"
- [ ] Retour à la liste
- [ ] Prix mis à jour : 150 000 €

### 6.2 Vérifier recalcul honoraires
- [ ] Prix : 150 000 €
- [ ] Type : Maison
- [ ] Honoraires attendus : **7 000 €** (toujours, maison > 100k)

### 6.3 Mise à jour immédiate côté public
- [ ] Recharger `/annonces`
- [ ] Prix affiché : 150 000 €
- [ ] Pas besoin de vider le cache
- [ ] Changement instantané

---

## ✅ TEST 7 : CHANGER STATUT (1 min)

### 7.1 Dans la liste admin
- [ ] Menu déroulant "Statut" visible sur chaque annonce
- [ ] Changer de "À vendre" → "Sous compromis"
- [ ] Badge devient orange 🟠
- [ ] Changement instantané (pas de rechargement)

### 7.2 Côté public
- [ ] Recharger `/annonces`
- [ ] Badge "Sous compromis" affiché
- [ ] Couleur orange

---

## ✅ TEST 8 : MASQUER/AFFICHER (1 min)

### 8.1 Masquer
- [ ] Cliquer sur l'œil 👁️ dans la liste admin
- [ ] Icône devient 🔒
- [ ] Annonce reste dans la liste admin (onglet "Cachées")

### 8.2 Vérifier côté public
- [ ] Recharger `/annonces`
- [ ] **Annonce n'apparaît plus**
- [ ] Liste vide ou sans cette annonce

### 8.3 Réafficher
- [ ] Retour admin, re-cliquer sur 🔒
- [ ] Redevient 👁️
- [ ] Recharger `/annonces`
- [ ] **Annonce réapparaît**

---

## ✅ TEST 9 : SUPPRIMER (1 min)

### 9.1 Soft delete
- [ ] Cliquer sur "🗑️" (poubelle)
- [ ] Popup de confirmation
- [ ] Confirmer
- [ ] Annonce disparaît de la liste

### 9.2 Onglet "Supprimées"
- [ ] Cliquer sur filtre "Supprimées"
- [ ] Annonce apparaît dans cet onglet
- [ ] Marquée comme supprimée

### 9.3 Côté public
- [ ] Recharger `/annonces`
- [ ] **Annonce n'apparaît plus**

---

## ✅ TEST 10 : CRÉER VRAIE ANNONCE (5 min)

### 10.1 Nouvelle annonce manuelle
- [ ] Cliquer "+ Nouvelle annonce"
- [ ] Formulaire complet s'affiche
- [ ] Remplir les champs obligatoires:
  - Titre: "Test manuel complet"
  - Type bien: Appartement
  - Transaction: Vente
  - Ville: Arbois
  - Code postal: 39600
  - Prix: 180 000 €
  - Surface: 85 m²
  - Pièces: 4
  - Chambres: 2

### 10.2 Honoraires temps réel
- [ ] Dans la section "Prix", observer un encadré
- [ ] **Honoraires affichés : 6 000 € TTC**
- [ ] (Appartement > 100k = 6000)
- [ ] Changement dynamique si on modifie le prix

### 10.3 Sauvegarder
- [ ] Cliquer "Créer l'annonce"
- [ ] Succès
- [ ] Annonce apparaît dans `/admin/annonces`
- [ ] Honoraires corrects dans la base

---

## ✅ TEST 11 : LOCATION (3 min)

### 11.1 Annonce location
- [ ] "+ Nouvelle annonce"
- [ ] Type transaction: **Location**
- [ ] Type bien: Appartement
- [ ] Loyer HC: 650 €
- [ ] Surface: 60 m²

### 11.2 Calcul honoraires location
**Formule attendue:**
- Loyer 650 € → tranche 400-799 → 75% = **487,50 €**
- État des lieux : 60 m² × 3 € = **180 €**
- **Total : 667,50 €**

- [ ] Honoraires location : 487,50 €
- [ ] Honoraires état des lieux : 180 €
- [ ] Total affiché : 667,50 €

### 11.3 Côté public
- [ ] Sauvegarder
- [ ] Aller sur `/annonces`
- [ ] Filtrer "Location"
- [ ] Annonce visible
- [ ] Loyer affiché : 650 € HC /mois
- [ ] Honoraires détaillés sur la page détail

---

## 🎯 RÉSULTAT ATTENDU

### ✅ Tous les tests passent = SYSTÈME FONCTIONNEL

**Taux de réussite :**
- [ ] 11/11 tests OK → 🎉 Livraison validée
- [ ] 9-10/11 OK → ⚠️ Problèmes mineurs
- [ ] < 9/11 OK → ❌ Bugs critiques

---

## 🐛 SI UN TEST ÉCHOUE

### Erreur 500 / Page blanche
```bash
# Terminal 1: Regarder les logs
npm run dev

# Terminal 2: Vérifier les erreurs
tail -f .next/server/errors.log
```

### Honoraires incorrects
```javascript
// Vérifier la fonction dans src/lib/honoraires.js
// Tester manuellement:
import { calculerHonoraires } from '@/lib/honoraires'

const result = calculerHonoraires({
  typeTransaction: 'VENTE',
  typeBien: 'maison',
  prix: 250000,
  loyerHC: 0,
  surfaceM2: 120
})
console.log(result) // Devrait afficher { total: 7000, ... }
```

### Annonce pas visible côté public
```bash
# 1. Vérifier que visible = true
# 2. Vérifier que is_deleted = false
# 3. Forcer revalidation:
curl http://localhost:3000/api/revalidate?path=/annonces
```

### Problème de connexion
```bash
# Supabase Dashboard
# Authentication > Users
# Vérifier que lolita@jurabreak.fr existe
# Status: "Confirmed"
```

---

## 📝 NOTES

- **Tous les tests doivent passer sans modification de code**
- **Les honoraires se calculent automatiquement (pas de saisie manuelle)**
- **Les changements côté admin sont immédiatement visibles côté public**
- **Aucune erreur 500, aucune page blanche**

---

**✅ PRÊT POUR LE TEST !**  
**Durée totale estimée : 25-30 minutes**
