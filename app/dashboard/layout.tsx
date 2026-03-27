import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/user-profile'
import Sidebar from './_components/sidebar'
import { marcarMensajeLeidoAction } from './actions'

type MensajeNotif = {
  id: string
  asunto: string | null
  cuerpo: string
  created_at: string
  remitente: string
}

type ComunicadoNotif = {
  id: string
  titulo: string
  created_at: string
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { profile, error: profileError } = await ensureUserProfile({ user })

  if (profileError || !profile) {
    redirect('/login')
  }

  const [{ count: mensajesNoLeidos }, { data: mensajesNotifRaw }] = await Promise.all([
    supabase
      .from('mensajes')
      .select('id', { count: 'exact', head: true })
      .eq('para_usuario', user.id)
      .eq('leido', false),
    supabase
      .from('mensajes')
      .select('id, asunto, cuerpo, created_at, usuarios!mensajes_de_usuario_fkey(nombre)')
      .eq('para_usuario', user.id)
      .eq('leido', false)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const mensajesNotif: MensajeNotif[] = (mensajesNotifRaw ?? []).map((m) => ({
    id: m.id,
    asunto: m.asunto,
    cuerpo: m.cuerpo,
    created_at: m.created_at,
    remitente: (m as unknown as { usuarios: { nombre: string }[] | null }).usuarios?.[0]?.nombre ?? 'Desconocido',
  }))

  let comunicadosNotif: ComunicadoNotif[] = []
  if (profile.rol === 'alumno') {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { data } = await supabase
      .from('comunicados')
      .select('id, titulo, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)
    comunicadosNotif = (data as ComunicadoNotif[]) ?? []
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        usuario={profile}
        mensajesNoLeidos={mensajesNoLeidos ?? 0}
        mensajesNotif={mensajesNotif}
        comunicadosNotif={comunicadosNotif}
        marcarLeidoAction={marcarMensajeLeidoAction}
      />
      <main className="flex-1 overflow-auto p-6 bg-[#F2EDE7]">{children}</main>
    </div>
  )
}
