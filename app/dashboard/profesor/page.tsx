import { createSupabaseServerClient } from '@/lib/supabase'
import Link from 'next/link'

function ComunicadoIcon({ titulo }: { titulo: string }) {
  const t = titulo.toLowerCase()
  if (t.includes('horario') || t.includes('calendario'))
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  if (t.includes('examen') || t.includes('recuperac') || t.includes('prueba') || t.includes('test'))
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  if (t.includes('concurso') || t.includes('premio') || t.includes('ganador') || t.includes('trofeo'))
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8m-4-4v4M7 4H4a1 1 0 00-1 1v3a4 4 0 004 4h.5M17 4h3a1 1 0 011 1v3a4 4 0 01-4 4h-.5M7 4h10v6a5 5 0 01-10 0V4z" />
      </svg>
    )
  if (t.includes('reunión') || t.includes('reunion') || t.includes('familia') || t.includes('padres'))
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    )
  if (t.includes('material') || t.includes('recurso') || t.includes('document') || t.includes('libro'))
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  if (t.includes('entrega') || t.includes('redacc') || t.includes('tarea') || t.includes('trabajo'))
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    )
  if (t.includes('bienvenid') || t.includes('inicio') || t.includes('trimestre') || t.includes('curso'))
    return (
      <svg className="h-4 w-4 flex-shrink-0 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  return (
    <svg className="h-4 w-4 flex-shrink-0 text-[#1B3557] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  )
}

export default async function ProfesorDashboard() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [perfil, clasesRes, mensajesRes, comunicadosRes] = await Promise.all([
    supabase.from('usuarios').select('nombre').eq('id', user!.id).single(),
    supabase.from('clases').select('id, nombre').eq('profesor_id', user!.id),
    supabase
      .from('mensajes')
      .select('id', { count: 'exact', head: true })
      .eq('para_usuario', user!.id)
      .eq('leido', false),
    supabase
      .from('comunicados')
      .select('id, titulo, created_at')
      .eq('autor_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const clases = clasesRes.data ?? []
  const mensajesNoLeidos = mensajesRes.count ?? 0
  const comunicados = comunicadosRes.data ?? []

  const nombre = perfil.data?.nombre?.split(' ')[0] ?? 'Profesor'
  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B3557]">
          Hola, {nombre}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 capitalize">{fecha}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/dashboard/profesor/clases" className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm hover:border-[#1B3557]/30 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Clases activas</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF0F7]">
              <svg className="h-5 w-5 text-[#1B3557]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#1B3557]">{clases.length}</p>
        </Link>

        <Link href="/dashboard/profesor/mensajes" className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Mensajes sin leer</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-red-500">{mensajesNoLeidos}</p>
        </Link>

        <Link href="/dashboard/profesor/comunicados" className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm hover:border-amber-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Comunicados publicados</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-500">{comunicados.length}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Últimos comunicados */}
        {comunicados.length > 0 && (
          <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#1B3557]">Últimos comunicados</h2>
              <Link href="/dashboard/profesor/comunicados" className="text-xs text-gray-400 hover:text-[#1B3557] transition-colors">
                Ver todos →
              </Link>
            </div>
            <ul className="space-y-2">
              {comunicados.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/profesor/comunicados/${c.id}`}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 hover:bg-[#EBF0F7] transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <ComunicadoIcon titulo={c.titulo} />
                      <span className="text-sm text-[#1B3557] truncate">{c.titulo}</span>
                    </span>
                    <span className="flex-shrink-0 text-xs text-gray-400 pl-2">
                      {new Date(c.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mis clases */}
        {clases.length > 0 && (
          <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#1B3557]">Mis clases</h2>
            <div className="flex flex-wrap gap-2">
              {clases.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/profesor/clases/${c.id}`}
                  className="rounded-xl bg-[#EBF0F7] px-3 py-1.5 text-sm font-medium text-[#1B3557] hover:bg-[#d6e2f0] transition-colors"
                >
                  {c.nombre}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
