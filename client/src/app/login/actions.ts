'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function handleLogin(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !user) {
    redirect('/login') // fallback
  }

  const role = user.user_metadata?.role || 'user'
  redirect(role === 'admin' ? '/admin/dashboard' : '/dashboard')
}
