import type { User } from '@supabase/supabase-js'
import { createSupabaseServiceClient } from '@/lib/supabase'
import type { Rol, Usuario } from '@/types'

interface EnsureUserProfileInput {
  user: Pick<User, 'id' | 'email' | 'user_metadata'>
  nombre?: string
  rol?: Rol
}

function isRol(value: unknown): value is Rol {
  return value === 'profesor' || value === 'alumno'
}

function resolveNombre(input: EnsureUserProfileInput) {
  const metadata = input.user.user_metadata
  const nombre =
    input.nombre ??
    (typeof metadata?.nombre === 'string' ? metadata.nombre : undefined) ??
    (input.user.email ? input.user.email.split('@')[0] : undefined)

  return nombre?.trim() || 'Usuario'
}

function resolveRol(input: EnsureUserProfileInput): Rol {
  if (input.rol) return input.rol
  if (isRol(input.user.user_metadata?.rol)) return input.user.user_metadata.rol
  return 'alumno'
}

export async function ensureUserProfile(
  input: EnsureUserProfileInput
): Promise<{ profile?: Usuario; error?: string }> {
  const serviceClient = createSupabaseServiceClient()

  const { data: existingProfile, error: existingError } = await serviceClient
    .from('usuarios')
    .select('*')
    .eq('id', input.user.id)
    .maybeSingle<Usuario>()

  if (existingError) {
    return {
      error: `No se pudo comprobar el perfil del usuario: ${existingError.message}`,
    }
  }

  if (existingProfile) {
    return { profile: existingProfile }
  }

  const { data: createdProfile, error: insertError } = await serviceClient
    .from('usuarios')
    .upsert(
      {
        id: input.user.id,
        nombre: resolveNombre(input),
        email: input.user.email ?? '',
        rol: resolveRol(input),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single<Usuario>()

  if (insertError) {
    return {
      error: `No se pudo crear el perfil del usuario: ${insertError.message}`,
    }
  }

  return { profile: createdProfile }
}
