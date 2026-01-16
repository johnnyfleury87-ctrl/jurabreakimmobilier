#!/bin/bash
#
# Script de vérification pré-déploiement
# Vérifie que tout est OK avant de déployer en production
#

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Vérification pré-déploiement AUTH FIX${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

ERRORS=0
WARNINGS=0

# 1. Vérifier que les fichiers critiques existent
echo -e "${YELLOW}1. Vérification des fichiers critiques...${NC}"

FILES=(
  "src/lib/supabase/server.js"
  "src/lib/auth/apiAuth.js"
  "src/app/auth/callback/route.js"
  "src/middleware.js"
  "vercel.json"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓${NC} $file"
  else
    echo -e "  ${RED}✗${NC} $file ${RED}MANQUANT${NC}"
    ((ERRORS++))
  fi
done
echo ""

# 2. Vérifier la configuration des cookies
echo -e "${YELLOW}2. Vérification configuration cookies...${NC}"
if grep -q "secure: isProduction" src/lib/supabase/server.js; then
  echo -e "  ${GREEN}✓${NC} secure: isProduction configuré"
else
  echo -e "  ${RED}✗${NC} Configuration secure manquante"
  ((ERRORS++))
fi

if grep -q "sameSite: 'lax'" src/lib/supabase/server.js; then
  echo -e "  ${GREEN}✓${NC} sameSite: 'lax' configuré"
else
  echo -e "  ${RED}✗${NC} Configuration sameSite manquante"
  ((ERRORS++))
fi
echo ""

# 3. Vérifier la sécurité (pas de bypass en prod)
echo -e "${YELLOW}3. Vérification sécurité...${NC}"
if grep -q "ALERTE SÉCURITÉ.*DEV_ADMIN_BYPASS" src/lib/auth/apiAuth.js; then
  echo -e "  ${GREEN}✓${NC} Protection bypass dev en prod activée"
else
  echo -e "  ${RED}✗${NC} Protection bypass dev manquante"
  ((ERRORS++))
fi
echo ""

# 4. Vérifier les variables d'environnement locales
echo -e "${YELLOW}4. Vérification variables d'environnement (.env.local)...${NC}"
if [ -f ".env.local" ]; then
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "  ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL présente"
  else
    echo -e "  ${RED}✗${NC} NEXT_PUBLIC_SUPABASE_URL manquante"
    ((ERRORS++))
  fi
  
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo -e "  ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY présente"
  else
    echo -e "  ${RED}✗${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY manquante"
    ((ERRORS++))
  fi
  
  if grep -q "NEXT_PUBLIC_DEV_ADMIN_BYPASS=true" .env.local; then
    echo -e "  ${YELLOW}⚠${NC} DEV_ADMIN_BYPASS=true (OK en local, ${RED}INTERDIT EN PROD${NC})"
    ((WARNINGS++))
  fi
else
  echo -e "  ${YELLOW}⚠${NC} .env.local non trouvé"
  ((WARNINGS++))
fi
echo ""

# 5. Vérifier la configuration Vercel
echo -e "${YELLOW}5. Vérification vercel.json...${NC}"
if grep -q "Access-Control-Allow-Credentials" vercel.json; then
  echo -e "  ${GREEN}✓${NC} Headers CORS configurés"
else
  echo -e "  ${RED}✗${NC} Headers CORS manquants"
  ((ERRORS++))
fi
echo ""

# 6. Vérifier le middleware
echo -e "${YELLOW}6. Vérification middleware...${NC}"
if [ -f "src/middleware.js" ]; then
  if grep -q "isAdminRoute" src/middleware.js; then
    echo -e "  ${GREEN}✓${NC} Protection routes admin active"
  else
    echo -e "  ${RED}✗${NC} Protection routes admin manquante"
    ((ERRORS++))
  fi
else
  echo -e "  ${RED}✗${NC} Middleware manquant"
  ((ERRORS++))
fi
echo ""

# 7. Vérifier les dépendances
echo -e "${YELLOW}7. Vérification dépendances...${NC}"
if [ -f "package.json" ]; then
  if grep -q "@supabase/ssr" package.json; then
    echo -e "  ${GREEN}✓${NC} @supabase/ssr présent"
  else
    echo -e "  ${RED}✗${NC} @supabase/ssr manquant"
    ((ERRORS++))
  fi
else
  echo -e "  ${RED}✗${NC} package.json manquant"
  ((ERRORS++))
fi
echo ""

# 8. Vérifier les scripts de test
echo -e "${YELLOW}8. Vérification scripts de test...${NC}"
if [ -f "scripts/test-auth-prod.sh" ] && [ -x "scripts/test-auth-prod.sh" ]; then
  echo -e "  ${GREEN}✓${NC} Script de test présent et exécutable"
else
  echo -e "  ${YELLOW}⚠${NC} Script de test manquant ou non exécutable"
  ((WARNINGS++))
fi
echo ""

# 9. Résumé
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}RÉSUMÉ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Aucune erreur bloquante${NC}"
else
  echo -e "${RED}❌ $ERRORS erreur(s) bloquante(s)${NC}"
fi

if [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ Aucun avertissement${NC}"
else
  echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
fi

echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✅ PRÊT POUR DÉPLOIEMENT${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "${BLUE}Prochaines étapes:${NC}"
  echo -e "  1. ${YELLOW}git add .${NC}"
  echo -e "  2. ${YELLOW}git commit -m \"fix(auth): Correction 401 admin en production\"${NC}"
  echo -e "  3. ${YELLOW}git push origin main${NC}"
  echo -e "  4. Attendre le build Vercel (~2 min)"
  echo -e "  5. ${YELLOW}./scripts/test-auth-prod.sh${NC}"
  echo ""
  echo -e "${RED}⚠️  IMPORTANT: Vérifier les variables sur Vercel:${NC}"
  echo -e "     → ${YELLOW}vercel env ls${NC}"
  echo -e "     → S'assurer que DEV_ADMIN_BYPASS est ${RED}ABSENTE${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}❌ ERREURS À CORRIGER${NC}"
  echo -e "${RED}========================================${NC}"
  echo ""
  echo -e "Veuillez corriger les erreurs ci-dessus avant de déployer."
  echo ""
  exit 1
fi
