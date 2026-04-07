import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { Clase, Material } from '@/types'
import ListaMateriales from './_components/lista-materiales'
import ClaseHeader from './_components/clase-header'

export default async function ClaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [claseRes, materialesRes] = await Promise.all([
    supabase
      .from('clases')
      .select('*')
      .eq('id', id)
      .eq('profesor_id', user!.id)
      .single<Clase>(),
    supabase
      .from('materiales')
      .select('*')
      .eq('clase_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (claseRes.error || !claseRes.data) notFound()

  const clase = claseRes.data
  const materiales = (materialesRes.data as Material[]) ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Volver */}
      <Link
        href="/dashboard/profesor/clases"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3557] transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Mis Clases
      </Link>

      {/* Cabecera */}
      <ClaseHeader clase={clase} />

      {/* Horario */}
      {clase.horario && clase.horario.length > 0 && (
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-[#1B3557]">Horario</h2>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-[#1B3557]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {clase.horario.map((slot, i) => (
              <span
                key={i}
                className="rounded-full bg-[#EBF0F7] px-4 py-1.5 text-sm font-medium text-[#1B3557]"
              >
                {slot.dia} {slot.hora_inicio}–{slot.hora_fin}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Materiales */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-[#1B3557]">Materiales</h2>
          <div className="mt-1 h-0.5 w-8 rounded-full bg-amber-400" />
        </div>
        <ListaMateriales materiales={materiales} claseId={clase.id} />
      </div>
    </div>
  )
}
