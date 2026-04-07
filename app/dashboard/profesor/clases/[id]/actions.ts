'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import type { Clase, HorarioSlot, Material } from '@/types'

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

export async function editarMaterialAction(
  id: string,
  formData: { nombre: string; descripcion?: string; url?: string }
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('materiales')
    .update({
      nombre: formData.nombre,
      descripcion: formData.descripcion ?? null,
      ...(formData.url ? { url: formData.url } : {}),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function eliminarMaterialAction(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()

  // Obtener la URL antes de borrar para eliminar del storage si procede
  const { data: material } = await supabase
    .from('materiales')
    .select('url')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('materiales').delete().eq('id', id)
  if (error) return { error: error.message }

  // Si la URL es de Supabase Storage, eliminar el archivo
  if (material?.url) {
    const storageMarker = '/storage/v1/object/public/materiales/'
    const idx = material.url.indexOf(storageMarker)
    if (idx !== -1) {
      const storagePath = material.url.slice(idx + storageMarker.length)
      await supabase.storage.from('materiales').remove([storagePath])
    }
  }

  return { success: true }
}
