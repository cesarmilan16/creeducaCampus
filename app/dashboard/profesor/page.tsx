import { createSupabaseServerClient } from '@/lib/supabase'
import Link from 'next/link'

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
        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Clases activas</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF0F7]">
              <svg className="h-5 w-5 text-[#1B3557]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#1B3557]">{clases.length}</p>
        </div>

        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Mensajes sin leer</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-red-500">{mensajesNoLeidos}</p>
        </div>

        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Comunicados publicados</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-500">{comunicados.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Últimos comunicados */}
        {comunicados.length > 0 && (
          <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#1B3557]">Últimos comunicados</h2>
            <ul className="space-y-2">
              {comunicados.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                >
                  <span className="text-sm text-[#1B3557] truncate pr-2">{c.titulo}</span>
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('es-ES')}
                  </span>
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
