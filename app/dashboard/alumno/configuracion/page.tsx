import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { Usuario } from '@/types'
import ConfiguracionPanel from '@/components/shared/configuracion-panel'
import { actualizarPerfilAction, cambiarPasswordAction } from '@/app/dashboard/actions'

export default async function ConfiguracionAlumnoPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single<Usuario>()

  if (!usuario) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3557]">Configuración</h1>
        <p className="mt-0.5 text-sm text-gray-500">Gestiona tu perfil y seguridad</p>
      </div>
      <ConfiguracionPanel
        usuario={usuario}
        actualizarPerfilAction={actualizarPerfilAction}
        cambiarPasswordAction={cambiarPasswordAction}
      />
    </div>
  )
}
