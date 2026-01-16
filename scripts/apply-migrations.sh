#!/bin/bash

# Script d'application des migrations Supabase
# Usage: bash scripts/apply-migrations.sh

echo "🔧 Application des migrations Supabase..."
echo ""

# Vérifier que les variables d'environnement sont définies
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "⚠️  SUPABASE_DB_URL n'est pas défini."
  echo "Veuillez ajouter cette variable dans votre .env.local:"
  echo "SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"
  exit 1
fi

echo "📋 Migrations disponibles:"
ls -1 supabase/migrations/

echo ""
echo "🚀 Application des migrations..."
echo ""

# Appliquer chaque migration dans l'ordre
for migration in supabase/migrations/*.sql; do
  filename=$(basename "$migration")
  echo "⏳ Application de $filename..."
  
  # Utiliser psql pour appliquer la migration
  psql "$SUPABASE_DB_URL" -f "$migration" -v ON_ERROR_STOP=1
  
  if [ $? -eq 0 ]; then
    echo "✅ $filename appliqué avec succès"
  else
    echo "❌ Erreur lors de l'application de $filename"
    exit 1
  fi
  
  echo ""
done

echo "✨ Toutes les migrations ont été appliquées avec succès!"
echo ""
echo "🔍 Prochaines étapes:"
echo "1. Vérifier les tables dans Supabase Dashboard"
echo "2. Configurer le bucket Storage 'annonces'"
echo "3. Ajouter un utilisateur admin dans la table profiles"
echo ""
