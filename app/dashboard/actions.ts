'use server'

import { createSupabaseServerClient } from '@/lib/supabase'

export async function logoutAction(): Promise<{ redirectTo: string }> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  return { redirectTo: '/login' }
}

export async function marcarMensajeLeidoAction(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.from('mensajes').update({ leido: true }).eq('id', id)
}

export async function actualizarPerfilAction(
  data: { nombre: string }
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('usuarios')
    .update({ nombre: data.nombre.trim() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function cambiarPasswordAction(
  data: { password: string }
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: data.password })
  if (error) return { error: error.message }
  return { success: true }
}
