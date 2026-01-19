import PDFDocument from 'pdfkit'

/**
 * Génération PDF conforme à docs/estimation.md
 * 
 * STRUCTURE OBLIGATOIRE :
 * 1. Page de couverture
 * 2. Contexte & motif
 * 3. Description du bien
 * 4. Méthodologie
 * 5. Résultat (FOURCHETTE)
 * 6. Limites & responsabilité
 * 7. Mentions légales versionnées
 */

export async function generateEstimationPDF(estimation, mentionLegale) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      })

      const buffers = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // =====================================================================
      // PAGE 1 : COUVERTURE
      // =====================================================================
      
      doc.fontSize(28)
         .fillColor('#1a1a1a')
         .text('RAPPORT D\'ESTIMATION', { align: 'center' })
      
      doc.fontSize(18)
         .fillColor('#666')
         .text('IMMOBILIÈRE INDICATIVE', { align: 'center' })
      
      doc.moveDown(3)
      
      // Logo / Branding (si disponible)
      doc.fontSize(20)
         .fillColor('#0066cc')
         .text('JuraBreak Immobilier', { align: 'center' })
      
      doc.moveDown(3)
      
      // Informations de référence
      doc.fontSize(11)
         .fillColor('#333')
         .text(`Référence : EST-${estimation.id.substring(0, 8).toUpperCase()}`, { align: 'center' })
         .text(`Date : ${new Date(estimation.created_at).toLocaleDateString('fr-FR', { 
           day: 'numeric', 
           month: 'long', 
           year: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         })}`, { align: 'center' })
      
      doc.moveDown(3)
      
      // Client
      doc.fontSize(12)
         .fillColor('#000')
         .text('ÉTABLI POUR :', { align: 'center' })
      
      doc.fontSize(11)
         .fillColor('#333')
         .text(`${estimation.prenom} ${estimation.nom}`, { align: 'center' })
         .text(estimation.email, { align: 'center' })
      
      doc.addPage()
      
      // =====================================================================
      // PAGE 2 : CONTEXTE & MOTIF
      // =====================================================================
      
      addSectionTitle(doc, '1. CONTEXTE & MOTIF')
      
      doc.fontSize(11)
         .fillColor('#333')
         .text('Motif de l\'estimation :', { continued: true })
         .fillColor('#000')
         .text(` ${formatMotif(estimation.motif)}`)
      
      if (estimation.motif === 'autre' && estimation.motif_autre_detail) {
        doc.fillColor('#666')
           .text(`Précision : ${estimation.motif_autre_detail}`, { indent: 20 })
      }
      
      doc.moveDown(1)
      
      // Cadre légal selon motif
      addWarningBox(doc, mentionLegale?.texte_court || 'Cette estimation est indicative.')
      
      doc.moveDown(1.5)
      
      // =====================================================================
      // PAGE 3 : DESCRIPTION DU BIEN
      // =====================================================================
      
      addSectionTitle(doc, '2. DESCRIPTION DU BIEN')
      
      // Localisation
      doc.fontSize(12)
         .fillColor('#000')
         .text('Localisation', { underline: true })
      
      doc.fontSize(11)
         .fillColor('#333')
         .text(`Commune : ${estimation.commune_nom}`)
         .text(`Code postal : ${estimation.code_postal}`)
      
      doc.moveDown(1)
      
      // Caractéristiques principales
      doc.fontSize(12)
         .fillColor('#000')
         .text('Caractéristiques', { underline: true })
      
      const tableData = [
        ['Type de bien', formatTypeBien(estimation.type_bien)],
        ['Surface habitable', `${estimation.surface_habitable} m²`],
        ['Surface terrain', estimation.surface_terrain ? `${estimation.surface_terrain} m²` : 'Non renseigné'],
        ['Année de construction', estimation.annee_construction || 'Non renseignée'],
        ['État du bien', formatEtatBien(estimation.etat_bien)]
      ]
      
      addSimpleTable(doc, tableData)
      
      doc.moveDown(1)
      
      // Options / Plus-values
      if (estimation.options_selectionnees && JSON.parse(estimation.options_selectionnees).length > 0) {
        doc.fontSize(12)
           .fillColor('#000')
           .text('Options & équipements', { underline: true })
        
        const options = JSON.parse(estimation.options_selectionnees)
        const detailOptions = estimation.calcul_detail?.options_appliquees || []
        
        doc.fontSize(11).fillColor('#333')
        detailOptions.forEach(opt => {
          doc.text(`• ${opt.libelle}`, { indent: 20 })
        })
        
        doc.moveDown(1)
      }
      
      doc.addPage()
      
      // =====================================================================
      // PAGE 4 : MÉTHODOLOGIE
      // =====================================================================
      
      addSectionTitle(doc, '3. MÉTHODOLOGIE')
      
      doc.fontSize(11)
         .fillColor('#333')
         .text('Cette estimation a été réalisée selon une méthode automatisée basée sur :')
      
      doc.moveDown(0.5)
      
      const methodologie = [
        'Prix de référence au m² pour la commune ou la zone géographique',
        'Application de coefficients selon le type de bien et son état',
        'Ajustement en fonction de la surface terrain (si applicable)',
        'Prise en compte des options et équipements déclarés',
        'Calcul d\'une fourchette de fiabilité selon la complétude des données'
      ]
      
      methodologie.forEach(item => {
        doc.text(`• ${item}`, { indent: 20 })
      })
      
      doc.moveDown(1.5)
      
      // Détail du calcul
      if (estimation.calcul_detail) {
        const detail = estimation.calcul_detail
        
        addInfoBox(doc, 'Détail du calcul', [
          `Prix/m² de référence : ${detail.prix_m2_reference?.toFixed(2)} €`,
          `Surface habitable : ${detail.surface_habitable} m²`,
          `Valeur brute : ${detail.valeur_brute?.toLocaleString('fr-FR')} €`,
          `Coefficient appliqué : ${detail.coefficient_total?.toFixed(3)}`,
          detail.ajustement_terrain > 0 ? `Ajustement terrain : +${detail.ajustement_terrain?.toLocaleString('fr-FR')} €` : null,
          detail.total_plus_values > 0 ? `Plus-values : +${detail.total_plus_values?.toLocaleString('fr-FR')} €` : null
        ].filter(Boolean))
      }
      
      doc.moveDown(1)
      
      // Date version des barèmes
      doc.fontSize(10)
         .fillColor('#666')
         .text(`Calcul réalisé le : ${new Date(estimation.calcule_at).toLocaleString('fr-FR')}`)
      
      if (estimation.version_regles_id) {
        doc.text(`Version des règles : ${estimation.version_regles_id.substring(0, 8)}`)
      }
      
      doc.addPage()
      
      // =====================================================================
      // PAGE 5 : RÉSULTAT - FOURCHETTE OBLIGATOIRE
      // =====================================================================
      
      addSectionTitle(doc, '4. RÉSULTAT DE L\'ESTIMATION')
      
      // Encadré résultat
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
      const boxHeight = 120
      
      doc.roundedRect(doc.page.margins.left, doc.y, pageWidth, boxHeight, 8)
         .fillAndStroke('#e6f2ff', '#0066cc')
      
      const boxY = doc.y + 20
      
      doc.fontSize(14)
         .fillColor('#0066cc')
         .text('FOURCHETTE D\'ESTIMATION', doc.page.margins.left, boxY, { width: pageWidth, align: 'center' })
      
      doc.fontSize(28)
         .fillColor('#1a1a1a')
         .text(
           `${estimation.valeur_basse?.toLocaleString('fr-FR')} € - ${estimation.valeur_haute?.toLocaleString('fr-FR')} €`,
           doc.page.margins.left,
           boxY + 30,
           { width: pageWidth, align: 'center' }
         )
      
      doc.fontSize(12)
         .fillColor('#666')
         .text(
           `Valeur médiane : ${estimation.valeur_mediane?.toLocaleString('fr-FR')} €`,
           doc.page.margins.left,
           boxY + 70,
           { width: pageWidth, align: 'center' }
         )
      
      doc.y += boxHeight + 20
      doc.moveDown(1)
      
      // Niveau de confiance
      addInfoBox(doc, 'Niveau de fiabilité', [
        `Cette estimation est classée : ${formatNiveauFiabilite(estimation.niveau_fiabilite)}`,
        `Marge appliquée : ${estimation.calcul_detail?.marge_basse_pct || 20}% à la baisse, ${estimation.calcul_detail?.marge_haute_pct || 20}% à la hausse`
      ])
      
      doc.moveDown(1.5)
      
      // =====================================================================
      // PAGE 6 : LIMITES & RESPONSABILITÉ
      // =====================================================================
      
      addSectionTitle(doc, '5. LIMITES & RESPONSABILITÉ')
      
      doc.fontSize(11)
         .fillColor('#333')
      
      const limites = [
        'Cette estimation est réalisée de manière automatisée, sans visite physique du bien.',
        'Elle se base exclusivement sur les données déclarées par le demandeur.',
        'Les valeurs indiquées sont des estimations indicatives et non des évaluations certifiées.',
        'Cette estimation ne constitue pas une expertise immobilière au sens réglementaire.',
        'Elle ne peut être utilisée comme valeur opposable dans un cadre juridique (divorce, succession, etc.).',
        'JuraBreak Immobilier ne peut être tenu responsable d\'une éventuelle différence avec la valeur réelle de marché.',
        'Pour une estimation juridiquement viable, une expertise par un professionnel certifié est nécessaire.'
      ]
      
      limites.forEach((item, index) => {
        doc.text(`${index + 1}. ${item}`, { indent: 0, paragraphGap: 8 })
      })
      
      doc.addPage()
      
      // =====================================================================
      // PAGE 7 : MENTIONS LÉGALES VERSIONNÉES
      // =====================================================================
      
      addSectionTitle(doc, '6. MENTIONS LÉGALES')
      
      if (mentionLegale) {
        doc.fontSize(11)
           .fillColor('#333')
           .text(mentionLegale.texte_long, { align: 'justify' })
        
        doc.moveDown(1)
        
        doc.fontSize(9)
           .fillColor('#999')
           .text(`Version des mentions : ${mentionLegale.version} - Motif : ${estimation.motif}`)
      }
      
      doc.moveDown(2)
      
      // =====================================================================
      // PIED DE PAGE : Coordonnées
      // =====================================================================
      
      doc.fontSize(10)
         .fillColor('#666')
         .text('JuraBreak Immobilier', { align: 'center' })
         .text('Votre agence immobilière de confiance dans le Jura', { align: 'center' })
         .text('contact@jurabreak.fr | 06 XX XX XX XX', { align: 'center' })
      
      doc.end()
      
    } catch (error) {
      reject(error)
    }
  })
}

// =====================================================================
// FONCTIONS UTILITAIRES
// =====================================================================

function addSectionTitle(doc, title) {
  doc.fontSize(16)
     .fillColor('#0066cc')
     .text(title, { underline: true })
  doc.moveDown(1)
}

function addWarningBox(doc, text) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const boxY = doc.y
  
  // Calculer la hauteur nécessaire
  const textHeight = doc.heightOfString(text, { width: pageWidth - 40 })
  const boxHeight = textHeight + 30
  
  doc.roundedRect(doc.page.margins.left, boxY, pageWidth, boxHeight, 6)
     .fillAndStroke('#fff3cd', '#ffc107')
  
  doc.fontSize(11)
     .fillColor('#856404')
     .text('⚠️  ' + text, doc.page.margins.left + 20, boxY + 15, { width: pageWidth - 40, align: 'justify' })
  
  doc.y = boxY + boxHeight + 10
}

function addInfoBox(doc, title, items) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  
  doc.fontSize(12)
     .fillColor('#0066cc')
     .text(title, { underline: true })
  
  doc.fontSize(10)
     .fillColor('#333')
  
  items.forEach(item => {
    doc.text(`• ${item}`, { indent: 15 })
  })
}

function addSimpleTable(doc, rows) {
  const startX = doc.page.margins.left
  const colWidth = 250
  
  doc.fontSize(10).fillColor('#333')
  
  rows.forEach(([label, value]) => {
    const y = doc.y
    doc.text(label + ' :', startX, y, { width: colWidth - 20, continued: false })
    doc.text(value, startX + colWidth, y, { width: colWidth })
    doc.moveDown(0.5)
  })
}

function formatTypeBien(type) {
  const types = {
    'maison': 'Maison',
    'appartement': 'Appartement',
    'autre': 'Autre'
  }
  return types[type] || type
}

function formatEtatBien(etat) {
  const etats = {
    'a_renover': 'À rénover',
    'correct': 'Correct',
    'bon': 'Bon',
    'tres_bon': 'Très bon / Récent'
  }
  return etats[etat] || etat
}

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

function formatNiveauFiabilite(niveau) {
  const niveaux = {
    'minimal': 'MINIMAL (données de base)',
    'complet': 'COMPLET (données détaillées)',
    'tres_complet': 'TRÈS COMPLET (données exhaustives)'
  }
  return niveaux[niveau] || niveau
}
