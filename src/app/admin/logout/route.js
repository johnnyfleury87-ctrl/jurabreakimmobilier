import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  
  // Déconnexion
  await supabase.auth.signOut()
  
  // Rediriger vers la page de login
  redirect('/admin/login')
}
