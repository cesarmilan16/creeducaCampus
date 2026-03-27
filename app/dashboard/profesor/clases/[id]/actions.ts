'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import type { Clase, HorarioSlot, Material, Nota } from '@/types'

export async function editarClaseAction(
  id: string,
  formData: { nombre: string; descripcion?: string; horario?: HorarioSlot[] }
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('clases')
    .update({
      nombre: formData.nombre,
      descripcion: formData.descripcion ?? null,
      horario: formData.horario ?? [],
    })
    .eq('id', id)
    .eq('profesor_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function agregarMaterialAction(formData: {
  clase_id: string
  nombre: string
  descripcion?: string
  tipo: string
  url: string
}): Promise<{ error: string } | { material: Material }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('materiales')
    .insert({
      clase_id: formData.clase_id,
      nombre: formData.nombre,
      descripcion: formData.descripcion ?? null,
      tipo: formData.tipo,
      url: formData.url,
      subido_por: user.id,
    })
    .select()
    .single<Material>()

  if (error) return { error: error.message }
  return { material: data }
}

export async function eliminarMaterialAction(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('materiales').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function upsertNotaAction(formData: {
  alumno_id: string
  clase_id: string
  valor: number
  comentario?: string
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('notas').upsert(
    {
      alumno_id: formData.alumno_id,
      clase_id: formData.clase_id,
      valor: formData.valor,
      comentario: formData.comentario ?? null,
      creado_por: user.id,
    },
    { onConflict: 'alumno_id,clase_id' }
  )

  if (error) return { error: error.message }
  return { success: true }
}
