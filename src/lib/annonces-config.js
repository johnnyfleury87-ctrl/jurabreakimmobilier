/**
 * Configuration centralisée Transaction/Statut
 * 
 * Définit la correspondance stricte entre type_transaction et statuts autorisés
 * Garantit la cohérence métier dans toute l'application
 */

// ============================================
// TYPES DE TRANSACTION
// ============================================

export const TYPE_TRANSACTION = {
  VENTE: 'VENTE',
  LOCATION: 'LOCATION'
}

export const TYPE_TRANSACTION_LABELS = {
  [TYPE_TRANSACTION.VENTE]: 'Vente',
  [TYPE_TRANSACTION.LOCATION]: 'Location'
}

// ============================================
// STATUTS DISPONIBLES
// ============================================

export const STATUT = {
  // Statuts VENTE
  A_VENDRE: 'A_VENDRE',
  SOUS_COMPROMIS: 'SOUS_COMPROMIS',
  VENDU: 'VENDU',
  
  // Statuts LOCATION
  EN_LOCATION: 'EN_LOCATION',
  LOUE: 'LOUE',
  
  // Statut commun
  RETIRE: 'RETIRE'
}

// ============================================
// MAPPING TYPE_TRANSACTION → STATUTS AUTORISÉS
// ============================================

export const STATUTS_PAR_TRANSACTION = {
  [TYPE_TRANSACTION.VENTE]: [
    STATUT.A_VENDRE,
    STATUT.SOUS_COMPROMIS,
    STATUT.VENDU,
    STATUT.RETIRE
  ],
  [TYPE_TRANSACTION.LOCATION]: [
    STATUT.EN_LOCATION,
    STATUT.LOUE,
    STATUT.RETIRE
  ]
}

// ============================================
// LABELS D'AFFICHAGE PUBLIC
// ============================================

export const STATUT_LABELS = {
  [STATUT.A_VENDRE]: 'À vendre',
  [STATUT.SOUS_COMPROMIS]: 'Sous compromis',
  [STATUT.VENDU]: 'Vendu',
  [STATUT.EN_LOCATION]: 'Disponible',
  [STATUT.LOUE]: 'Loué',
  [STATUT.RETIRE]: 'Retiré'
}

// ============================================
// CLASSES CSS POUR BADGES
// ============================================

export const STATUT_CSS_CLASSES = {
  [STATUT.A_VENDRE]: 'disponible',
  [STATUT.SOUS_COMPROMIS]: 'compromis',
  [STATUT.VENDU]: 'indisponible',
  [STATUT.EN_LOCATION]: 'disponible',
  [STATUT.LOUE]: 'indisponible',
  [STATUT.RETIRE]: 'retire'
}

// ============================================
// VISIBILITÉ PUBLIQUE
// ============================================

/**
 * Détermine si une annonce doit être visible publiquement
 * en fonction de son statut
 */
export const STATUT_VISIBLE_PUBLIC = {
  [STATUT.A_VENDRE]: true,
  [STATUT.SOUS_COMPROMIS]: true,
  [STATUT.VENDU]: false,
  [STATUT.EN_LOCATION]: true,
  [STATUT.LOUE]: false,
  [STATUT.RETIRE]: false
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Obtient la liste des statuts autorisés pour un type de transaction
 * @param {string} typeTransaction - 'VENTE' ou 'LOCATION'
 * @returns {Array} Liste des statuts autorisés
 */
export function getStatutsAutorises(typeTransaction) {
  return STATUTS_PAR_TRANSACTION[typeTransaction] || []
}

/**
 * Vérifie la cohérence entre type_transaction et statut
 * @param {string} typeTransaction - 'VENTE' ou 'LOCATION'
 * @param {string} statut - Le statut à vérifier
 * @returns {boolean} True si cohérent
 */
export function isStatutCoherent(typeTransaction, statut) {
  const statutsAutorises = getStatutsAutorises(typeTransaction)
  return statutsAutorises.includes(statut)
}

/**
 * Obtient le label d'affichage public pour un statut
 * @param {string} statut - Le statut
 * @returns {string} Label formaté
 */
export function getStatutLabel(statut) {
  return STATUT_LABELS[statut] || statut.replace('_', ' ')
}

/**
 * Obtient la classe CSS pour un badge de statut
 * @param {string} statut - Le statut
 * @returns {string} Nom de classe CSS
 */
export function getStatutCssClass(statut) {
  return STATUT_CSS_CLASSES[statut] || 'default'
}

/**
 * Détermine si une annonce doit être visible publiquement
 * @param {Object} annonce - L'annonce avec statut et visible
 * @returns {boolean} True si l'annonce doit être visible
 */
export function isAnnonceVisiblePublic(annonce) {
  if (!annonce || !annonce.visible) return false
  return STATUT_VISIBLE_PUBLIC[annonce.statut] !== false
}

/**
 * Obtient le statut par défaut pour un type de transaction
 * @param {string} typeTransaction - 'VENTE' ou 'LOCATION'
 * @returns {string} Statut par défaut
 */
export function getStatutParDefaut(typeTransaction) {
  if (typeTransaction === TYPE_TRANSACTION.VENTE) {
    return STATUT.A_VENDRE
  }
  if (typeTransaction === TYPE_TRANSACTION.LOCATION) {
    return STATUT.EN_LOCATION
  }
  return STATUT.A_VENDRE
}

/**
 * Corrige automatiquement un statut incohérent
 * @param {string} typeTransaction - 'VENTE' ou 'LOCATION'
 * @param {string} statut - Le statut actuel
 * @returns {string} Statut corrigé
 */
export function corrigerStatut(typeTransaction, statut) {
  if (isStatutCoherent(typeTransaction, statut)) {
    return statut
  }
  return getStatutParDefaut(typeTransaction)
}
