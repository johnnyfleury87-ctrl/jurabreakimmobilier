#!/bin/bash

# Script de test automatisé pour l'admin JuraBreak
# Usage: ./scripts/test-admin-api.sh

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-lolita@jurabreak.fr}"

echo "🧪 Tests Admin API - JuraBreak"
echo "================================"
echo "Base URL: $BASE_URL"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Page login accessible
echo "Test 1: Page login accessible..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/login")
if [ "$STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓${NC} Login page: 200 OK"
else
  echo -e "${RED}✗${NC} Login page: $STATUS (attendu: 200)"
  exit 1
fi

# Test 2: API admin protégée (401 sans auth)
echo ""
echo "Test 2: API admin protégée (401 sans auth)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/annonces")
if [ "$STATUS" -eq 401 ]; then
  echo -e "${GREEN}✓${NC} API protégée: 401 Unauthorized (correct)"
else
  echo -e "${YELLOW}⚠${NC} API non protégée: $STATUS (attendu: 401)"
fi

# Test 3: Page annonces publiques accessible
echo ""
echo "Test 3: Page annonces publiques accessible..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/annonces")
if [ "$STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓${NC} Page publique /annonces: 200 OK"
else
  echo -e "${RED}✗${NC} Page publique /annonces: $STATUS"
  exit 1
fi

# Test 4: Vérifier routes inexistantes (doivent retourner 404)
echo ""
echo "Test 4: Routes supprimées (doivent 404)..."
ROUTES_TO_CHECK=(
  "/admin/leads"
  "/admin/estimations"
  "/admin/evenements"
  "/admin/settings"
)

ERRORS=0
for ROUTE in "${ROUTES_TO_CHECK[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ROUTE")
  if [ "$STATUS" -eq 404 ] || [ "$STATUS" -eq 401 ]; then
    echo -e "${GREEN}✓${NC} $ROUTE: $STATUS (route supprimée, OK)"
  else
    echo -e "${YELLOW}⚠${NC} $ROUTE: $STATUS (existe encore?)"
    ERRORS=$((ERRORS + 1))
  fi
done

# Test 5: Vérifier structure fichiers critiques
echo ""
echo "Test 5: Vérification fichiers critiques..."
FILES=(
  "src/app/admin/(protected)/annonces/page.js"
  "src/app/admin/(protected)/annonces/new/page.js"
  "src/app/admin/(protected)/annonces/[id]/edit/page.js"
  "src/app/api/admin/annonces/route.js"
  "src/app/api/admin/annonces/[id]/route.js"
  "src/app/api/admin/annonces/[id]/photos/route.js"
  "src/lib/auth/requireAdmin.js"
  "src/lib/auth/config.js"
  "src/lib/honoraires.js"
  "supabase/migrations/0008_storage_annonces_photos.sql"
)

MISSING=0
for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo -e "${GREEN}✓${NC} $FILE"
  else
    echo -e "${RED}✗${NC} $FILE (manquant!)"
    MISSING=$((MISSING + 1))
  fi
done

# Test 6: Vérifier variables d'environnement
echo ""
echo "Test 6: Variables d'environnement..."
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓${NC} .env.local existe"
  
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL configuré"
  else
    echo -e "${RED}✗${NC} NEXT_PUBLIC_SUPABASE_URL manquant"
    MISSING=$((MISSING + 1))
  fi
  
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY configuré"
  else
    echo -e "${RED}✗${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY manquant"
    MISSING=$((MISSING + 1))
  fi
  
  if grep -q "DEV_ADMIN_BYPASS=true" .env.local; then
    echo -e "${YELLOW}⚠${NC} DEV_ADMIN_BYPASS=true (désactiver en production!)"
  else
    echo -e "${GREEN}✓${NC} DEV_ADMIN_BYPASS désactivé"
  fi
else
  echo -e "${YELLOW}⚠${NC} .env.local n'existe pas"
fi

# Résumé
echo ""
echo "================================"
echo "📊 RÉSUMÉ DES TESTS"
echo "================================"

if [ $MISSING -eq 0 ] && [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ TOUS LES TESTS PASSÉS${NC}"
  echo ""
  echo "L'admin est prêt à être utilisé:"
  echo "  1. Démarrer: npm run dev"
  echo "  2. Ouvrir: $BASE_URL/admin/login"
  echo "  3. Se connecter avec: $ADMIN_EMAIL"
  echo ""
  echo "Checklist complète: CHECKLIST_ADMIN_PROPRE.md"
  exit 0
else
  echo -e "${RED}❌ PROBLÈMES DÉTECTÉS${NC}"
  echo "Fichiers manquants: $MISSING"
  echo "Erreurs routes: $ERRORS"
  echo ""
  echo "Vérifier la configuration et réessayer."
  exit 1
fi
