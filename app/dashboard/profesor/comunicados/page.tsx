import { createSupabaseServerClient } from '@/lib/supabase'
import type { Clase, Comunicado } from '@/types'
import ComunicadosList from './_components/comunicados-list'

type ComunicadoConClase = Comunicado & { clases: { nombre: string } | null }

export default async function ComunicadosProfesorPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [comunicadosRes, clasesRes] = await Promise.all([
    supabase
      .from('comunicados')
      .select('*, clases(nombre)')
      .eq('autor_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('clases')
      .select('id, nombre')
      .eq('profesor_id', user!.id),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
      <ComunicadosList
        comunicados={(comunicadosRes.data as ComunicadoConClase[]) ?? []}
        clases={(clasesRes.data as Pick<Clase, 'id' | 'nombre'>[]) ?? []}
      />
    </div>
  )
}
