import { requireAdmin, AccessDenied, ConfigMissing } from '@/lib/auth/requireAdmin'

export default async function AdminLayout({ children }) {
  // IMPORTANT: Ne PAS mettre requireAdmin() dans un try-catch
  // car redirect() lance une exception qui doit être propagée
  
  let adminCheck
  try {
    adminCheck = await requireAdmin()
  } catch (error) {
    // Gérer uniquement les erreurs spécifiques (pas NEXT_REDIRECT)
    if (error.message === 'CONFIG_MISSING') {
      return <ConfigMissing />
    }
    if (error.message === 'UNAUTHORIZED') {
      return <AccessDenied />
    }
    // Pour toute autre erreur, la relancer (incluant NEXT_REDIRECT)
    throw error
  }

  const { user, devBypass, email } = adminCheck

  return (
    <div>
      {devBypass && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fef3c7',
          color: '#92400e',
          padding: '0.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          zIndex: 9999,
          borderBottom: '2px solid #f59e0b'
        }}>
          ⚠️ DEV ADMIN BYPASS ACTIF - Mode développement uniquement
        </div>
      )}
      <div style={devBypass ? { marginTop: '2.5rem' } : {}}>
        {children}
      </div>
    </div>
  )
}
