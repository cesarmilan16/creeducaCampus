'use server'

import { createSupabaseServerClient } from '@/lib/supabase'

export async function enviarMensajeAction(formData: {
  para_usuario: string
  asunto?: string
  cuerpo: string
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('mensajes').insert({
    de_usuario: user.id,
    para_usuario: formData.para_usuario,
    asunto: formData.asunto ?? null,
    cuerpo: formData.cuerpo,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function marcarLeidoAction(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('mensajes')
    .update({ leido: true })
    .eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
