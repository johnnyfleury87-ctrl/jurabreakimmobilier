/**
 * Bibliothèque de calcul automatique des honoraires
 * Selon les règles définies dans la page Honoraires
 */

/**
 * Calcule les honoraires pour une transaction de VENTE
 * @param {string} typeBien - Type de bien (maison, appartement, immeuble, etc.)
 * @param {number} prix - Prix de vente
 * @returns {number} - Montant des honoraires TTC
 */
export function calculerHonorairesVente(typeBien, prix) {
  if (!prix || prix <= 0) return 0

  // Règles spécifiques par type de bien et tranche de prix
  
  // IMMEUBLES
  if (typeBien === 'immeuble') {
    if (prix > 500000) {
      return 15000 // TTC
    }
    if (prix > 100000) {
      return 9000 // TTC
    }
  }
  
  // MAISONS
  if (typeBien === 'maison') {
    if (prix > 100000) {
      return 7000 // TTC
    }
  }
  
  // APPARTEMENTS
  if (typeBien === 'appartement') {
    if (prix > 100000) {
      return 6000 // TTC
    }
  }
  
  // RÈGLES GÉNÉRALES PAR TRANCHE (tous types de biens)
  if (prix >= 50000 && prix <= 100000) {
    return 5000 // TTC
  }
  
  if (prix >= 30000 && prix < 50000) {
    return 3500 // TTC
  }
  
  if (prix < 30000) {
    return 2500 // TTC
  }
  
  // Par défaut (ne devrait pas arriver)
  return 5000
}

/**
 * Calcule les honoraires pour une LOCATION
 * @param {number} loyerHC - Loyer hors charges mensuel
 * @param {number} surfaceM2 - Surface en m² (pour état des lieux)
 * @returns {object} - { honorairesLocation, honorairesEtatLieux, total }
 */
export function calculerHonorairesLocation(loyerHC, surfaceM2 = 0) {
  if (!loyerHC || loyerHC <= 0) {
    return {
      honorairesLocation: 0,
      honorairesEtatLieux: 0,
      total: 0
    }
  }

  let honorairesLocation = 0
  
  // Règles location par tranche de loyer
  if (loyerHC >= 1 && loyerHC < 400) {
    honorairesLocation = loyerHC * 0.80 // 80% du loyer
  } else if (loyerHC >= 400 && loyerHC < 800) {
    honorairesLocation = loyerHC * 0.75 // 75% du loyer
  } else if (loyerHC >= 800 && loyerHC < 1500) {
    honorairesLocation = loyerHC * 0.60 // 60% du loyer
  } else if (loyerHC >= 1500) {
    // Pour les loyers très élevés, on peut appliquer une règle spécifique
    // Ici on garde 60% mais vous pouvez ajuster
    honorairesLocation = loyerHC * 0.60
  }
  
  // État des lieux : 3€ / m²
  const honorairesEtatLieux = surfaceM2 > 0 ? surfaceM2 * 3 : 0
  
  return {
    honorairesLocation: Math.round(honorairesLocation * 100) / 100,
    honorairesEtatLieux: Math.round(honorairesEtatLieux * 100) / 100,
    total: Math.round((honorairesLocation + honorairesEtatLieux) * 100) / 100
  }
}

/**
 * Calcule tous les honoraires selon le type de transaction
 * @param {object} params - Paramètres de l'annonce
 * @param {string} params.typeTransaction - 'VENTE' ou 'LOCATION'
 * @param {string} params.typeBien - Type de bien
 * @param {number} params.prix - Prix (pour vente)
 * @param {number} params.loyerHC - Loyer hors charges (pour location)
 * @param {number} params.surfaceM2 - Surface en m²
 * @returns {object} - Honoraires calculés avec détails
 */
export function calculerHonoraires({ 
  typeTransaction, 
  typeBien, 
  prix, 
  loyerHC, 
  surfaceM2 
}) {
  if (typeTransaction === 'LOCATION') {
    const resultLocation = calculerHonorairesLocation(loyerHC, surfaceM2)
    return {
      type: 'LOCATION',
      honorairesLocation: resultLocation.honorairesLocation,
      honorairesEtatLieux: resultLocation.honorairesEtatLieux,
      total: resultLocation.total,
      detail: `Location: ${resultLocation.honorairesLocation.toFixed(2)}€ + État des lieux: ${resultLocation.honorairesEtatLieux.toFixed(2)}€`
    }
  }
  
  // VENTE par défaut
  const honorairesVente = calculerHonorairesVente(typeBien, prix)
  return {
    type: 'VENTE',
    honorairesTransaction: honorairesVente,
    total: honorairesVente,
    detail: `Honoraires de transaction: ${honorairesVente.toFixed(2)}€ TTC`
  }
}

/**
 * Formatte les honoraires pour affichage
 * @param {object} honoraires - Résultat de calculerHonoraires
 * @returns {string} - Texte formaté
 */
export function formatterHonoraires(honoraires) {
  if (!honoraires || honoraires.total === 0) {
    return 'Honoraires à déterminer'
  }
  
  if (honoraires.type === 'LOCATION') {
    return `${honoraires.honorairesLocation.toLocaleString('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    })} + État des lieux: ${honoraires.honorairesEtatLieux.toLocaleString('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    })}`
  }
  
  return honoraires.total.toLocaleString('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  })
}
