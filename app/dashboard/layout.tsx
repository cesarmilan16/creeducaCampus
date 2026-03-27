import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/user-profile'
import Sidebar from './_components/sidebar'

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

  const { count: mensajesNoLeidos } = await supabase
    .from('mensajes')
    .select('id', { count: 'exact', head: true })
    .eq('para_usuario', user.id)
    .eq('leido', false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar usuario={profile} mensajesNoLeidos={mensajesNoLeidos ?? 0} />
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
