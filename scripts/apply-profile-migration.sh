#!/bin/bash

# Script pour appliquer la migration des profiles sur Supabase
# Usage: ./apply-profile-migration.sh

echo "🔧 Application de la migration 0009_auto_create_profiles.sql sur Supabase..."
echo ""

# Vérifier que le fichier existe
if [ ! -f "supabase/migrations/0009_auto_create_profiles.sql" ]; then
  echo "❌ Erreur: fichier de migration introuvable"
  exit 1
fi

echo "📋 Contenu de la migration:"
echo "====================================="
cat supabase/migrations/0009_auto_create_profiles.sql
echo ""
echo "====================================="
echo ""

echo "⚠️  ATTENTION:"
echo "Cette migration va:"
echo "  1. Créer une fonction handle_new_user()"
echo "  2. Créer un trigger pour auto-créer les profiles"
echo "  3. Créer les profils pour les utilisateurs existants (lolita@jurabreak.fr, contact@jurabreak.fr)"
echo ""

read -p "Voulez-vous continuer? (o/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
  echo "❌ Annulé"
  exit 1
fi

echo ""
echo "📝 Pour appliquer cette migration:"
echo ""
echo "Option 1: Via Supabase Dashboard (RECOMMANDÉ)"
echo "  1. Aller sur https://supabase.com/dashboard/project/<votre-projet>/sql"
echo "  2. Cliquer sur 'New Query'"
echo "  3. Copier-coller le contenu de supabase/migrations/0009_auto_create_profiles.sql"
echo "  4. Cliquer sur 'Run'"
echo ""
echo "Option 2: Via Supabase CLI"
echo "  $ supabase db push"
echo ""
echo "Option 3: Via psql (si vous avez les credentials)"
echo "  $ psql \$DATABASE_URL < supabase/migrations/0009_auto_create_profiles.sql"
echo ""

echo "✅ Script terminé. La migration doit être appliquée manuellement sur Supabase."
