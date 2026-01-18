#!/bin/bash

# Script pour appliquer la migration mode_affichage

echo "📦 Application de la migration 0010_add_mode_affichage..."
echo ""

# Charger les variables d'environnement
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Appliquer la migration via psql si disponible, sinon instructions manuelles
if command -v psql &> /dev/null; then
  echo "✓ psql détecté, application directe de la migration..."
  PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
    -h "$SUPABASE_HOST" \
    -U postgres \
    -d postgres \
    -f supabase/migrations/0010_add_mode_affichage.sql
  
  if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès!"
  else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
  fi
else
  echo "⚠️  psql non disponible"
  echo ""
  echo "📋 Pour appliquer la migration manuellement:"
  echo "1. Se connecter au dashboard Supabase: https://supabase.com/dashboard"
  echo "2. Aller dans SQL Editor"
  echo "3. Copier-coller le contenu de: supabase/migrations/0010_add_mode_affichage.sql"
  echo "4. Exécuter"
  echo ""
  echo "Ou depuis votre terminal local avec psql:"
  echo "  psql -h <SUPABASE_HOST> -U postgres -d postgres -f supabase/migrations/0010_add_mode_affichage.sql"
fi

echo ""
echo "📝 N'oubliez pas de:"
echo "   - Vérifier que le champ mode_affichage existe dans la table annonces"
echo "   - Redémarrer l'application si nécessaire"
echo "   - Tester la création/édition d'annonces dans l'admin"
