import { createSupabaseServerClient } from '@/lib/supabase'
import type { Tarea, Entrega } from '@/types'
import EjerciciosAlumnoPanel from './_components/ejercicios-alumno-panel'
import { entregarTareaAction } from './actions'

type TareaRow = Tarea & {
  clases: { nombre: string } | null
}

type TareaConEntrega = TareaRow & {
  entrega: Entrega | null
}

export default async function EjerciciosAlumnoPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: matriculas } = await supabase
    .from('matriculas')
    .select('clase_id')
    .eq('alumno_id', user!.id)

  if (!matriculas || matriculas.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3557]">Ejercicios</h1>
          <p className="mt-0.5 text-sm text-gray-500">Tareas y entregas de tus clases</p>
        </div>
        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No estás matriculado en ninguna clase todavía.
          </p>
        </div>
      </div>
    )
  }

  const claseIds = matriculas.map((m) => m.clase_id)

  const { data: tareasData } = await supabase
    .from('tareas')
    .select('*, clases(nombre)')
    .in('clase_id', claseIds)
    .order('fecha_entrega', { ascending: true })

  const tareas = (tareasData as TareaRow[] | null) ?? []
  const tareaIds = tareas.map((t) => t.id)

  const { data: entregasData } = tareaIds.length > 0
    ? await supabase
        .from('entregas')
        .select('*')
        .eq('alumno_id', user!.id)
        .in('tarea_id', tareaIds)
    : { data: [] }

  const entregas = (entregasData as Entrega[] | null) ?? []
  const entregasByTareaId = new Map<string, Entrega>(
    entregas.map((e) => [e.tarea_id, e])
  )

  const tareasConEntrega: TareaConEntrega[] = tareas.map((tarea) => ({
    ...tarea,
    clases: Array.isArray(tarea.clases)
      ? ((tarea.clases[0] as { nombre: string } | undefined) ?? null)
      : tarea.clases,
    entrega: entregasByTareaId.get(tarea.id) ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3557]">Ejercicios</h1>
        <p className="mt-0.5 text-sm text-gray-500">Tareas y entregas de tus clases</p>
      </div>
      <EjerciciosAlumnoPanel
        tareas={tareasConEntrega}
        entregarAction={entregarTareaAction}
      />
    </div>
  )
}
