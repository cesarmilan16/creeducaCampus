import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/user-profile'

export default async function DashboardIndexPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { profile, error } = await ensureUserProfile({ user })

  if (error || !profile) {
    redirect('/login')
  }

  redirect(`/dashboard/${profile.rol}`)
}
