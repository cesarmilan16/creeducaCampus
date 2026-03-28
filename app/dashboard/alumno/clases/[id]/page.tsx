import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { Material, Nota } from '@/types'

function MaterialIcon({ tipo }: { tipo: string | null }) {
  if (tipo === 'video')
    return (
      <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 9l6 3-6 3V9z" />
      </svg>
    )
  if (tipo === 'enlace')
    return (
      <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    )
  if (tipo === 'documento')
    return (
      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function getNotaColor(valor: number | null) {
  if (!valor) return 'text-gray-500 bg-gray-50 border-gray-200'
  if (valor >= 9) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (valor >= 7) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (valor >= 5) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

function getNotaBorderColor(valor: number | null) {
  if (!valor) return 'border-l-gray-300'
  if (valor >= 9) return 'border-l-emerald-400'
  if (valor >= 7) return 'border-l-blue-400'
  if (valor >= 5) return 'border-l-amber-400'
  return 'border-l-red-400'
}

export default async function ClaseAlumnoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [claseRes, materialesRes, notasRes] = await Promise.all([
    supabase
      .from('clases')
      .select('*, usuarios!clases_profesor_id_fkey(nombre)')
      .eq('id', id)
      .single(),
    supabase
      .from('materiales')
      .select('*')
      .eq('clase_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('notas')
      .select('*')
      .eq('clase_id', id)
      .eq('alumno_id', user!.id),
  ])

  if (claseRes.error || !claseRes.data) notFound()

  const clase = claseRes.data as {
    id: string
    nombre: string
    descripcion: string | null
    horario: { dia: string; hora_inicio: string; hora_fin: string }[] | null
    usuarios: { nombre: string } | null
  }
  const materiales = (materialesRes.data as Material[]) ?? []
  const notas = (notasRes.data as Nota[]) ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Botón volver */}
      <Link
        href="/dashboard/alumno/clases"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3557] transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Volver
      </Link>

      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B3557]">{clase.nombre}</h1>
        {clase.descripcion && (
          <p className="mt-1.5 text-gray-500">{clase.descripcion}</p>
        )}
        {clase.usuarios?.nombre && (
          <p className="mt-1 text-sm text-gray-400">
            Profesor: <span className="font-medium text-gray-600">{clase.usuarios.nombre}</span>
          </p>
        )}
      </div>

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
        {materiales.length === 0 ? (
          <p className="text-sm text-gray-400">Sin materiales disponibles.</p>
        ) : (
          <ul className="space-y-2">
            {materiales.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-[#E5E0D9] bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0">
                    <MaterialIcon tipo={m.tipo} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.nombre}</p>
                    {m.descripcion && (
                      <p className="text-xs text-gray-400 truncate">{m.descripcion}</p>
                    )}
                  </div>
                </div>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  Abrir
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mis notas */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-[#1B3557]">Mis notas</h2>
          <div className="mt-1 h-0.5 w-8 rounded-full bg-emerald-400" />
        </div>
        {notas.length === 0 ? (
          <p className="text-sm text-gray-400">Sin notas registradas aún.</p>
        ) : (
          <ul className="space-y-2">
            {notas.map((n) => (
              <li
                key={n.id}
                className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-3 border-l-4 ${getNotaBorderColor(n.valor)}`}
              >
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${getNotaColor(n.valor)}`}>
                  {n.valor ?? '—'}
                </span>
                <span className="text-sm text-gray-600">
                  {n.comentario ?? 'Sin comentario'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
