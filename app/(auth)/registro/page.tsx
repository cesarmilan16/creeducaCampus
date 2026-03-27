import Link from 'next/link'
import RegistroForm from './_components/registro-form'

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Crear Cuenta
        </h1>

        <RegistroForm />

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
