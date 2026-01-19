🎯 OBJECTIF GÉNÉRAL

Mettre en place un module d’estimation immobilière en ligne payant, généré instantanément, juridiquement défendable car clairement positionné comme estimation indicative et non comme expertise.

Le système doit inclure :

une vue client (parcours clair, inscription obligatoire, paiement, restitution)

une vue admin complète (paramétrage, calculs, règles légales, versioning)

une génération de PDF structurée, prête pour tout usage (divorce, succession, discussion notariale)

une traçabilité complète (inputs, version des règles, date, consentement)

🧩 ARCHITECTURE GÉNÉRALE À PRÉPARER
1) Modules principaux

Estimation (calcul + logique métier)

Auth client (obligatoire)

Paiement

Génération PDF

Admin paramétrage

Historique & audit

👤 PARCOURS CLIENT (OBLIGATOIRE)
Étape 1 – Inscription / Connexion

Compte obligatoire avant d’obtenir le résultat

Champs minimum :

Nom / prénom

Email (validation obligatoire)

Mot de passe

L’estimation est liée au compte utilisateur

Étape 2 – Choix du motif d’estimation

Motif obligatoire (impacte le wording légal et l’affichage) :

Curiosité / information

Projet de vente

Divorce / séparation

Succession

Discussion notariale

Autre (champ texte)

Étape 3 – Données du bien

Champs structurés :

Type de bien (maison, appartement, autre)

Surface habitable (m²)

Surface terrain (m²)

Commune (liste déroulante)

Code postal

Année de construction (optionnel)

État du bien :

à rénover

correct

bon

très bon / récent

Étape 4 – Options / plus-values

Checkbox ou sélecteurs :

Garage

Piscine

Terrasse / balcon

Dépendance

Vue exceptionnelle

Sous-sol

Travaux récents

Autres (admin configurable)

Étape 5 – Consentement légal obligatoire

Checkbox non contournable :

“J’ai compris que cette estimation est indicative, non opposable juridiquement, et qu’elle ne constitue pas une expertise immobilière.”

Horodatage + IP enregistrés.

Étape 6 – Paiement

Paiement avant affichage du résultat

Après paiement :

calcul

génération PDF

envoi par email

accès dans l’espace client

📐 LOGIQUE DE CALCUL DES ESTIMATIONS
1) Base
Valeur brute = surface habitable × prix_m²_de_référence

2) Prix au m²

Priorité :

Commune

Zone géographique

Valeur par défaut

3) Coefficients

Coef état du bien

Coef type de bien

Coef localisation (zone)

Ajustement terrain (par paliers, pas linéaire)

4) Plus-values / malus

Valeurs fixes ou % selon paramétrage admin

Exemple :

Piscine : + X €

Garage : + X €

Vue : + %

Nuisances : – %

5) Calcul final

Valeur centrale

Génération d’une fourchette obligatoire

6) Fourchette légale

Selon niveau de fiabilité :

Données minimales → ±20 %

Données complètes → ±10 %

Données très complètes → ±5 %

⚠️ Interdiction d’afficher un chiffre unique

⚖️ CADRE LÉGAL À RESPECTER
Positionnement

“Estimation indicative”

“Aide à la décision”

“Document préparatoire”

Interdictions

Pas “expertise”

Pas “valeur officielle”

Pas “valeur vénale certifiée”

Mentions variables selon motif

Divorce / succession :

“Ce document ne constitue pas une expertise opposable devant une juridiction.”

📄 GÉNÉRATION DU PDF (OBLIGATOIRE)
Structure du PDF

Page de couverture

Titre : Rapport d’estimation immobilière indicative

Date / heure

Identité du client

Référence unique

Contexte & motif

Motif déclaré par le client

Rappel du cadre légal

Description du bien

Données saisies

Méthodologie

Explication simple du calcul

Sources internes

Date de version des barèmes

Résultat

Fourchette basse / médiane / haute

Niveau de confiance

Limites & responsabilité

Absence de visite

Dépendance aux données déclarées

Mentions légales

Texte versionné

Numéro de version des règles

Contraintes

PDF stocké

PDF téléchargeable

PDF envoyé par email

PDF lié à la version de calcul

🛠️ VUE ADMIN (CRITIQUE)
1) Paramétrage des prix

Prix/m² par commune

Prix/m² par zone

Valeur par défaut

2) Communes & zones

Liste complète des communes du Jura

Rattachement à une zone

Activation / désactivation

3) Coefficients

État du bien

Type de bien

Terrain

Localisation

4) Options / plus-values

Valeur

Type (fixe / %)

Actif oui/non

5) Marges de fourchette

Par niveau de fiabilité

Par motif

6) Mentions légales

Par motif

Texte court / texte long

Versionning obligatoire

7) Versioning

Chaque modification crée une nouvelle version

Les anciennes estimations restent liées à leur version

8) Historique

Liste des estimations

Client

Date

Motif

Valeur

Version des règles

🔐 SÉCURITÉ & TRAÇABILITÉ

Calcul côté serveur

Aucun calcul critique côté client

Sauvegarde :

inputs

résultat

version

consentement

paiement

🚦 ÉVOLUTIVITÉ À PRÉVOIR

Ajout futur :

validation humaine

signature pro

estimation opposable

Le socle doit le permettre sans refonte

❗ CONSIGNES IMPORTANTES

Ne pas inventer de fonctionnalités

Ne pas modifier le wording légal

Ne pas simplifier la fourchette

Respect strict du positionnement “estimation indicative”