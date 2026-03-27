import { createSupabaseServerClient } from '@/lib/supabase'
import type { Tarea, Entrega } from '@/types'
import { notFound } from 'next/navigation'
import EntregasPanel from './_components/entregas-panel'
import { calificarEntregaAction } from '@/app/dashboard/profesor/ejercicios/actions'

type TareaConClase = Tarea & { clases: { nombre: string } | null }
type EntregaConAlumno = Entrega & { usuarios: { nombre: string } | null }

interface PageProps {
  params: Promise<{ tareaId: string }>
}

export default async function DetalleTareaPage({ params }: PageProps) {
  const { tareaId } = await params
  const supabase = await createSupabaseServerClient()

  const [tareaRes, entregasRes] = await Promise.all([
    supabase
      .from('tareas')
      .select('*, clases(nombre)')
      .eq('id', tareaId)
      .single<TareaConClase>(),
    supabase
      .from('entregas')
      .select('*, usuarios(nombre)')
      .eq('tarea_id', tareaId)
      .order('created_at', { ascending: true }),
  ])

  if (tareaRes.error || !tareaRes.data) {
    notFound()
  }

  const tarea = tareaRes.data
  const entregas = (entregasRes.data ?? []) as EntregaConAlumno[]

  return (
    <div className="space-y-6">
      <EntregasPanel
        tarea={tarea}
        entregas={entregas}
        calificarEntregaAction={calificarEntregaAction}
      />
    </div>
  )
}
