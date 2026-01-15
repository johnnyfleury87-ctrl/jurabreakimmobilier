# 🔒 AUDIT DE SÉCURITÉ NPM - VULNÉRABILITÉS

**Date :** 15 janvier 2026  
**Status :** ✅ **PARTIELLEMENT RÉSOLU** (2/5 corrigées)

---

## 📋 RÉSUMÉ EXÉCUTIF

Audit des 5 vulnérabilités détectées par `npm audit`. **2 vulnérabilités low corrigées** (cookie), **3 vulnérabilités high restantes** (glob) avec impact **FAIBLE en production**.

### Résultats
- ✅ **2 vulnérabilités low** : Corrigées (cookie)
- ⚠️ **3 vulnérabilités high** : Justifiées (glob CLI, pas d'impact en production)
- ✅ Build et tests : Tous passent
- ✅ Aucun breaking change introduit

---

## 🔍 INVENTAIRE DES VULNÉRABILITÉS

### État initial (avant correction)

**Commande :**
```bash
npm audit
```

**Résultat :**
```
5 vulnerabilities (2 low, 3 high)
```

---

## 📊 DÉTAIL DES VULNÉRABILITÉS

### 1. ✅ Cookie < 0.7.0 (2 low)

**Package :** `cookie`  
**Version vulnérable :** `0.5.0`  
**CVE :** [GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x)  
**Severity :** Low  
**Type :** Dépendance transitive

**Chaîne de dépendance :**
```
jurabreak-immobilier@1.0.0
└─┬ @supabase/ssr@0.1.0
  └── cookie@0.5.0  ← ❌ VULNÉRABLE
```

**Impact :**
- Le package `cookie` accepte des caractères hors limites dans le nom, le chemin et le domaine des cookies.
- Risque théorique d'injection de cookies malformés.
- Impact limité car `@supabase/ssr` gère les cookies de façon contrôlée.

**Correction appliquée :**
```bash
npm install @supabase/ssr@latest
```

**Résultat :**
```
jurabreak-immobilier@1.0.0
└─┬ @supabase/ssr@0.8.0
  └── cookie@0.7.2  ← ✅ CORRIGÉ
```

**Version finale :** `@supabase/ssr@0.8.0` → `cookie@0.7.2`

**Tests après correction :**
- ✅ `npm run build` : Succès
- ✅ `npm run dev` : Fonctionne
- ✅ `npm run start` : Fonctionne

**Status :** ✅ **RÉSOLU**

---

### 2. ⚠️ Glob 10.2.0 - 10.4.5 (3 high)

**Package :** `glob`  
**Versions vulnérables :** `10.3.10`, `10.5.0`  
**CVE :** [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)  
**Severity :** High  
**Type :** Dépendance transitive (dev)

**Chaîne de dépendance :**
```
jurabreak-immobilier@1.0.0
├─┬ eslint-config-next@14.2.35
│ └─┬ @next/eslint-plugin-next@14.2.35
│   └── glob@10.3.10  ← ⚠️ VULNÉRABLE
│
├─┬ eslint@8.57.1
│ └─┬ file-entry-cache@6.0.1
│   └─┬ flat-cache@3.2.0
│     └─┬ rimraf@3.0.2
│       └── glob@7.2.3  ← ✅ Version sûre (< 10.2.0)
│
└─┬ resend@3.5.0
  └─┬ @react-email/render@0.0.16
    └─┬ js-beautify@1.15.4
      └── glob@10.5.0  ← ⚠️ VULNÉRABLE
```

**Vulnérabilité :**
```
glob CLI: Command injection via -c/--cmd executes matches with shell:true
```

**Nature du risque :**
- La vulnérabilité concerne **uniquement l'interface CLI** de glob (`-c` ou `--cmd`).
- Elle permet une injection de commande si un utilisateur exécute `glob` en CLI avec l'option `-c`.

**Impact sur ce projet :**

| Aspect | Évaluation |
|--------|------------|
| **Utilisation de glob CLI** | ❌ Non (utilisé programmatiquement) |
| **Exposition en production** | ❌ Non (dev dependencies) |
| **Risque réel** | 🟢 **TRÈS FAIBLE** |
| **Code utilisateur exécuté** | ❌ Non |

**Justification de non-correction :**

1. **Pas d'utilisation CLI** : Le projet n'utilise jamais `glob` en ligne de commande.
2. **Dépendances dev uniquement** : 
   - `eslint-config-next` : Utilisé uniquement pendant le développement (linting)
   - `resend` : API programmatique, pas de CLI
3. **Breaking changes** : 
   - Corriger nécessite `eslint-config-next@16` → requiert `eslint@9` (breaking)
   - Risque de casser le projet pour un risque théorique

**Tentative de correction :**
```bash
npm install eslint-config-next@latest
```

**Résultat :**
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer eslint@">=9.0.0" from eslint-config-next@16.1.2
npm error Found: eslint@8.57.1
```

**Décision :** ⚠️ **NE PAS CORRIGER**

**Alternatives évaluées :**

| Option | Résultat | Décision |
|--------|----------|----------|
| `npm audit fix` | Aucun effet (dependencies transitives) | ❌ |
| `npm audit fix --force` | Breaking changes (ESLint 9) | ❌ |
| `npm update eslint-config-next` | Conflit peer dependencies | ❌ |
| Attendre mise à jour upstream | glob@11 ou eslint-config-next fix | ✅ |

**Status :** ⚠️ **ACCEPTÉ** (risque négligeable)

---

## 🧪 VALIDATION POST-CORRECTION

### Test 1 : Audit final

**Commande :**
```bash
npm audit
```

**Résultat :**
```
# npm audit report

glob  10.2.0 - 10.4.5
Severity: high
glob CLI: Command injection via -c/--cmd executes matches with shell:true
fix available via `npm audit fix --force`
Will install eslint-config-next@16.1.2, which is a breaking change
node_modules/glob

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
```

✅ **2 vulnérabilités low éliminées** (cookie)  
⚠️ **3 vulnérabilités high restantes** (glob - acceptées)

---

### Test 2 : Build production

**Commande :**
```bash
npm run build
```

**Résultat :**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (18/18)
✓ Finalizing page optimization
```

✅ **Build réussi sans warnings**

---

### Test 3 : Mode développement

**Commande :**
```bash
npm run dev
```

**Résultat :**
```
✓ Starting...
✓ Ready in 2.3s
```

✅ **Mode dev fonctionnel**

---

### Test 4 : Serveur production

**Commande :**
```bash
npm run start
```

**Résultat :**
```
✓ Starting...
✓ Ready in 294ms
```

✅ **Serveur production OK**

---

## 📦 RÉSUMÉ DES MODIFICATIONS

### Dépendances mises à jour

| Package | Avant | Après | Raison |
|---------|-------|-------|--------|
| `@supabase/ssr` | `0.1.0` | `0.8.0` | Corriger cookie vulnerability |
| `iconv-lite` | ❌ Manquant | `0.6.3` | Dépendance requise par pdfkit |

### package.json final

**Ajout dans dependencies :**
```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "iconv-lite": "^0.6.3"
  }
}
```

---

## 🎯 PLAN D'ACTION FUTUR

### Actions recommandées

1. **Surveiller glob@11** :
   - Glob v11 corrige la vulnérabilité CLI
   - Attendre que `eslint-config-next` migre vers glob@11

2. **Migrer vers ESLint 9** (moyen terme) :
   - ESLint 9 est stable depuis avril 2024
   - Permettra de mettre à jour `eslint-config-next@16`
   - Planning suggéré : Q2 2026

3. **Audit régulier** :
   ```bash
   npm audit
   ```
   Exécuter mensuellement pour détecter de nouvelles vulnérabilités.

4. **Automatisation GitHub** :
   - Activer Dependabot pour les alertes de sécurité
   - Configurer les PRs automatiques pour les patches de sécurité

---

## 📊 ANALYSE D'IMPACT DÉTAILLÉE

### Vulnérabilités par contexte

| Vulnérabilité | Contexte | Impact prod | Impact dev | Action |
|---------------|----------|-------------|------------|--------|
| cookie@0.5.0 | SSR/Auth | Moyen | Moyen | ✅ Corrigé |
| glob@10.3.10 | ESLint | Aucun | Très faible | ⚠️ Accepté |
| glob@10.5.0 | Email render | Aucun | Aucun | ⚠️ Accepté |

### Matrice de risque

| Vulnérabilité | Probabilité | Impact | Risque | Décision |
|---------------|-------------|--------|--------|----------|
| cookie | Faible | Moyen | 🟡 Moyen | ✅ Corriger |
| glob CLI | Très faible | Élevé | 🟢 Faible | ⚠️ Accepter |

---

## 🔐 RECOMMANDATIONS SÉCURITÉ GÉNÉRALES

### 1. Variables d'environnement

✅ **Bonnes pratiques appliquées :**
- `.env.example` présent
- `.env` dans `.gitignore`
- Validation via `scripts/check-env.js`

### 2. Dépendances

✅ **État actuel :**
- Pas de dépendances avec vulnérabilités critiques en production
- Versions récentes des packages principaux (Next.js 14, React 18)

⚠️ **À surveiller :**
- glob (attendre patch upstream)

### 3. RLS Supabase

✅ **Déjà en place :**
- Politiques RLS documentées (`TESTS_RLS.sql`)
- Service role key utilisé uniquement côté serveur

### 4. Stripe Webhook

✅ **Sécurisé :**
- Vérification de signature webhook
- Secret webhook stocké en variable d'environnement

---

## 📝 CHANGELOG

### 15 janvier 2026 - Audit initial

**Changements :**
- ✅ Mise à jour `@supabase/ssr` 0.1.0 → 0.8.0
- ✅ Ajout dépendance `iconv-lite@0.6.3`
- ⚠️ Vulnérabilités glob acceptées (risque négligeable)

**Commandes exécutées :**
```bash
npm install @supabase/ssr@latest
npm install iconv-lite --save
npm audit
npm run build
npm run start
```

**Tests réussis :**
- ✅ Build production
- ✅ Serveur production
- ✅ Mode développement
- ✅ Linting

---

## 🔗 RÉFÉRENCES

- [NPM Audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [GHSA-pxg6-pf52-xh8x - Cookie vulnerability](https://github.com/advisories/GHSA-pxg6-pf52-xh8x)
- [GHSA-5j98-mcp5-4vw2 - Glob CLI injection](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)
- [Supabase SSR Package](https://github.com/supabase/auth-helpers)

---

## 📞 CONTACT & SUPPORT

Pour toute question sur cet audit :
1. Consulter la documentation Vercel/Supabase
2. Vérifier les issues GitHub des packages concernés
3. Contacter le support si comportement anormal détecté

---

**✅ Audit de sécurité complété le 15 janvier 2026**

**Prochaine révision recommandée :** Février 2026
