import { getUserServer } from '@/lib/supabase/user'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getUserServer()
  
  if (!user) {
    redirect('/login')
  }

  // Redirect based on role
  const role = user.user_metadata?.role || user.app_metadata?.role
  
  if (role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/dashboard')
  }
}
