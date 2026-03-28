import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'

export default async function ComunicadoProfesorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('comunicados')
    .select('id, titulo, cuerpo, created_at, clase_id, clases(nombre)')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const comunicado = data as {
    id: string
    titulo: string
    cuerpo: string
    created_at: string
    clase_id: string | null
    clases: { nombre: string } | { nombre: string }[] | null
  }

  const clase = Array.isArray(comunicado.clases) ? comunicado.clases[0] : comunicado.clases

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/profesor/comunicados"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3557] transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Volver
      </Link>

      <div className="rounded-2xl border border-[#E5E0D9] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-[#1B3557]">{comunicado.titulo}</h1>
          <span className={`flex-shrink-0 rounded-lg px-2.5 py-0.5 text-xs font-medium ${clase ? 'bg-[#EBF0F7] text-[#1B3557]' : 'bg-amber-50 text-amber-700'}`}>
            {clase?.nombre ?? 'Global'}
          </span>
        </div>

        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comunicado.cuerpo}</p>

        <div className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
          {new Date(comunicado.created_at).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>
  )
}
