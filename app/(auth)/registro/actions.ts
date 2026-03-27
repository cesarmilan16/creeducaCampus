'use server'

import { createSupabaseServiceClient } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/user-profile'
import type { Rol } from '@/types'

export async function registroAction(formData: {
  nombre: string
  email: string
  password: string
  rol: Rol
}): Promise<{ error: string } | { redirectTo: string }> {
  const supabase = createSupabaseServiceClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { nombre: formData.nombre, rol: formData.rol },
  })

  if (authError) {
    if (
      authError.message.toLowerCase().includes('already') ||
      authError.message.toLowerCase().includes('registered')
    ) {
      return { error: 'Ya existe un usuario registrado con ese email.' }
    }

    return { error: authError.message }
  }

  const user = authData.user

  if (!user) {
    return { error: 'No se pudo crear el usuario. Inténtalo de nuevo.' }
  }

  const { error: profileError } = await ensureUserProfile({
    user,
    nombre: formData.nombre,
    rol: formData.rol,
  })

  if (profileError) {
    return { error: profileError }
  }

  return { redirectTo: '/login?registered=true' }
}
