'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import type { Tarea, Entrega } from '@/types'

export async function crearTareaAction(data: {
  clase_id: string
  titulo: string
  descripcion?: string
  fecha_entrega?: string
}): Promise<{ error: string } | { tarea: Tarea }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { data: tarea, error } = await supabase
    .from('tareas')
    .insert({
      clase_id: data.clase_id,
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      fecha_entrega: data.fecha_entrega ?? null,
      creado_por: user.id,
    })
    .select()
    .single<Tarea>()

  if (error) return { error: error.message }
  return { tarea }
}

export async function eliminarTareaAction(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('tareas').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function calificarEntregaAction(data: {
  entrega_id: string
  nota: number
  comentario_profesor?: string
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('entregas')
    .update({
      nota: data.nota,
      comentario_profesor: data.comentario_profesor ?? null,
      estado: 'revisado' as const,
    })
    .eq('id', data.entrega_id)

  if (error) return { error: error.message }
  return { success: true }
}
