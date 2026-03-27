import { createSupabaseServerClient } from '@/lib/supabase'

type ComunicadoRow = {
  id: string
  titulo: string
  cuerpo: string
  created_at: string
  clase_id: string | null
  clases: { nombre: string } | { nombre: string }[] | null
  usuarios: { nombre: string } | { nombre: string }[] | null
}

export default async function ComunicadosAlumnoPage() {
  const supabase = await createSupabaseServerClient()

  const { data: comunicados } = await supabase
    .from('comunicados')
    .select(
      'id, titulo, cuerpo, created_at, clase_id, clases(nombre), usuarios!comunicados_autor_id_fkey(nombre)'
    )
    .order('created_at', { ascending: false })

  const rows = ((comunicados as ComunicadoRow[] | null) ?? []).map((comunicado) => ({
    ...comunicado,
    clases: Array.isArray(comunicado.clases)
      ? (comunicado.clases[0] ?? null)
      : comunicado.clases,
    usuarios: Array.isArray(comunicado.usuarios)
      ? (comunicado.usuarios[0] ?? null)
      : comunicado.usuarios,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3557]">Comunicados</h1>
        <p className="mt-0.5 text-sm text-gray-500">Mensajes de tus profesores</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400">Sin comunicados por ahora.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[#1B3557]">{c.titulo}</h3>
                <span
                  className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                    c.clases
                      ? 'bg-[#EBF0F7] text-[#1B3557]'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {c.clases?.nombre ?? 'Global'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{c.cuerpo}</p>
              <p className="mt-3 text-xs text-gray-400">
                {c.usuarios?.nombre && (
                  <span className="font-medium text-gray-500">Por {c.usuarios.nombre} · </span>
                )}
                {new Date(c.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
