# 🔒 Checklist de Sécurité des Variables d'Environnement

**Date** : 15 janvier 2026  
**Objectif** : Garantir qu'aucun secret n'est exposé dans le repository

---

## ✅ Vérifications Automatiques

### 1. Vérifier .gitignore

```bash
cat .gitignore | grep -E "\.env"
```

**Résultat attendu** :
```
.env*.local
.env
```

✅ Les fichiers `.env` et `.env.local` sont bien ignorés par Git.

---

### 2. Vérifier qu'aucun .env n'a été commité

```bash
git log --all --full-history -- ".env" ".env.local" ".env.production"
```

**Résultat attendu** : Aucune sortie (aucun commit contenant ces fichiers)

---

### 3. Vérifier .env.example

```bash
grep -E "(eyJ|sk_|whsec_|re_|price_[0-9])" .env.example
```

**Résultat attendu** : Aucune sortie (pas de vraies clés)

Si des vraies clés sont détectées :
```bash
# Remplacer par des placeholders
sed -i 's/eyJ[A-Za-z0-9_-]*/your-supabase-key/g' .env.example
sed -i 's/sk_test_[A-Za-z0-9]*/sk_test_.../g' .env.example
sed -i 's/whsec_[A-Za-z0-9]*/whsec_.../g' .env.example
```

---

### 4. Chercher des secrets hardcodés dans le code

```bash
# Chercher des patterns de clés Supabase
grep -r "eyJ" src/ --include="*.js" --include="*.jsx"

# Chercher des patterns de clés Stripe
grep -r "sk_test_\|sk_live_" src/ --include="*.js" --include="*.jsx"
```

**Résultat attendu** : Aucune sortie (aucun secret hardcodé)

---

### 5. Vérifier les variables NEXT_PUBLIC_*

```bash
grep -r "NEXT_PUBLIC_" src/ --include="*.js" --include="*.jsx" | grep -E "(SECRET|SERVICE_ROLE|PRIVATE)"
```

**Résultat attendu** : Aucune sortie (pas de clés server-only en NEXT_PUBLIC_)

---

## 🛡️ Bonnes Pratiques Vérifiées

### ✅ Variables Publiques (NEXT_PUBLIC_*)

- [x] `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase (publique)
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anon (publique, protégée par RLS)

**Justification** : Ces clés sont publiques par design. La sécurité est assurée par les policies RLS dans Supabase.

---

### ✅ Variables Server-Only (process.env.*)

- [x] `SUPABASE_SERVICE_ROLE_KEY` - Utilisée uniquement dans `/src/lib/supabase/admin.js`
- [x] `STRIPE_SECRET_KEY` - Utilisée uniquement dans API routes (`/src/app/api/*`)
- [x] `STRIPE_WEBHOOK_SECRET` - Utilisée uniquement dans `/src/app/api/webhooks/stripe/route.js`

**Vérification** :
```bash
# SUPABASE_SERVICE_ROLE_KEY doit être uniquement dans admin.js
grep -r "SUPABASE_SERVICE_ROLE_KEY" src/ --include="*.js"
```

**Résultat attendu** : Uniquement `src/lib/supabase/admin.js`

---

## 🚨 Actions en Cas de Fuite

### Si un secret a été commité par erreur

#### 1. Supprimer le secret du dernier commit (si pas encore pushé)

```bash
git reset --soft HEAD~1
# Éditer les fichiers pour retirer le secret
git add -A
git commit -m "Remove exposed secret"
```

#### 2. Si déjà pushé sur GitHub

⚠️ **Le secret est compromis et doit être régénéré**

**Actions immédiates** :

1. **Supabase Service Role Key**
   ```bash
   # Dans Supabase Dashboard → Settings → API
   # Cliquer sur "Reset service_role key"
   ```

2. **Stripe Secret Key**
   ```bash
   # Dans Stripe Dashboard → Developers → API Keys
   # Cliquer sur "Roll key" pour générer une nouvelle clé
   ```

3. **Webhook Secret**
   ```bash
   # Supprimer l'ancien webhook dans Stripe Dashboard
   # Créer un nouveau webhook → Copier le nouveau signing secret
   ```

4. **Mettre à jour Vercel**
   ```bash
   vercel env rm SUPABASE_SERVICE_ROLE_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # Coller la nouvelle clé
   ```

5. **Nettoyer l'historique Git (si nécessaire)**
   ```bash
   # Utiliser git-filter-repo ou BFG Repo-Cleaner
   # Attention : réécrit l'historique Git
   git filter-repo --invert-paths --path .env
   git push --force
   ```

6. **Notifier GitHub**
   - GitHub détecte automatiquement certains secrets
   - Suivre les instructions de révocation si vous recevez une alerte

---

## 📋 Checklist de Déploiement

Avant chaque déploiement en production :

- [ ] Exécuter `npm run env:check` en local
- [ ] Vérifier `.env.example` ne contient que des placeholders
- [ ] Vérifier `.gitignore` inclut `.env` et `.env.local`
- [ ] Vérifier qu'aucun `.env` n'est commité : `git ls-files | grep .env`
- [ ] Vérifier les variables Vercel : toutes les 8 requises configurées
- [ ] Tester le build local : `npm run build`
- [ ] Vérifier qu'aucun secret n'apparaît dans les logs du build

---

## 🔍 Audit de Sécurité Automatisé

Créer un script d'audit complet :

```bash
#!/bin/bash
# scripts/security-audit.sh

echo "🔒 Running security audit..."

# 1. Check .gitignore
echo "✓ Checking .gitignore..."
if ! grep -q "^\.env$" .gitignore; then
  echo "❌ .gitignore missing .env"
  exit 1
fi

# 2. Check for committed secrets
echo "✓ Checking for committed secrets..."
if git ls-files | grep -E "^\.env$|^\.env\.local$"; then
  echo "❌ .env files are committed!"
  exit 1
fi

# 3. Check .env.example
echo "✓ Checking .env.example..."
if grep -qE "(eyJ|sk_test|sk_live|whsec_)" .env.example; then
  echo "❌ Real secrets found in .env.example"
  exit 1
fi

# 4. Check for hardcoded secrets
echo "✓ Checking for hardcoded secrets..."
if grep -rE "(eyJ[A-Za-z0-9_-]{100,}|sk_test_[A-Za-z0-9]+|sk_live_[A-Za-z0-9]+)" src/; then
  echo "❌ Hardcoded secrets found in src/"
  exit 1
fi

# 5. Check NEXT_PUBLIC_ misuse
echo "✓ Checking NEXT_PUBLIC_ usage..."
if grep -rE "NEXT_PUBLIC_(SECRET|SERVICE_ROLE|PRIVATE)" src/; then
  echo "❌ Server-only keys exposed as NEXT_PUBLIC_"
  exit 1
fi

echo "✅ Security audit passed"
```

Usage :
```bash
chmod +x scripts/security-audit.sh
./scripts/security-audit.sh
```

---

## 📚 Ressources

- [OWASP Top 10 - Sensitive Data Exposure](https://owasp.org/www-project-top-ten/)
- [Next.js Environment Variables Best Practices](https://nextjs.org/docs/basic-features/environment-variables)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [Vercel Environment Variables Security](https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables)

---

## ✅ Validation Finale

Une configuration sécurisée doit respecter :

1. ✅ Aucun fichier `.env` ou `.env.local` commité
2. ✅ `.env.example` contient uniquement des placeholders
3. ✅ Aucun secret hardcodé dans `src/`
4. ✅ Variables server-only jamais préfixées `NEXT_PUBLIC_`
5. ✅ `.gitignore` correctement configuré
6. ✅ Script `npm run env:check` fonctionne
7. ✅ Variables Vercel correctement configurées
8. ✅ Secrets régénérés après toute exposition

**Si tous ces points sont validés, la configuration est sécurisée.** 🔒
