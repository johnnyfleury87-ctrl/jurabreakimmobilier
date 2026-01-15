import PDFDocument from 'pdfkit'

/**
 * Génère un PDF d'estimation immobilière
 * @param {Object} estimation - Données de l'estimation depuis la DB
 * @param {string} formule - 'formule_1' ou 'formule_2'
 * @returns {Buffer} - Buffer du PDF généré
 */
export async function generateEstimationPDF(estimation, formule) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      const buffers = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
      doc.on('error', reject)

      // ========== EN-TÊTE ==========
      doc.fontSize(24)
         .fillColor('#2c5282')
         .text('JuraBreak Immobilier', { align: 'center' })
      
      doc.fontSize(12)
         .fillColor('#666')
         .text('Votre agence immobilière de confiance dans le Jura', { align: 'center' })
      
      doc.moveDown(2)
      
      // ========== TITRE ==========
      doc.fontSize(20)
         .fillColor('#2c5282')
         .text(`Estimation ${formule === 'formule_2' ? 'Juridiquement Viable' : 'Détaillée'}`, { align: 'center' })
      
      doc.moveDown(1)
      
      // ========== INFORMATIONS CLIENT ==========
      doc.fontSize(14)
         .fillColor('#000')
         .text('Informations du propriétaire', { underline: true })
      
      doc.moveDown(0.5)
      doc.fontSize(11)
         .fillColor('#333')
         .text(`Nom : ${estimation.nom} ${estimation.prenom}`)
         .text(`Email : ${estimation.email}`)
      
      if (estimation.telephone) {
        doc.text(`Téléphone : ${estimation.telephone}`)
      }
      
      doc.moveDown(1.5)
      
      // ========== INFORMATIONS DU BIEN ==========
      doc.fontSize(14)
         .fillColor('#000')
         .text('Informations du bien', { underline: true })
      
      doc.moveDown(0.5)
      doc.fontSize(11)
         .fillColor('#333')
         .text(`Adresse : ${estimation.adresse_bien}`)
         .text(`Type de bien : ${formatTypeBien(estimation.type_bien)}`)
         .text(`Surface : ${estimation.surface} m²`)
      
      if (estimation.nb_pieces) {
        doc.text(`Nombre de pièces : ${estimation.nb_pieces}`)
      }
      
      if (estimation.annee_construction) {
        doc.text(`Année de construction : ${estimation.annee_construction}`)
      }
      
      if (estimation.etat_general) {
        doc.text(`État général : ${formatEtatGeneral(estimation.etat_general)}`)
      }
      
      if (estimation.travaux) {
        doc.moveDown(0.5)
        doc.text('Travaux :')
        doc.fontSize(10)
           .fillColor('#555')
           .text(estimation.travaux, { indent: 20 })
        doc.fontSize(11).fillColor('#333')
      }
      
      if (estimation.environnement) {
        doc.moveDown(0.5)
        doc.text('Environnement :')
        doc.fontSize(10)
           .fillColor('#555')
           .text(estimation.environnement, { indent: 20 })
        doc.fontSize(11).fillColor('#333')
      }
      
      doc.moveDown(2)
      
      // ========== ESTIMATION DE VALEUR ==========
      doc.fontSize(14)
         .fillColor('#000')
         .text('Estimation de valeur', { underline: true })
      
      doc.moveDown(0.5)
      
      // Calcul indicatif (à personnaliser selon votre logique métier)
      const estimationBasse = Math.round(estimation.surface * 2000)
      const estimationHaute = Math.round(estimation.surface * 2800)
      const estimationMoyenne = Math.round((estimationBasse + estimationHaute) / 2)
      
      doc.fontSize(11)
         .fillColor('#333')
         .text(`Fourchette d'estimation : ${formatPrice(estimationBasse)} - ${formatPrice(estimationHaute)}`)
      
      doc.fontSize(13)
         .fillColor('#2c5282')
         .text(`Valeur moyenne estimée : ${formatPrice(estimationMoyenne)}`, { bold: true })
      
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
      
      if (formule === 'formule_2') {
        doc.text('Cette estimation a été réalisée suite à une visite sur place par un professionnel de l\'immobilier.')
           .text('Elle prend en compte les caractéristiques du bien, son état, son environnement et les transactions récentes dans le secteur.')
           .text('Cette estimation a une valeur juridiquement reconnue et peut être utilisée dans un cadre légal.')
      } else {
        doc.text('Cette estimation a été réalisée sur la base des informations fournies et de l\'analyse du marché local.')
           .text('Elle prend en compte les caractéristiques du bien et les transactions récentes dans le secteur.')
           .text('Cette estimation est indicative et ne constitue pas une expertise officielle.')
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
         .text(getMentionsLegales(formule), { align: 'justify', lineGap: 3 })
      
      doc.moveDown(2)
      
      // ========== SIGNATURE ==========
      if (formule === 'formule_2') {
        doc.fontSize(10)
           .fillColor('#333')
           .text(`Établi le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' })
        
        doc.moveDown(1)
        doc.text('Signature et cachet de l\'agence :', { align: 'right' })
        doc.moveDown(2)
        doc.fontSize(12)
           .fillColor('#2c5282')
           .text('JuraBreak Immobilier', { align: 'right' })
      }
      
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
      
      // Finaliser le PDF
      doc.end()
    } catch (error) {
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
