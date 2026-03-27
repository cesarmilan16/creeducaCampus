'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Usuario } from '@/types'
import LogoutButton from './logout-button'
import NotificationBell from './notification-bell'

type MensajeNotif = {
  id: string
  asunto: string | null
  cuerpo: string
  created_at: string
  remitente: string
}

type ComunicadoNotif = {
  id: string
  titulo: string
  created_at: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function IconHome() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function IconMessage() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function IconClipboard() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const NAV_PROFESOR: NavItem[] = [
  { label: 'Inicio', href: '/dashboard/profesor', icon: <IconHome /> },
  { label: 'Mis Clases', href: '/dashboard/profesor/clases', icon: <IconBook /> },
  { label: 'Ejercicios', href: '/dashboard/profesor/ejercicios', icon: <IconClipboard /> },
  { label: 'Comunicados', href: '/dashboard/profesor/comunicados', icon: <IconMail /> },
  { label: 'Mensajes', href: '/dashboard/profesor/mensajes', icon: <IconMessage /> },
]

const NAV_ALUMNO: NavItem[] = [
  { label: 'Inicio', href: '/dashboard/alumno', icon: <IconHome /> },
  { label: 'Mis Clases', href: '/dashboard/alumno/clases', icon: <IconBook /> },
  { label: 'Ejercicios', href: '/dashboard/alumno/ejercicios', icon: <IconClipboard /> },
  { label: 'Comunicados', href: '/dashboard/alumno/comunicados', icon: <IconMail /> },
  { label: 'Mensajes', href: '/dashboard/alumno/mensajes', icon: <IconMessage /> },
]

interface SidebarProps {
  usuario: Usuario
  mensajesNoLeidos: number
  mensajesNotif: MensajeNotif[]
  comunicadosNotif: ComunicadoNotif[]
  marcarLeidoAction: (id: string) => Promise<void>
}

export default function Sidebar({
  usuario,
  mensajesNoLeidos,
  mensajesNotif,
  comunicadosNotif,
  marcarLeidoAction,
}: SidebarProps) {
  const pathname = usePathname()
  const navItems = usuario.rol === 'profesor' ? NAV_PROFESOR : NAV_ALUMNO

  const inicial = usuario.nombre.charAt(0).toUpperCase()
  const avatarBg = usuario.rol === 'profesor' ? 'bg-[#1B3557]' : 'bg-emerald-600'

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-[#E5E0D9] bg-white">
      {/* Logo */}
      <div className="px-5 py-5">
        <p className="text-lg font-bold tracking-tight leading-none">
          <span style={{ color: '#F59E0B' }}>C</span>
          <span style={{ color: '#EF4444' }}>R</span>
          <span style={{ color: '#3B82F6' }}>E</span>
          <span style={{ color: '#1B3557' }}> </span>
          <span style={{ color: '#F59E0B' }}>E</span>
          <span style={{ color: '#1B3557' }}>D</span>
          <span style={{ color: '#10B981' }}>U</span>
          <span style={{ color: '#3B82F6' }}>C</span>
          <span style={{ color: '#F59E0B' }}>A</span>
        </p>
        <p className="mt-0.5 text-[11px] text-gray-400">Campus educativo</p>
      </div>

      <div className="border-t border-gray-100 mx-3" />

      {/* Navegación principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/dashboard/${usuario.rol}` &&
                pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[#EBF0F7] font-medium text-[#1B3557]'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#1B3557]'
                  }`}
                >
                  <span className={isActive ? 'text-[#1B3557]' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.label === 'Mensajes' && mensajesNoLeidos > 0 && (
                    <span className="ml-auto flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {mensajesNoLeidos > 9 ? '9+' : mensajesNoLeidos}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

      </nav>

        <div className="my-2" />

        <ul className="space-y-0.5">
          <li>
            <Link
              href={`/dashboard/${usuario.rol}/configuracion`}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                pathname.startsWith(`/dashboard/${usuario.rol}/configuracion`)
                  ? 'bg-[#EBF0F7] font-medium text-[#1B3557]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#1B3557]'
              }`}
            >
              <span className={pathname.startsWith(`/dashboard/${usuario.rol}/configuracion`) ? 'text-[#1B3557]' : 'text-gray-400'}>
                <IconSettings />
              </span>
              <span>Configuración</span>
            </Link>
          </li>
        </ul>

      {/* Notificaciones + Avatar + Logout */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-2">
        {/* Campana de notificaciones */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-400">Notificaciones</span>
          <NotificationBell
            mensajes={mensajesNotif}
            comunicados={comunicadosNotif}
            rol={usuario.rol}
            marcarLeidoAction={marcarLeidoAction}
          />
        </div>

        {/* Avatar + info */}
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${avatarBg} text-sm font-bold text-white`}
          >
            {inicial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#1B3557]">{usuario.nombre}</p>
            <p className="truncate text-xs text-gray-400 capitalize">{usuario.rol}</p>
          </div>
        </div>

        {/* Logout */}
        <LogoutButton />
      </div>
    </aside>
  )
}
