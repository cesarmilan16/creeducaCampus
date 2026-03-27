import { createSupabaseServerClient } from '@/lib/supabase'
import type { Mensaje, Usuario } from '@/types'
import BandejaMensajes from '@/components/shared/bandeja-mensajes'
import { enviarMensajeAction, marcarLeidoAction } from './actions'

type MensajeConUsuario = Mensaje & {
  otros_usuarios: { nombre: string } | null
}

export default async function MensajesProfesorPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [recibidosRes, enviadosRes, usuariosRes] = await Promise.all([
    supabase
      .from('mensajes')
      .select('*, usuarios!mensajes_de_usuario_fkey(nombre)')
      .eq('para_usuario', user!.id)
      .order('leido', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('mensajes')
      .select('*, usuarios!mensajes_para_usuario_fkey(nombre)')
      .eq('de_usuario', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('usuarios')
      .select('id, nombre')
      .neq('id', user!.id),
  ])

  // Normalizar el campo de join a `otros_usuarios`
  const recibidos: MensajeConUsuario[] = (recibidosRes.data ?? []).map((m) => ({
    ...m,
    otros_usuarios: (m as { usuarios: { nombre: string } | null }).usuarios,
  }))
  const enviados: MensajeConUsuario[] = (enviadosRes.data ?? []).map((m) => ({
    ...m,
    otros_usuarios: (m as { usuarios: { nombre: string } | null }).usuarios,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
      <BandejaMensajes
        recibidos={recibidos}
        enviados={enviados}
        usuarios={(usuariosRes.data as Pick<Usuario, 'id' | 'nombre'>[]) ?? []}
        enviarAction={enviarMensajeAction}
        marcarLeidoAction={marcarLeidoAction}
      />
    </div>
  )
}
