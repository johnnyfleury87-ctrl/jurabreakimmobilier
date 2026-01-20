/**
 * Module de calcul des estimations immobilières
 * Strictement conforme à docs/estimation.md
 * 
 * RÈGLES :
 * - Calcul côté serveur uniquement
 * - Fourchette obligatoire (jamais de valeur unique)
 * - Traçabilité complète des inputs et version
 */

/**
 * Calculer l'estimation d'un bien immobilier
 * 
 * @param {Object} inputs - Données du bien et paramètres
 * @param {Object} regles - Paramètres de calcul (communes, coefficients, options, marges)
 * @returns {Object} Résultat avec valeurs et détails du calcul
 */
export function calculerEstimation(inputs, regles) {
  // Validation des inputs
  if (!inputs.surface_habitable || inputs.surface_habitable <= 0) {
    throw new Error('Surface habitable requise')
  }
  
  // 1) PRIX AU M² DE RÉFÉRENCE (priorité: commune > zone > défaut)
  let prixM2Reference = regles.prix_m2_defaut || 2000
  
  if (inputs.commune_id && regles.communes) {
    const commune = regles.communes.find(c => c.id === inputs.commune_id)
    if (commune && commune.prix_m2_reference) {
      prixM2Reference = commune.prix_m2_reference
    } else if (commune && commune.zone_id && regles.zones) {
      const zone = regles.zones.find(z => z.id === commune.zone_id)
      if (zone && zone.prix_m2_reference) {
        prixM2Reference = zone.prix_m2_reference
      }
    }
  }
  
  // 2) VALEUR BRUTE
  const valeurBrute = inputs.surface_habitable * prixM2Reference
  
  // 3) APPLICATION DES COEFFICIENTS
  let coefficientTotal = 1.0
  const coefficientsAppliques = []
  
  // Coefficient état du bien
  if (inputs.etat_bien && regles.coefficients) {
    const coefEtat = regles.coefficients.find(
      c => c.categorie === 'etat_bien' && c.code === inputs.etat_bien && c.actif
    )
    if (coefEtat) {
      coefficientTotal *= coefEtat.coefficient
      coefficientsAppliques.push({
        type: 'etat_bien',
        code: coefEtat.code,
        libelle: coefEtat.libelle,
        coefficient: coefEtat.coefficient
      })
    }
  }
  
  // Coefficient type de bien
  if (inputs.type_bien && regles.coefficients) {
    const coefType = regles.coefficients.find(
      c => c.categorie === 'type_bien' && c.code === inputs.type_bien && c.actif
    )
    if (coefType) {
      coefficientTotal *= coefType.coefficient
      coefficientsAppliques.push({
        type: 'type_bien',
        code: coefType.code,
        libelle: coefType.libelle,
        coefficient: coefType.coefficient
      })
    }
  }
  
  // Valeur après coefficients
  let valeurAjustee = valeurBrute * coefficientTotal
  
  // 4) AJUSTEMENT TERRAIN (par paliers, pas linéaire)
  let ajustementTerrain = 0
  if (inputs.surface_terrain && inputs.surface_terrain > 0) {
    const terrain = inputs.surface_terrain
    
    // Paliers d'ajustement (exemple : à adapter selon marché local)
    if (terrain <= 500) {
      ajustementTerrain = terrain * 50 // 50€/m² pour petit terrain
    } else if (terrain <= 1000) {
      ajustementTerrain = 500 * 50 + (terrain - 500) * 30 // Dégressif
    } else if (terrain <= 2000) {
      ajustementTerrain = 500 * 50 + 500 * 30 + (terrain - 1000) * 20
    } else {
      ajustementTerrain = 500 * 50 + 500 * 30 + 1000 * 20 + (terrain - 2000) * 10
    }
    
    valeurAjustee += ajustementTerrain
  }
  
  // 5) PLUS-VALUES / OPTIONS
  const optionsAppliquees = []
  let totalPlusValues = 0
  
  if (inputs.options_selectionnees && Array.isArray(inputs.options_selectionnees) && regles.options) {
    inputs.options_selectionnees.forEach(codeOption => {
      const option = regles.options.find(o => o.code === codeOption && o.actif)
      if (option) {
        let valeurOption = 0
        
        if (option.type_valeur === 'fixe') {
          valeurOption = option.valeur
        } else if (option.type_valeur === 'pourcentage') {
          valeurOption = valeurAjustee * (option.valeur / 100)
        }
        
        totalPlusValues += valeurOption
        
        optionsAppliquees.push({
          code: option.code,
          libelle: option.libelle,
          type: option.type_valeur,
          valeur_parametree: option.valeur,
          valeur_appliquee: valeurOption
        })
      }
    })
  }
  
  valeurAjustee += totalPlusValues
  
  // 6) VALEUR CENTRALE
  const valeurCentrale = Math.round(valeurAjustee)
  
  // 7) DÉTERMINATION DU NIVEAU DE FIABILITÉ
  // Dépend de la formule ET des données fournies
  let niveauFiabilite = 'minimal' // Par défaut
  let score = 0
  
  // Critères pour déterminer le niveau de fiabilité
  if (inputs.surface_habitable) score += 2
  if (inputs.type_bien) score += 2
  if (inputs.etat_bien) score += 2
  if (inputs.commune_id) score += 3
  if (inputs.surface_terrain) score += 1
  if (inputs.annee_construction) score += 1
  if (inputs.nb_pieces) score += 1
  if (inputs.nb_chambres) score += 1
  if (inputs.nb_salles_bain) score += 1
  if (inputs.exposition) score += 1
  if (inputs.chauffage) score += 1
  if (inputs.dpe_classe) score += 1
  if (inputs.options_selectionnees && inputs.options_selectionnees.length > 0) score += 1
  
  // Ajustement selon la formule
  const formule = inputs.formule || 'gratuite'
  
  if (formule === 'gratuite') {
    // Formule gratuite = données minimales = toujours niveau minimal
    niveauFiabilite = 'minimal'
  } else if (formule === 'standard') {
    // Standard = peut atteindre complet si données complètes
    if (score >= 12) {
      niveauFiabilite = 'complet'
    } else {
      niveauFiabilite = 'minimal'
    }
  } else if (formule === 'premium') {
    // Premium = peut atteindre tres_complet
    if (score >= 15) {
      niveauFiabilite = 'tres_complet'
    } else if (score >= 12) {
      niveauFiabilite = 'complet'
    } else {
      niveauFiabilite = 'minimal'
    }
  } else {
    // Calcul par score si formule non spécifiée (rétrocompatibilité)
    if (score >= 15) {
      niveauFiabilite = 'tres_complet'
    } else if (score >= 10) {
      niveauFiabilite = 'complet'
    }
  }
  
  // 8) GÉNÉRATION DE LA FOURCHETTE OBLIGATOIRE
  const marge = regles.marges?.find(m => m.niveau_fiabilite === niveauFiabilite)
  
  let margeBasse = 0.20 // Défaut ±20%
  let margeHaute = 0.20
  
  if (marge) {
    margeBasse = marge.marge_basse
    margeHaute = marge.marge_haute
  }
  
  const valeurBasse = Math.round(valeurCentrale * (1 - margeBasse))
  const valeurHaute = Math.round(valeurCentrale * (1 + margeHaute))
  const valeurMediane = valeurCentrale
  
  // 9) RÉSULTAT COMPLET
  return {
    // Valeurs finales (FOURCHETTE OBLIGATOIRE)
    valeur_basse: valeurBasse,
    valeur_mediane: valeurMediane,
    valeur_haute: valeurHaute,
    niveau_fiabilite: niveauFiabilite,
    
    // Détail du calcul (traçabilité)
    detail: {
      prix_m2_reference: prixM2Reference,
      surface_habitable: inputs.surface_habitable,
      valeur_brute: Math.round(valeurBrute),
      
      coefficient_total: coefficientTotal,
      coefficients_appliques: coefficientsAppliques,
      
      ajustement_terrain: Math.round(ajustementTerrain),
      surface_terrain: inputs.surface_terrain || 0,
      
      options_appliquees: optionsAppliquees,
      total_plus_values: Math.round(totalPlusValues),
      
      valeur_avant_fourchette: valeurCentrale,
      
      marge_basse_pct: margeBasse * 100,
      marge_haute_pct: margeHaute * 100,
      niveau_fiabilite: niveauFiabilite,
      score_fiabilite: score
    },
    
    // Métadonnées
    calculated_at: new Date().toISOString()
  }
}

/**
 * Récupérer les règles de calcul actives depuis la base de données
 * 
 * @param {Object} supabase - Client Supabase
 * @param {String} versionId - ID de version spécifique (optionnel)
 * @returns {Object} Règles de calcul
 */
export async function getReglesCalcul(supabase, versionId = null) {
  try {
    // Si version spécifique demandée
    if (versionId) {
      const { data: version, error } = await supabase
        .from('estimation_versions_regles')
        .select('snapshot')
        .eq('id', versionId)
        .single()
      
      if (error) throw error
      return version.snapshot
    }
    
    // Sinon, récupérer les paramètres actifs actuels
    const [zones, communes, coefficients, options, marges] = await Promise.all([
      supabase.from('estimation_zones').select('*').eq('actif', true),
      supabase.from('estimation_communes').select('*').eq('actif', true),
      supabase.from('estimation_coefficients').select('*').eq('actif', true),
      supabase.from('estimation_options').select('*').eq('actif', true),
      supabase.from('estimation_marges').select('*')
    ])
    
    return {
      zones: zones.data || [],
      communes: communes.data || [],
      coefficients: coefficients.data || [],
      options: options.data || [],
      marges: marges.data || [],
      prix_m2_defaut: 2000 // Valeur par défaut si aucune commune/zone
    }
  } catch (error) {
    console.error('Erreur récupération règles:', error)
    throw error
  }
}

/**
 * Créer un snapshot des règles actuelles (versioning)
 * 
 * @param {Object} supabase - Client Supabase
 * @param {String} description - Description de la version
 * @param {String} userId - ID utilisateur créant la version
 * @returns {Object} Version créée
 */
export async function creerVersionRegles(supabase, description, userId = null) {
  try {
    // Récupérer toutes les règles actuelles
    const regles = await getReglesCalcul(supabase)
    
    // Récupérer le dernier numéro de version
    const { data: lastVersion } = await supabase
      .from('estimation_versions_regles')
      .select('version_number')
      .order('version_number', { ascending: false })
      .limit(1)
      .single()
    
    const newVersionNumber = (lastVersion?.version_number || 0) + 1
    
    // Créer le snapshot
    const snapshot = {
      ...regles,
      created_at: new Date().toISOString(),
      description
    }
    
    // Insérer la nouvelle version
    const { data: version, error } = await supabase
      .from('estimation_versions_regles')
      .insert({
        version_number: newVersionNumber,
        description,
        snapshot,
        created_by: userId
      })
      .select()
      .single()
    
    if (error) throw error
    
    return version
  } catch (error) {
    console.error('Erreur création version:', error)
    throw error
  }
}
