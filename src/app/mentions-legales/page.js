import styles from './page.module.css'

export const metadata = {
  title: 'Mentions Légales & CGV - JuraBreak Immobilier',
  description: 'Conditions générales de vente et mentions légales de JuraBreak Immobilier'
}

export default function MentionsLegalesPage() {
  return (
    <div className={styles.mentions}>
      <div className="container">
        <h1>Mentions Légales & CGV</h1>
        
        <nav className={styles.nav}>
          <a href="#cgv">Conditions Générales de Vente</a>
          <a href="#mentions">Mentions Légales</a>
          <a href="#rgpd">Protection des Données</a>
        </nav>
        
        {/* ========== CGV ========== */}
        <section id="cgv" className={styles.section}>
          <h2>Conditions Générales de Vente (CGV)</h2>
          <p className={styles.lastUpdate}>Dernière mise à jour : 15 janvier 2026</p>
          
          <h3>Article 1 - Objet</h3>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre 
            JuraBreak Immobilier et toute personne souhaitant bénéficier d'une prestation d'estimation immobilière.
          </p>
          <p>
            En commandant une estimation via le site web, le Client reconnaît avoir pris connaissance des présentes 
            CGV et les accepte sans réserve.
          </p>
          
          <h3>Article 2 - Services Proposés</h3>
          <div className={styles.formules}>
            <div className={styles.formule}>
              <h4>Formule 0 - Estimation Gratuite</h4>
              <ul>
                <li><strong>Prix :</strong> Gratuit</li>
                <li><strong>Description :</strong> Estimation automatique indicative</li>
                <li><strong>Délai :</strong> Immédiat</li>
                <li><strong>Valeur juridique :</strong> Aucune</li>
              </ul>
            </div>
            
            <div className={styles.formule}>
              <h4>Formule 1 - Estimation Standard</h4>
              <ul>
                <li><strong>Prix :</strong> 49€ TTC</li>
                <li><strong>Description :</strong> Estimation détaillée avec rapport PDF</li>
                <li><strong>Délai :</strong> Sous 48h ouvrées</li>
                <li><strong>Valeur juridique :</strong> Indicative uniquement</li>
              </ul>
            </div>
            
            <div className={styles.formule}>
              <h4>Formule 2 - Estimation Premium</h4>
              <ul>
                <li><strong>Prix :</strong> 149€ TTC</li>
                <li><strong>Description :</strong> Estimation avec visite sur place, juridiquement viable</li>
                <li><strong>Délai :</strong> Visite sous 5 jours, rapport sous 7 jours</li>
                <li><strong>Valeur juridique :</strong> Reconnue</li>
              </ul>
            </div>
          </div>
          
          <h3>Article 3 - Commande et Paiement</h3>
          <p>
            Le paiement s'effectue en ligne par carte bancaire via la plateforme sécurisée Stripe. 
            Les prix sont indiqués en euros TTC. Le paiement est exigible immédiatement lors de la commande.
          </p>
          
          <h3>Article 4 - Droit de Rétractation</h3>
          <p>
            Conformément à l'article L221-28 du Code de la consommation, en commandant une estimation, 
            le Client accepte expressément que l'exécution du service commence immédiatement et renonce 
            à son droit de rétractation.
          </p>
          
          <h3>Article 5 - Responsabilité</h3>
          <p>
            <strong>Formule 0 :</strong> Estimation fournie à titre purement indicatif sans garantie d'exactitude.<br />
            <strong>Formule 1 :</strong> Estimation indicative, ne garantit pas le prix de vente final.<br />
            <strong>Formule 2 :</strong> Estimation juridiquement viable, mais ne garantit pas les fluctuations du marché.
          </p>
          
          <h3>Article 6 - Réclamations</h3>
          <p>
            Pour toute réclamation, contactez-nous :<br />
            Email : <a href="mailto:contact@jurabreak.fr">contact@jurabreak.fr</a><br />
            Téléphone : 06 XX XX XX XX
          </p>
          
          <p className={styles.download}>
            📄 <a href="/docs/CGV.md" download>Télécharger les CGV complètes (PDF)</a>
          </p>
        </section>
        
        {/* ========== MENTIONS LÉGALES ========== */}
        <section id="mentions" className={styles.section}>
          <h2>Mentions Légales</h2>
          
          <h3>Éditeur du Site</h3>
          <p>
            <strong>Dénomination :</strong> JuraBreak Immobilier<br />
            <strong>Forme juridique :</strong> [À compléter : SARL, SAS, etc.]<br />
            <strong>Capital social :</strong> [À compléter]<br />
            <strong>Siège social :</strong> [À compléter : adresse complète]<br />
            <strong>SIRET :</strong> [À compléter]<br />
            <strong>RCS :</strong> [À compléter]<br />
            <strong>Carte professionnelle :</strong> [À compléter : numéro carte T]<br />
            <strong>Email :</strong> contact@jurabreak.fr<br />
            <strong>Téléphone :</strong> 06 XX XX XX XX
          </p>
          
          <h3>Hébergement</h3>
          <p>
            Le site est hébergé par :<br />
            <strong>Vercel Inc.</strong><br />
            340 S Lemon Ave #4133<br />
            Walnut, CA 91789, USA
          </p>
          
          <h3>Propriété Intellectuelle</h3>
          <p>
            L'ensemble du contenu de ce site (textes, images, logos, design) est la propriété exclusive de 
            JuraBreak Immobilier. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
          </p>
        </section>
        
        {/* ========== RGPD ========== */}
        <section id="rgpd" className={styles.section}>
          <h2>Protection des Données Personnelles (RGPD)</h2>
          
          <h3>Données Collectées</h3>
          <p>
            Lors d'une demande d'estimation, nous collectons :<br />
            - Nom et prénom<br />
            - Email et téléphone<br />
            - Adresse du bien immobilier<br />
            - Caractéristiques du bien
          </p>
          
          <h3>Finalité du Traitement</h3>
          <p>
            Ces données sont utilisées exclusivement pour :<br />
            - Réaliser l'estimation demandée<br />
            - Communiquer avec vous<br />
            - Établir la facturation
          </p>
          
          <h3>Vos Droits</h3>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :<br />
            - <strong>Droit d'accès :</strong> obtenir une copie de vos données<br />
            - <strong>Droit de rectification :</strong> corriger des données inexactes<br />
            - <strong>Droit à l'effacement :</strong> demander la suppression de vos données<br />
            - <strong>Droit d'opposition :</strong> vous opposer au traitement<br />
            - <strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré
          </p>
          <p>
            Pour exercer ces droits, contactez : <a href="mailto:contact@jurabreak.fr">contact@jurabreak.fr</a>
          </p>
          
          <h3>Conservation des Données</h3>
          <p>
            Vos données sont conservées pendant la durée de la prestation et 3 ans à des fins de preuve 
            et de conformité légale.
          </p>
          
          <h3>Sécurité</h3>
          <p>
            Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour 
            protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
          </p>
        </section>
        
        <div className={styles.footer}>
          <p>Pour toute question concernant ces mentions légales, contactez-nous à <a href="mailto:contact@jurabreak.fr">contact@jurabreak.fr</a></p>
        </div>
      </div>
    </div>
  )
}
