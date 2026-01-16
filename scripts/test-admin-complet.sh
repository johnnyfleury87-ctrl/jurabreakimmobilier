#!/bin/bash
# Test complet admin - Vérification structurelle
echo "🧪 TEST ADMIN COMPLET - JURABREAK IMMOBILIER"
echo "=============================================="
echo ""

# 1. Vérifier variables d'environnement
echo "1️⃣ Variables d'environnement:"
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null; then
  echo "   ✅ NEXT_PUBLIC_SUPABASE_URL définie"
else
  echo "   ❌ NEXT_PUBLIC_SUPABASE_URL manquante"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local 2>/dev/null; then
  echo "   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY définie"
else
  echo "   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante"
fi

BYPASS=$(grep "NEXT_PUBLIC_DEV_ADMIN_BYPASS" .env.local 2>/dev/null | cut -d'=' -f2)
echo "   ℹ️  DEV_ADMIN_BYPASS=$BYPASS"
echo ""

# 2. Vérifier que toutes les routes API admin ont export const dynamic
echo "2️⃣ Vérification export const dynamic sur routes API:"
API_ROUTES=$(find src/app/api/admin -name "*.js" -type f)
for route in $API_ROUTES; do
  if grep -q "export const dynamic = 'force-dynamic'" "$route"; then
    echo "   ✅ $route"
  else
    echo "   ❌ $route - MANQUE export const dynamic"
  fi
done
echo ""

# 3. Vérifier credentials: include dans fetch
echo "3️⃣ Vérification credentials: 'include' dans fetch:"
if grep -r "credentials: 'include'" src/app/admin/ > /dev/null 2>&1; then
  echo "   ✅ Trouvé credentials: 'include' dans fetch admin"
else
  echo "   ⚠️  Aucun credentials: 'include' trouvé"
fi
echo ""

# 4. Test API endpoints (si serveur tourne)
echo "4️⃣ Test endpoints API (localhost:3000):"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  
  # Test GET /api/admin/annonces
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/annonces)
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ GET /api/admin/annonces → 200"
  else
    echo "   ❌ GET /api/admin/annonces → $STATUS"
  fi
  
  # Test GET /admin
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin)
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ GET /admin → 200"
  else
    echo "   ❌ GET /admin → $STATUS"
  fi
  
  # Test GET /admin/annonces
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/annonces)
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ GET /admin/annonces → 200"
  else
    echo "   ❌ GET /admin/annonces → $STATUS"
  fi
  
else
  echo "   ⚠️  Serveur non démarré (npm run dev)"
fi
echo ""

# 5. Vérifier structure fichiers
echo "5️⃣ Structure fichiers admin:"
FILES=(
  "src/app/admin/(protected)/layout.js"
  "src/app/admin/(protected)/page.js"
  "src/app/admin/(protected)/annonces/page.js"
  "src/app/api/admin/annonces/route.js"
  "src/lib/auth/apiAuth.js"
  "src/lib/supabase/server.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file - MANQUANT"
  fi
done
echo ""

# 6. Check migrations SQL
echo "6️⃣ Migrations SQL:"
if [ -f "supabase/migrations/0009_auto_create_profiles.sql" ]; then
  echo "   ✅ Migration auto-création profils présente"
  echo "   ⚠️  À APPLIQUER sur Supabase Dashboard"
else
  echo "   ❌ Migration 0009 manquante"
fi
echo ""

# Résumé final
echo "=============================================="
echo "📊 RÉSUMÉ:"
echo ""
if [ "$BYPASS" = "true" ]; then
  echo "✅ Mode DEV_ADMIN_BYPASS actif - Admin accessible sans auth"
  echo "   → Tester: http://localhost:3000/admin/annonces"
else
  echo "⚠️  Mode DEV_ADMIN_BYPASS désactivé - Auth requise"
  echo "   → Activer avec: echo 'NEXT_PUBLIC_DEV_ADMIN_BYPASS=true' >> .env.local"
fi
echo ""
echo "📝 Actions restantes:"
echo "   1. Appliquer migration SQL sur Supabase"
echo "   2. Créer compte admin (lolita@jurabreak.fr)"
echo "   3. Tester CRUD complet (créer/modifier/supprimer annonce)"
echo "   4. Tester upload photos depuis mobile"
echo "   5. Push sur GitHub → Deploy Vercel"
echo ""
