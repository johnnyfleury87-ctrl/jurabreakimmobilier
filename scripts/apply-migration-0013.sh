#!/bin/bash

# Script d'application de la migration 0013 - Paramètres admin estimation
# Usage: ./scripts/apply-migration-0013.sh

set -e

echo "======================================================================"
echo "MIGRATION 0013 : Paramètres Admin Estimation"
echo "======================================================================"
echo ""
echo "Cette migration ajoute :"
echo "  - Paramètres globaux (service_actif, generation_pdf_active, envoi_email_auto_actif)"
echo "  - Configuration des formules (pdf_autorise, email_autorise par formule)"
echo "  - Champs premium (nb_pieces, nb_chambres, environnement, travaux)"
echo ""
echo "======================================================================"
echo ""

# Vérifier que les variables d'environnement sont définies
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Erreur : SUPABASE_DB_URL non définie"
  echo ""
  echo "Définissez la variable d'environnement :"
  echo "  export SUPABASE_DB_URL='postgresql://user:password@host:port/database'"
  exit 1
fi

echo "📡 Connexion à la base de données..."
echo ""

# Appliquer la migration
psql "$SUPABASE_DB_URL" -f supabase/migrations/0013_estimation_parametres_admin.sql

echo ""
echo "======================================================================"
echo "✅ Migration 0013 appliquée avec succès !"
echo "======================================================================"
echo ""
echo "📋 Vérification des paramètres par défaut :"
echo ""

# Afficher les paramètres globaux
psql "$SUPABASE_DB_URL" -c "SELECT cle, valeur, description FROM estimation_parametres_globaux ORDER BY cle;"

echo ""
echo "📋 Configuration des formules :"
echo ""

# Afficher la config des formules
psql "$SUPABASE_DB_URL" -c "SELECT formule, nom_affichage, prix, pdf_autorise, email_autorise, champs_premium_requis, actif FROM estimation_config_formules ORDER BY ordre;"

echo ""
echo "======================================================================"
echo "⚠️  IMPORTANT : Configuration recommandée pour les tests"
echo "======================================================================"
echo ""
echo "Phase de test (éviter spam email) :"
echo "  - generation_pdf_active = true"
echo "  - envoi_email_auto_actif = FALSE ← Désactivé pour les tests"
echo ""
echo "Une fois validé en production :"
echo "  - envoi_email_auto_actif = true"
echo ""
echo "Pour modifier les paramètres, utilisez l'interface admin :"
echo "  https://votre-domaine.com/admin/estimation → Onglet 'Paramètres Globaux'"
echo ""
echo "======================================================================"
