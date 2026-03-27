'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import type { Clase } from '@/types'

export async function crearClaseAction(formData: {
  nombre: string
  descripcion?: string
}): Promise<{ error: string } | { clase: Clase }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('clases')
    .insert({
      nombre: formData.nombre,
      descripcion: formData.descripcion ?? null,
      profesor_id: user.id,
      horario: [],
    })
    .select()
    .single<Clase>()

  if (error) return { error: error.message }
  return { clase: data }
}
