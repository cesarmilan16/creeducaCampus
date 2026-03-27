'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/user-profile'

export async function loginAction(formData: {
  email: string
  password: string
}): Promise<{ error: string } | { redirectTo: string }> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No se pudo obtener el usuario tras el inicio de sesión.' }
  }

  const { profile, error: profileError } = await ensureUserProfile({ user })

  if (profileError || !profile) {
    return { error: profileError ?? 'No se pudo cargar el perfil del usuario.' }
  }

  return { redirectTo: `/dashboard/${profile.rol}` }
}
