/**
 * Configuration de l'authentification admin
 * Liste des emails autorisés à accéder au back-office
 */

export const ADMIN_EMAILS = [
  'contact@jurabreak.fr',
  'lolita@jurabreak.fr',
  // Ajoutez d'autres emails admin ici
]

/**
 * Vérifie si un email est autorisé à accéder à l'admin
 */
export function isAdminEmail(email) {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
