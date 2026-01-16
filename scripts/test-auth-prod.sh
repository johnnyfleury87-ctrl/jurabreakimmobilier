#!/bin/bash
#
# Script de test de l'authentification admin en production
# Usage: ./scripts/test-auth-prod.sh [URL]
#

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URL de base (production par défaut, ou passée en paramètre)
BASE_URL="${1:-https://jurabreakimmobilier.vercel.app}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test d'authentification admin en PROD${NC}"
echo -e "${BLUE}URL: $BASE_URL${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Test de la page de login
echo -e "${YELLOW}1. Test de la page de login...${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/login")
if [ "$STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ Page de login accessible (200)${NC}"
else
  echo -e "${RED}✗ Page de login inaccessible (Status: $STATUS)${NC}"
  exit 1
fi
echo ""

# 2. Test de l'API admin sans auth (doit retourner 401)
echo -e "${YELLOW}2. Test API admin sans auth (doit retourner 401)...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/admin/annonces")
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)

if [ "$STATUS" -eq 401 ]; then
  echo -e "${GREEN}✓ API protégée correctement (401)${NC}"
  echo -e "  Réponse: $BODY"
else
  echo -e "${RED}✗ API devrait retourner 401, reçu: $STATUS${NC}"
  echo -e "  Réponse: $BODY"
fi
echo ""

# 3. Vérifier la présence des variables d'environnement
echo -e "${YELLOW}3. Variables d'environnement à vérifier sur Vercel:${NC}"
echo -e "  ${BLUE}NEXT_PUBLIC_SUPABASE_URL${NC} - URL du projet Supabase"
echo -e "  ${BLUE}NEXT_PUBLIC_SUPABASE_ANON_KEY${NC} - Clé anonyme Supabase"
echo -e "  ${BLUE}SUPABASE_SERVICE_ROLE_KEY${NC} - Clé service role (optionnel)"
echo -e "  ${BLUE}NEXT_PUBLIC_DEV_ADMIN_BYPASS${NC} - ${RED}DOIT ÊTRE ABSENTE EN PROD${NC}"
echo ""

# 4. Test de la route callback auth
echo -e "${YELLOW}4. Test de la route callback auth...${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/auth/callback")
if [ "$STATUS" -eq 307 ] || [ "$STATUS" -eq 302 ]; then
  echo -e "${GREEN}✓ Route callback auth opérationnelle (redirect)${NC}"
else
  echo -e "${YELLOW}⚠ Route callback status: $STATUS (attendu 302/307)${NC}"
fi
echo ""

# 5. Instructions pour le test manuel
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST MANUEL À EFFECTUER:${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}1. Connexion admin:${NC}"
echo -e "   → Ouvrir: $BASE_URL/admin/login"
echo -e "   → Se connecter avec: lolita@jurabreak.fr"
echo -e "   → Vérifier la redirection vers /admin"
echo ""
echo -e "${YELLOW}2. Test des cookies:${NC}"
echo -e "   → Ouvrir DevTools (F12)"
echo -e "   → Onglet Application > Cookies"
echo -e "   → Vérifier la présence des cookies Supabase:"
echo -e "     • sb-*-auth-token"
echo -e "     • sb-*-auth-token-code-verifier"
echo -e "   → Attributs: Secure=true, SameSite=Lax"
echo ""
echo -e "${YELLOW}3. Test CRUD annonces:${NC}"
echo -e "   → Aller sur: $BASE_URL/admin/annonces"
echo -e "   → Vérifier que la liste s'affiche"
echo -e "   → Créer une annonce test"
echo -e "   → Modifier cette annonce"
echo -e "   → Supprimer cette annonce"
echo ""
echo -e "${YELLOW}4. Vérifier les logs Vercel:${NC}"
echo -e "   → vercel logs --follow"
echo -e "   → Rechercher les messages:"
echo -e "     • '🔍 [PROD] Vérification auth API'"
echo -e "     • '✅ User détecté'"
echo -e "     • '✅ ADMIN_OK'"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Tests automatiques terminés !${NC}"
echo -e "${GREEN}========================================${NC}"
