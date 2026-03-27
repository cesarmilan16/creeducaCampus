'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { logoutAction } from '@/app/dashboard/actions'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const result = await logoutAction()
    router.push(result.redirectTo)
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
    >
      {loading ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  )
}
