'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import type { Comunicado } from '@/types'

export async function crearComunicadoAction(formData: {
  titulo: string
  cuerpo: string
  clase_id?: string
}): Promise<{ error: string } | { comunicado: Comunicado }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('comunicados')
    .insert({
      titulo: formData.titulo,
      cuerpo: formData.cuerpo,
      clase_id: formData.clase_id || null,
      autor_id: user.id,
    })
    .select()
    .single<Comunicado>()

  if (error) return { error: error.message }
  return { comunicado: data }
}

export async function eliminarComunicadoAction(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('comunicados').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
