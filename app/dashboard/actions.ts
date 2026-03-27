'use server'

import { createSupabaseServerClient } from '@/lib/supabase'

export async function logoutAction(): Promise<{ redirectTo: string }> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  return { redirectTo: '/login' }
}
