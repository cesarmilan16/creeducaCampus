import { createSupabaseServerClient } from '@/lib/supabase'
import type { Clase } from '@/types'
import ListaClases from './_components/lista-clases'

export default async function ClasesProfesorPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: clases } = await supabase
    .from('clases')
    .select('*')
    .eq('profesor_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
      <ListaClases clases={(clases as Clase[]) ?? []} />
    </div>
  )
}
