/**
 * Helper pour vérifier les autorisations PDF et Email
 * Selon la config admin
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Vérifie si la génération PDF est autorisée pour une formule
 * @param {string} formule - 'gratuite', 'standard', 'premium'
 * @returns {Promise<boolean>}
 */
export async function isPdfAutoriseForFormule(formule) {
  try {
    const supabase = await createClient()
    
    // Vérifier paramètre global
    const { data: paramGlobal } = await supabase
      .from('estimation_parametres_globaux')
      .select('valeur')
      .eq('cle', 'generation_pdf_active')
      .single()
    
    if (!paramGlobal || !paramGlobal.valeur) {
      return false
    }
    
    // Vérifier config formule
    const { data: configFormule } = await supabase
      .from('estimation_config_formules')
      .select('pdf_autorise, actif')
      .eq('formule', formule)
      .single()
    
    if (!configFormule || !configFormule.actif) {
      return false
    }
    
    return configFormule.pdf_autorise
    
  } catch (error) {
    console.error('Erreur vérification PDF autorisé:', error)
    return false
  }
}

/**
 * Vérifie si l'envoi email est autorisé pour une formule
 * @param {string} formule - 'gratuite', 'standard', 'premium'
 * @returns {Promise<boolean>}
 */
export async function isEmailAutoriseForFormule(formule) {
  try {
    const supabase = await createClient()
    
    // Vérifier paramètre global
    const { data: paramGlobal } = await supabase
      .from('estimation_parametres_globaux')
      .select('valeur')
      .eq('cle', 'envoi_email_auto_actif')
      .single()
    
    if (!paramGlobal || !paramGlobal.valeur) {
      return false
    }
    
    // Vérifier config formule
    const { data: configFormule } = await supabase
      .from('estimation_config_formules')
      .select('email_autorise, actif')
      .eq('formule', formule)
      .single()
    
    if (!configFormule || !configFormule.actif) {
      return false
    }
    
    return configFormule.email_autorise
    
  } catch (error) {
    console.error('Erreur vérification Email autorisé:', error)
    return false
  }
}

/**
 * Vérifie si le service d'estimation est actif
 * @returns {Promise<boolean>}
 */
export async function isServiceEstimationActif() {
  try {
    const supabase = await createClient()
    
    const { data: param } = await supabase
      .from('estimation_parametres_globaux')
      .select('valeur')
      .eq('cle', 'service_actif')
      .single()
    
    return param ? param.valeur : true
    
  } catch (error) {
    console.error('Erreur vérification service actif:', error)
    return true // Par défaut actif
  }
}

/**
 * Récupère la config complète d'une formule
 * @param {string} formule
 * @returns {Promise<Object|null>}
 */
export async function getConfigFormule(formule) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('estimation_config_formules')
      .select('*')
      .eq('formule', formule)
      .eq('actif', true)
      .single()
    
    if (error) throw error
    
    return data
    
  } catch (error) {
    console.error('Erreur récupération config formule:', error)
    return null
  }
}
