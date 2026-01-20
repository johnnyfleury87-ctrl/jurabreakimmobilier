import PDFDocument from 'pdfkit'

/**
 * Génère un PDF d'estimation immobilière
 * @param {Object} estimation - Données de l'estimation depuis la DB
 * @param {string} formule - 'formule_1' ou 'formule_2'
 * @param {Object} options - Options : { testMode: boolean }
 * @returns {Buffer} - Buffer du PDF généré
 */
export async function generateEstimationPDF(estimation, formule, options = {}) {
  const { testMode = false } = options
  
  return new Promise((resolve, reject) => {
    try {
      console.log('[pdfGenerator] ========== DÉBUT GÉNÉRATION ==========')
      console.log('[pdfGenerator] Environment:', process.env.NODE_ENV)
      console.log('[pdfGenerator] Platform:', process.platform)
      console.log('[pdfGenerator] Test mode:', testMode)
      console.log('[pdfGenerator] Estimation ID:', estimation?.id)
      
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
      
      console.log('[pdfGenerator] Création PDFDocument...')
      
      // 🔧 FIX VERCEL: Ne pas spécifier de font par défaut
      // Laisser pdfkit utiliser ses fonts intégrées
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
        autoFirstPage: true
      })

      console.log('[pdfGenerator] PDFDocument créé')

      const buffers = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        console.log('[pdfGenerator] ✅ PDF terminé, taille:', pdfBuffer.length)
        resolve(pdfBuffer)
      })
      doc.on('error', (err) => {
        console.error('[pdfGenerator] ❌ Erreur PDFKit:', err)
        console.error('[pdfGenerator] Stack:', err.stack)
        reject(err)
      })

      console.log('[pdfGenerator] Démarrage du rendu...')

      // ========== WATERMARK MODE TEST ==========
      if (testMode) {
        console.log('[pdfGenerator] Ajout watermark TEST')
        doc.save()
        doc.rotate(45, { origin: [300, 400] })
        doc.fontSize(60)
           .fillColor('#ff0000', 0.15)
           .text('MODE TEST', 100, 350, {
             width: 400,
             align: 'center'
           })
        doc.restore()
        
        // Bandeau rouge en haut
        doc.rect(0, 0, 595, 30)
           .fill('#ff0000')
        
        doc.fontSize(12)
           .fillColor('#ffffff')
           .text('⚠️ PDF GÉNÉRÉ EN MODE TEST - NE PAS UTILISER EN PRODUCTION', 50, 8, { align: 'center' })
      }

      // ========== EN-TÊTE ==========
      console.log('[pdfGenerator] Rendu en-tête')
      try {
        doc.fontSize(24)
           .fillColor('#2c5282')
           .text('JuraBreak Immobilier', { align: 'center' })
        
        doc.fontSize(12)
           .fillColor('#666')
           .text('Votre agence immobilière de confiance dans le Jura', { align: 'center' })
        
        doc.moveDown(2)
        
        // ========== TITRE ==========
        console.log('[pdfGenerator] Rendu titre')
        doc.fontSize(20)
           .fillColor('#2c5282')
           .text(`Estimation ${safeEstimation.formule === 'premium' ? 'Premium' : safeEstimation.formule === 'standard' ? 'Standard' : 'Gratuite'}`, { align: 'center' })
        
        doc.moveDown(1)
        
        // ========== INFORMATIONS CLIENT ==========
        console.log('[pdfGenerator] Rendu infos client')
        doc.fontSize(14)
           .fillColor('#000')
           .text('Informations du propriétaire', { underline: true })
        
        doc.moveDown(0.5)
      doc.fontSize(11)
         .fillColor('#333')
         .text(`Nom : ${safeEstimation.nom} ${safeEstimation.prenom}`)
         .text(`Email : ${safeEstimation.email}`)
      
      if (safeEstimation.telephone && safeEstimation.telephone !== 'Non renseigné') {
        doc.text(`Téléphone : ${safeEstimation.telephone}`)
      }
      
      doc.moveDown(1.5)
      
      // ========== INFORMATIONS DU BIEN ==========
      doc.fontSize(14)
         .fillColor('#000')
         .text('Informations du bien', { underline: true })
      
      doc.moveDown(0.5)
      doc.fontSize(11)
         .fillColor('#333')
         .text(`Localisation : ${safeEstimation.commune_nom} (${safeEstimation.code_postal})`)
         .text(`Surface habitable : ${safeEstimation.surface_habitable} m²`)
      
      if (safeEstimation.nb_pieces > 0) {
        doc.text(`Nombre de pièces : ${safeEstimation.nb_pieces}`)
      }
      
      if (safeEstimation.etat_bien) {
        doc.text(`État du bien : ${formatEtatBien(safeEstimation.etat_bien)}`);
      }
      
      if (safeEstimation.annee_construction) {
        doc.text(`Année de construction : ${safeEstimation.annee_construction}`);
      }
      
      if (estimation.annee_construction) {
        doc.text(`Année de construction : ${estimation.annee_construction}`);
      }
      
      // Options sélectionnées
      if (safeEstimation.options_selectionnees && safeEstimation.options_selectionnees.length > 0) {
        doc.moveDown(0.5)
        doc.text('Options et plus-values :')
        doc.fontSize(10)
           .fillColor('#555')
        safeEstimation.options_selectionnees.forEach(opt => {
          doc.text(`• ${opt}`, { indent: 20 })
        })
        doc.fontSize(11).fillColor('#333')
      }
      
      // Motif de l'estimation
      if (safeEstimation.motif) {
        doc.moveDown(0.5)
        doc.text(`Motif de l'estimation : ${formatMotif(safeEstimation.motif)}`)
        if (safeEstimation.motif === 'autre' && safeEstimation.motif_autre_detail) {
          doc.fontSize(10)
             .fillColor('#555')
             .text(safeEstimation.motif_autre_detail, { indent: 20 })
          doc.fontSize(11).fillColor('#333')
        }
      }
      
      doc.moveDown(2)
      
      // ========== ESTIMATION DE VALEUR ==========
      doc.fontSize(14)
         .fillColor('#000')
         .text('Estimation de valeur', { underline: true })
      
      doc.moveDown(0.5)
      
      // Utiliser les valeurs calculées si disponibles, sinon fallback
      const estimationBasse = safeEstimation.valeur_basse || Math.round(safeEstimation.surface_habitable * 1800)
      const estimationHaute = safeEstimation.valeur_haute || Math.round(safeEstimation.surface_habitable * 2400)
      const estimationMoyenne = safeEstimation.valeur_mediane || Math.round((estimationBasse + estimationHaute) / 2)
      
      doc.fontSize(11)
         .fillColor('#333')
         .text(`Fourchette d'estimation : ${formatPrice(estimationBasse)} - ${formatPrice(estimationHaute)}`)
      
      doc.fontSize(13)
         .fillColor('#2c5282')
         .text(`Valeur moyenne estimée : ${formatPrice(estimationMoyenne)}`, { bold: true })
      
      doc.moveDown(0.5)
      
      if (safeEstimation.niveau_fiabilite) {
        doc.fontSize(10)
           .fillColor('#666')
           .text(`Niveau de fiabilité : ${formatNiveauFiabilite(safeEstimation.niveau_fiabilite)}`)
      }
      
      doc.moveDown(1)
      
      doc.fontSize(10)
         .fillColor('#666')
         .text('* Cette estimation est basée sur l\'analyse du marché local et les caractéristiques du bien.')
      
      doc.moveDown(2)
      
      // ========== MÉTHODOLOGIE ==========
      doc.fontSize(14)
         .fillColor('#000')
         .text('Méthodologie', { underline: true })
      
      doc.moveDown(0.5)
      doc.fontSize(10)
         .fillColor('#333')
      
      if (safeEstimation.formule === 'premium') {
        doc.text('Cette estimation premium a été réalisée avec analyse détaillée des caractéristiques du bien.')
           .text('Elle prend en compte les éléments de confort, l\'état général et les transactions récentes.')
           .text('Cette estimation est indicative et ne constitue pas une expertise officielle.')
      } else if (safeEstimation.formule === 'standard') {
        doc.text('Cette estimation standard a été réalisée sur la base des informations fournies.')
           .text('Elle prend en compte les caractéristiques principales et les transactions locales.')
           .text('Cette estimation est indicative.')
      } else {
        doc.text('Cette estimation gratuite a été réalisée sur la base des informations de base.')
           .text('Elle donne une première indication de valeur.')
           .text('Pour une estimation plus précise, consultez nos formules payantes.')
      }
      
      doc.moveDown(2)
      
      // ========== MENTIONS LÉGALES ==========
      doc.addPage()
      
      doc.fontSize(14)
         .fillColor('#000')
         .text('Mentions Légales', { underline: true })
      
      doc.moveDown(0.5)
      doc.fontSize(9)
         .fillColor('#333')
         .text(getMentionsLegales(safeEstimation.formule), { align: 'justify', lineGap: 3 })
      
      doc.moveDown(2)
      
      // ========== SIGNATURE ==========
      doc.fontSize(10)
         .fillColor('#333')
         .text(`Établi le ${new Date(safeEstimation.created_at).toLocaleDateString('fr-FR')}`, { align: 'right' })
      
      doc.moveDown(1)
      doc.text('JuraBreak Immobilier', { align: 'right' })
      
      // ========== FOOTER ==========
      const pageCount = doc.bufferedPageRange().count
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i)
        doc.fontSize(8)
           .fillColor('#999')
           .text(
             `JuraBreak Immobilier - contact@jurabreak.fr - 06 XX XX XX XX`,
             50,
             doc.page.height - 30,
             { align: 'center' }
           )
      }
      
      console.log('[pdfGenerator] Finalisation du PDF')
      // Finaliser le PDF
      doc.end()
      } catch (renderError) {
        console.error('[pdfGenerator] ❌ ERREUR PENDANT LE RENDU:', renderError)
        console.error('[pdfGenerator] Message:', renderError.message)
        console.error('[pdfGenerator] Code:', renderError.code)
        console.error('[pdfGenerator] Stack:', renderError.stack)
        reject(new Error(`Erreur rendu PDF: ${renderError.message} (code: ${renderError.code})`))
      }
    } catch (error) {
      console.error('[pdfGenerator] ❌ Erreur génération globale:', error)
      console.error('[pdfGenerator] Message:', error.message)
      console.error('[pdfGenerator] Stack:', error.stack)
      reject(error)
    }
  })
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
