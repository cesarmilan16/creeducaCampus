'use server'

import { createSupabaseServerClient } from '@/lib/supabase'

export async function entregarTareaAction(data: {
  tarea_id: string
  respuesta: string
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('entregas').upsert(
    {
      tarea_id: data.tarea_id,
      alumno_id: user.id,
      respuesta: data.respuesta,
      estado: 'entregado',
    },
    { onConflict: 'tarea_id,alumno_id' }
  )

  if (error) return { error: error.message }
  return { success: true }
}
