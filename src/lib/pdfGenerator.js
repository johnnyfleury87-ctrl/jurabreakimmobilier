import { jsPDF } from 'jspdf'

/**
 * Génère un PDF d'estimation immobilière
 * @param {Object} estimation - Données de l'estimation depuis la DB
 * @param {string} formule - 'formule_1' ou 'formule_2'
 * @param {Object} options - Options : { testMode: boolean }
 * @returns {Buffer} - Buffer du PDF généré
 */
export async function generateEstimationPDF(estimation, formule, options = {}) {
  const { testMode = false } = options
  
  console.log('[pdfGenerator-jsPDF] ========== DÉBUT GÉNÉRATION ==========')
  console.log('[pdfGenerator-jsPDF] Environment:', process.env.NODE_ENV)
  console.log('[pdfGenerator-jsPDF] Test mode:', testMode)
  console.log('[pdfGenerator-jsPDF] Estimation ID:', estimation?.id)
  
  try {
    // Validation données critiques avec fallbacks
    const safeEstimation = {
      id: estimation?.id || 'N/A',
      nom: estimation?.nom || 'Non renseigné',
      prenom: estimation?.prenom || 'Non renseigné',
      email: estimation?.email || 'noreply@jurabreakimmobilier.com',
      telephone: estimation?.telephone || 'Non renseigné',
      commune_nom: estimation?.commune_nom || 'Non renseignée',
      code_postal: estimation?.code_postal || '39000',
      surface_habitable: estimation?.surface_habitable || 0,
      etat_bien: estimation?.etat_bien || 'correct',
      nb_pieces: estimation?.nb_pieces || 0,
      annee_construction: estimation?.annee_construction || null,
      formule: estimation?.formule || formule || 'gratuite',
      valeur_basse: estimation?.valeur_basse || 0,
      valeur_mediane: estimation?.valeur_mediane || 0,
      valeur_haute: estimation?.valeur_haute || 0,
      niveau_fiabilite: estimation?.niveau_fiabilite || 'minimal',
      motif: estimation?.motif || null,
      motif_autre_detail: estimation?.motif_autre_detail || null,
      options_selectionnees: Array.isArray(estimation?.options_selectionnees) 
        ? estimation.options_selectionnees 
        : [],
      created_at: estimation?.created_at || new Date().toISOString()
    }
    
    console.log('[pdfGenerator-jsPDF] Création document jsPDF...')
    const doc = new jsPDF()
    let y = 20
    
    // ========== WATERMARK MODE TEST ==========
    if (testMode) {
      console.log('[pdfGenerator-jsPDF] Ajout watermark TEST')
      doc.setTextColor(255, 0, 0)
      doc.setFontSize(60)
      doc.setGState(doc.GState({ opacity: 0.15 }))
      doc.text('MODE TEST', 105, 150, { angle: 45, align: 'center' })
      doc.setGState(doc.GState({ opacity: 1 }))
      
      // Bandeau rouge
      doc.setFillColor(255, 0, 0)
      doc.rect(0, 0, 210, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text('PDF GENERE EN MODE TEST - NE PAS UTILISER EN PRODUCTION', 105, 6, { align: 'center' })
      y = 25
    }
    
    // ========== EN-TÊTE ==========
    console.log('[pdfGenerator-jsPDF] Rendu en-tête')
    doc.setTextColor(44, 82, 130)
    doc.setFontSize(24)
    doc.text('JuraBreak Immobilier', 105, y, { align: 'center' })
    y += 8
    
    doc.setTextColor(102, 102, 102)
    doc.setFontSize(12)
    doc.text('Votre agence immobilière de confiance dans le Jura', 105, y, { align: 'center' })
    y += 15
    
    // ========== TITRE ==========
    console.log('[pdfGenerator-jsPDF] Rendu titre')
    doc.setTextColor(44, 82, 130)
    doc.setFontSize(20)
    const titreFormule = safeEstimation.formule === 'premium' ? 'Premium' : 
                         safeEstimation.formule === 'standard' ? 'Standard' : 'Gratuite'
    doc.text(`Estimation ${titreFormule}`, 105, y, { align: 'center' })
    y += 15
    
    // ========== INFORMATIONS CLIENT ==========
    console.log('[pdfGenerator-jsPDF] Rendu infos client')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Informations du propriétaire', 20, y)
    y += 8
    
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(11)
    doc.text(`Nom : ${safeEstimation.nom} ${safeEstimation.prenom}`, 20, y)
    y += 6
    doc.text(`Email : ${safeEstimation.email}`, 20, y)
    y += 6
    
    if (safeEstimation.telephone && safeEstimation.telephone !== 'Non renseigné') {
      doc.text(`Telephone : ${safeEstimation.telephone}`, 20, y)
      y += 6
    }
    y += 10
    
    // ========== INFORMATIONS DU BIEN ==========
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Informations du bien', 20, y)
    y += 8
    
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(11)
    doc.text(`Localisation : ${safeEstimation.commune_nom} (${safeEstimation.code_postal})`, 20, y)
    y += 6
    doc.text(`Surface habitable : ${safeEstimation.surface_habitable} m²`, 20, y)
    y += 6
    
    if (safeEstimation.nb_pieces > 0) {
      doc.text(`Nombre de pieces : ${safeEstimation.nb_pieces}`, 20, y)
      y += 6
    }
    
    if (safeEstimation.etat_bien) {
      doc.text(`Etat du bien : ${formatEtatBien(safeEstimation.etat_bien)}`, 20, y)
      y += 6
    }
    
    if (safeEstimation.annee_construction) {
      doc.text(`Annee de construction : ${safeEstimation.annee_construction}`, 20, y)
      y += 6
    }
    y += 10
    
    // ========== ESTIMATION DE VALEUR ==========
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Estimation de valeur', 20, y)
    y += 8
    
    const estimationBasse = safeEstimation.valeur_basse || Math.round(safeEstimation.surface_habitable * 1800)
    const estimationHaute = safeEstimation.valeur_haute || Math.round(safeEstimation.surface_habitable * 2400)
    const estimationMoyenne = safeEstimation.valeur_mediane || Math.round((estimationBasse + estimationHaute) / 2)
    
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(11)
    doc.text(`Fourchette d'estimation : ${formatPrice(estimationBasse)} - ${formatPrice(estimationHaute)}`, 20, y)
    y += 8
    
    doc.setTextColor(44, 82, 130)
    doc.setFontSize(13)
    doc.text(`Valeur moyenne estimee : ${formatPrice(estimationMoyenne)}`, 20, y)
    y += 10
    
    doc.setTextColor(102, 102, 102)
    doc.setFontSize(10)
    doc.text('* Cette estimation est basee sur l\'analyse du marche local', 20, y)
    y += 15
    
    // ========== MÉTHODOLOGIE ==========
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Methodologie', 20, y)
    y += 8
    
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(10)
    const maxWidth = 170
    if (safeEstimation.formule === 'premium') {
      doc.text('Cette estimation premium a ete realisee avec analyse detaillee du bien.', 20, y, { maxWidth })
    } else if (safeEstimation.formule === 'standard') {
      doc.text('Cette estimation standard a ete realisee sur la base des informations fournies.', 20, y, { maxWidth })
    } else {
      doc.text('Cette estimation gratuite donne une premiere indication de valeur.', 20, y, { maxWidth })
    }
    y += 20
    
    // ========== FOOTER ==========
    doc.setTextColor(153, 153, 153)
    doc.setFontSize(8)
    doc.text('JuraBreak Immobilier - contact@jurabreak.fr - 06 XX XX XX XX', 105, 285, { align: 'center' })
    
    console.log('[pdfGenerator-jsPDF] Conversion en Buffer...')
    const pdfOutput = doc.output('arraybuffer')
    const pdfBuffer = Buffer.from(pdfOutput)
    
    console.log('[pdfGenerator-jsPDF] ✅ PDF terminé, taille:', pdfBuffer.length)
    return pdfBuffer
    
  } catch (error) {
    console.error('[pdfGenerator-jsPDF] ❌ Erreur génération:', error)
    console.error('[pdfGenerator-jsPDF] Message:', error.message)
    console.error('[pdfGenerator-jsPDF] Stack:', error.stack)
    throw error
  }
}

/**
 * Retourne les mentions légales selon la formule
 */
function getMentionsLegales(formule) {
  const baseMentions = `
MENTIONS LÉGALES ET CONDITIONS D'UTILISATION

1. OBJET
Le présent document constitue une estimation de la valeur vénale d'un bien immobilier réalisée par JuraBreak Immobilier, agence immobilière située dans le Jura.

2. CADRE JURIDIQUE
Cette estimation est réalisée conformément à la loi Hoguet n°70-9 du 2 janvier 1970 et son décret d'application n°72-678 du 20 juillet 1972, régissant les activités d'entremise et de gestion immobilière.

3. VALIDITÉ DE L'ESTIMATION
${formule === 'formule_2' 
  ? 'Cette estimation a une valeur juridiquement reconnue et peut être utilisée dans un cadre légal (succession, donation, déclaration fiscale, etc.). Elle est valable pour une durée de 3 mois à compter de sa date d\'émission, sauf changement significatif du marché immobilier.' 
  : 'Cette estimation est indicative et fournie à titre informatif. Elle ne constitue pas une expertise officielle et n\'a pas de valeur juridique contraignante. Pour une estimation juridiquement reconnue, optez pour notre Formule 2.'}

4. MÉTHODOLOGIE
L'estimation est établie en fonction :
- Des caractéristiques intrinsèques du bien (surface, état, équipements)
- De son environnement et de sa localisation
- Des transactions récentes de biens similaires dans le secteur
${formule === 'formule_2' ? '- D\'une visite sur place réalisée par un professionnel qualifié' : '- Des informations déclarées par le propriétaire'}

5. LIMITES DE RESPONSABILITÉ
Cette estimation est réalisée sur la base des informations fournies par le propriétaire et considérées comme exactes. JuraBreak Immobilier ne saurait être tenu responsable des erreurs résultant d'informations erronées ou incomplètes.

L'estimation fournie est une fourchette de valeur et ne constitue en aucun cas une garantie de prix de vente. Le prix de vente final dépendra de la négociation entre les parties et des conditions du marché au moment de la transaction.

6. PROTECTION DES DONNÉES PERSONNELLES
Conformément au Règlement Général sur la Protection des Données (RGPD), les informations collectées sont destinées exclusivement à l'usage de JuraBreak Immobilier pour la réalisation de cette estimation. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant contact@jurabreak.fr.

7. PROPRIÉTÉ INTELLECTUELLE
Ce document est la propriété exclusive de JuraBreak Immobilier. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.

8. CONTACT
Pour toute question concernant cette estimation, vous pouvez nous contacter :
Email : contact@jurabreak.fr
Téléphone : 06 XX XX XX XX
Adresse : JuraBreak Immobilier, Jura, France

Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
`.trim()

  return baseMentions
}

/**
 * Formate le type de bien
 */
function formatTypeBien(type) {
  const types = {
    'maison': 'Maison',
    'appartement': 'Appartement',
    'terrain': 'Terrain',
    'local_commercial': 'Local commercial',
    'autre': 'Autre'
  }
  return types[type] || type
}

/**
 * Formate l'état du bien
 */
function formatEtatBien(etat) {
  const etats = {
    'a_renover': 'À rénover',
    'correct': 'Correct',
    'bon': 'Bon',
    'tres_bon': 'Très bon / Récent'
  }
  return etats[etat] || etat
}

/**
 * Formate le motif de l'estimation
 */
function formatMotif(motif) {
  const motifs = {
    'curiosite': 'Curiosité / Information',
    'vente': 'Projet de vente',
    'divorce': 'Divorce / Séparation',
    'succession': 'Succession',
    'notaire': 'Discussion notariale',
    'autre': 'Autre'
  }
  return motifs[motif] || motif
}

/**
 * Formate le niveau de fiabilité
 */
function formatNiveauFiabilite(niveau) {
  const niveaux = {
    'minimal': 'Minimal (±20%)',
    'complet': 'Complet (±10%)',
    'tres_complet': 'Très complet (±5%)'
  }
  return niveaux[niveau] || niveau
}

/**
 * Formate l'état général
 */
function formatEtatGeneral(etat) {
  const etats = {
    'neuf': 'Neuf',
    'excellent': 'Excellent',
    'bon': 'Bon',
    'moyen': 'Moyen',
    'a_renover': 'À rénover'
  }
  return etats[etat] || etat
}

/**
 * Formate un prix en euros
 */
function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(price)
}
