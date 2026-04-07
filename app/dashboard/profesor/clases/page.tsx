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
      <div>
        <h1 className="text-2xl font-bold text-[#1B3557]">Mis Clases</h1>
        <p className="mt-0.5 text-sm text-gray-500">Clases que impartes</p>
      </div>
      <ListaClases clases={(clases as Clase[]) ?? []} />
    </div>
  )
}
