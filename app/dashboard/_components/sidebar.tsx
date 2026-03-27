'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Usuario } from '@/types'
import LogoutButton from './logout-button'

interface NavItem {
  label: string
  href: string
  icon: string
}

const NAV_PROFESOR: NavItem[] = [
  { label: 'Inicio', href: '/dashboard/profesor', icon: '🏠' },
  { label: 'Mis Clases', href: '/dashboard/profesor/clases', icon: '📚' },
  { label: 'Comunicados', href: '/dashboard/profesor/comunicados', icon: '📢' },
  { label: 'Mensajes', href: '/dashboard/profesor/mensajes', icon: '✉️' },
]

const NAV_ALUMNO: NavItem[] = [
  { label: 'Inicio', href: '/dashboard/alumno', icon: '🏠' },
  { label: 'Mis Clases', href: '/dashboard/alumno/clases', icon: '📚' },
  { label: 'Comunicados', href: '/dashboard/alumno/comunicados', icon: '📢' },
  { label: 'Mensajes', href: '/dashboard/alumno/mensajes', icon: '✉️' },
]

interface SidebarProps {
  usuario: Usuario
  mensajesNoLeidos: number
}

export default function Sidebar({ usuario, mensajesNoLeidos }: SidebarProps) {
  const pathname = usePathname()
  const navItems = usuario.rol === 'profesor' ? NAV_PROFESOR : NAV_ALUMNO

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo / título */}
      <div className="border-b border-gray-200 px-4 py-5">
        <p className="text-lg font-bold text-blue-600">creeducaCampus</p>
        <p className="text-xs text-gray-500 capitalize">{usuario.rol}</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/dashboard/${usuario.rol}` &&
                pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 font-semibold text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.label === 'Mensajes' && mensajesNoLeidos > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                      {mensajesNoLeidos}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-gray-200 px-3 py-3">
        <p className="truncate px-3 text-sm font-medium text-gray-800">
          {usuario.nombre}
        </p>
        <p className="truncate px-3 text-xs text-gray-400">{usuario.email}</p>
        <div className="mt-2">
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
