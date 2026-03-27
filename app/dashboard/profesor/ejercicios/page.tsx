import { createSupabaseServerClient } from '@/lib/supabase'
import type { Tarea } from '@/types'
import EjerciciosProfesorPanel from './_components/ejercicios-profesor-panel'
import {
  crearTareaAction,
  eliminarTareaAction,
} from '@/app/dashboard/profesor/ejercicios/actions'

type TareaConClase = Tarea & {
  clases: { nombre: string } | null
  entregas_count: number
}

export default async function EjerciciosProfesorPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [clasesRes, tareasRes] = await Promise.all([
    supabase
      .from('clases')
      .select('id, nombre')
      .eq('profesor_id', user!.id)
      .order('nombre'),
    supabase
      .from('tareas')
      .select('*, clases!inner(nombre, profesor_id)')
      .eq('clases.profesor_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const clases = (clasesRes.data ?? []) as { id: string; nombre: string }[]
  const tareaIds = ((tareasRes.data ?? []) as Tarea[]).map((t) => t.id)

  let entregasConteo: { tarea_id: string; count: number }[] = []

  if (tareaIds.length > 0) {
    const { data: entregasData } = await supabase
      .from('entregas')
      .select('tarea_id')
      .in('tarea_id', tareaIds)

    if (entregasData) {
      const conteoMap = entregasData.reduce<Record<string, number>>(
        (acc, e) => {
          acc[e.tarea_id] = (acc[e.tarea_id] ?? 0) + 1
          return acc
        },
        {}
      )
      entregasConteo = Object.entries(conteoMap).map(([tarea_id, count]) => ({
        tarea_id,
        count,
      }))
    }
  }

  const tareas: TareaConClase[] = ((tareasRes.data ?? []) as (Tarea & { clases: { nombre: string; profesor_id: string } | null })[]).map(
    (t) => ({
      ...t,
      clases: t.clases ? { nombre: t.clases.nombre } : null,
      entregas_count:
        entregasConteo.find((e) => e.tarea_id === t.id)?.count ?? 0,
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3557]">Ejercicios</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Crea y gestiona los ejercicios de tus clases
        </p>
      </div>
      <EjerciciosProfesorPanel
        clases={clases}
        tareas={tareas}
        crearTareaAction={crearTareaAction}
        eliminarTareaAction={eliminarTareaAction}
      />
    </div>
  )
}
