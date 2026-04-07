'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Material } from '@/types'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import {
  agregarMaterialAction,
  editarMaterialAction,
  eliminarMaterialAction,
} from '@/app/dashboard/profesor/clases/[id]/actions'

// ── Schema para enlace externo ──────────────────────────────────────────────
const schemaEnlace = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  tipo: z.enum(['enlace', 'video', 'documento', 'otro']),
  url: z.string().refine((v) => { try { new URL(v); return true } catch { return false } }, 'Introduce una URL válida'),
})
type FormEnlace = z.infer<typeof schemaEnlace>

// ── Helpers ─────────────────────────────────────────────────────────────────
function tipoDesdeArchivo(file: File): 'video' | 'documento' | 'otro' {
  if (file.type.startsWith('video/')) return 'video'
  if (
    file.type === 'application/pdf' ||
    file.type.includes('word') ||
    file.type.includes('powerpoint') ||
    file.type.includes('presentation')
  )
    return 'documento'
  return 'otro'
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Iconos ───────────────────────────────────────────────────────────────────
function TipoIcon({ tipo }: { tipo: string | null }) {
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

// ── Subformulario: subir archivo ─────────────────────────────────────────────
function FormArchivo({
  claseId,
  onSuccess,
  onCancel,
}: {
  claseId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [progreso, setProgreso] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setArchivo(f)
    if (f && !nombre) {
      // Auto-rellenar nombre sin extensión
      setNombre(f.name.replace(/\.[^/.]+$/, ''))
    }
    setError(null)
  }

  async function handleSubir() {
    if (!archivo) { setError('Selecciona un archivo'); return }
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }

    setSubiendo(true)
    setError(null)
    setProgreso(0)

    const supabase = createSupabaseBrowserClient()
    const ext = archivo.name.split('.').pop()
    const path = `${claseId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materiales')
      .upload(path, archivo, { upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setSubiendo(false)
      setProgreso(null)
      return
    }

    setProgreso(100)

    const { data: urlData } = supabase.storage
      .from('materiales')
      .getPublicUrl(uploadData.path)

    const result = await agregarMaterialAction({
      clase_id: claseId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      tipo: tipoDesdeArchivo(archivo),
      url: urlData.publicUrl,
    })

    if ('error' in result) {
      // Borrar el archivo si falla el registro
      await supabase.storage.from('materiales').remove([path])
      setError(result.error)
      setSubiendo(false)
      setProgreso(null)
      return
    }

    onSuccess()
  }

  return (
    <div className="rounded-2xl border border-[#E5E0D9] bg-[#F2EDE7] p-4 space-y-3">
      {/* Zona de selección de archivo */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E0D9] bg-white px-4 py-6 text-center transition-colors hover:border-[#1B3557]/30 hover:bg-[#EBF0F7]"
      >
        <svg className="mb-2 h-8 w-8 text-[#1B3557]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {archivo ? (
          <div>
            <p className="text-sm font-medium text-[#1B3557]">{archivo.name}</p>
            <p className="text-xs text-gray-400">{formatBytes(archivo.size)}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-[#1B3557]">Pulsa para seleccionar</p>
            <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, PPT, MP4 — máx. 50 MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.mov,.webm"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Nombre */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Apuntes Tema 3"
          className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
        />
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Descripción</label>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Opcional"
          className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
        />
      </div>

      {/* Barra de progreso */}
      {progreso !== null && (
        <div className="h-1.5 w-full rounded-full bg-[#E5E0D9] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1B3557] transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubir}
          disabled={subiendo}
          className="rounded-xl bg-[#1B3557] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#152840] disabled:opacity-50 transition-colors"
        >
          {subiendo ? 'Subiendo...' : 'Subir archivo'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={subiendo}
          className="rounded-xl border border-[#E5E0D9] px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Subformulario: enlace externo ────────────────────────────────────────────
function FormEnlaceExterno({
  claseId,
  onSuccess,
  onCancel,
}: {
  claseId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormEnlace>({
    resolver: zodResolver(schemaEnlace),
    defaultValues: { tipo: 'enlace' },
  })

  async function onSubmit(values: FormEnlace) {
    setServerError(null)
    const result = await agregarMaterialAction({ ...values, clase_id: claseId })
    if ('error' in result) {
      setServerError(result.error)
    } else {
      reset()
      onSuccess()
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-[#E5E0D9] bg-[#F2EDE7] p-4 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Nombre *</label>
          <input
            type="text"
            {...register('nombre')}
            className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
          />
          {errors.nombre && <p className="text-xs text-red-600">{errors.nombre.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Tipo</label>
          <select
            {...register('tipo')}
            className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
          >
            <option value="enlace">Enlace</option>
            <option value="video">Vídeo (YouTube…)</option>
            <option value="documento">Documento</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">URL *</label>
        <input
          type="url"
          placeholder="https://..."
          {...register('url')}
          className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
        />
        {errors.url && <p className="text-xs text-red-600">{errors.url.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Descripción</label>
        <input
          type="text"
          {...register('descripcion')}
          className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
        />
      </div>

      {serverError && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{serverError}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#1B3557] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#152840] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Añadiendo...' : 'Añadir enlace'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-[#E5E0D9] px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ── Formulario inline de edición ─────────────────────────────────────────────
function FormEditarMaterial({
  material,
  claseId,
  onSuccess,
  onCancel,
}: {
  material: Material
  claseId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nombre, setNombre] = useState(material.nombre)
  const [descripcion, setDescripcion] = useState(material.descripcion ?? '')
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGuardar() {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    setGuardando(true)
    setError(null)

    let nuevaUrl = material.url

    // Si hay archivo nuevo, subirlo y borrar el antiguo
    if (nuevoArchivo) {
      const supabase = createSupabaseBrowserClient()
      const ext = nuevoArchivo.name.split('.').pop()
      const path = `${claseId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materiales')
        .upload(path, nuevoArchivo, { upsert: false })

      if (uploadError) {
        setError(uploadError.message)
        setGuardando(false)
        return
      }

      // Borrar archivo antiguo si era de storage
      const marker = '/storage/v1/object/public/materiales/'
      if (material.url.includes(marker)) {
        const oldPath = material.url.slice(material.url.indexOf(marker) + marker.length)
        await supabase.storage.from('materiales').remove([oldPath])
      }

      nuevaUrl = supabase.storage.from('materiales').getPublicUrl(uploadData.path).data.publicUrl
    }

    const result = await editarMaterialAction(material.id, {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      url: nuevaUrl,
    })

    setGuardando(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-[#E5E0D9] bg-[#F2EDE7] p-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-1 flex-col gap-1 min-w-40">
          <label className="text-xs font-medium text-gray-700">Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 min-w-40">
          <label className="text-xs font-medium text-gray-700">Descripción</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Opcional"
            className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
          />
        </div>
      </div>

      {/* Reemplazar archivo */}
      <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Reemplazar archivo</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-xs text-[#1B3557] hover:bg-[#EBF0F7] transition-colors"
            >
              Seleccionar archivo
            </button>
            {nuevoArchivo && (
              <span className="text-xs text-gray-500 truncate max-w-48">
                {nuevoArchivo.name} ({formatBytes(nuevoArchivo.size)})
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.mov,.webm"
              onChange={(e) => setNuevoArchivo(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>
        </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="rounded-xl bg-[#1B3557] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#152840] disabled:opacity-50 transition-colors"
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-[#E5E0D9] px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
type Modo = 'archivo' | 'enlace' | null

export default function ListaMateriales({
  materiales,
  claseId,
}: {
  materiales: Material[]
  claseId: string
}) {
  const router = useRouter()
  const [modo, setModo] = useState<Modo>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  function handleSuccess() {
    setModo(null)
    router.refresh()
  }

  function handleEditSuccess() {
    setEditandoId(null)
    router.refresh()
  }

  async function handleEliminar(id: string) {
    const result = await eliminarMaterialAction(id)
    if ('error' in result) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#1B3557]">Materiales</h2>
        {modo === null && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModo('archivo')}
              className="rounded-xl bg-[#1B3557] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#152840] transition-colors"
            >
              + Subir archivo
            </button>
            <button
              onClick={() => setModo('enlace')}
              className="rounded-xl border border-[#E5E0D9] px-3 py-1.5 text-xs font-medium text-[#1B3557] hover:bg-[#EBF0F7] transition-colors"
            >
              + Enlace externo
            </button>
          </div>
        )}
      </div>

      {modo === 'archivo' && (
        <FormArchivo
          claseId={claseId}
          onSuccess={handleSuccess}
          onCancel={() => setModo(null)}
        />
      )}

      {modo === 'enlace' && (
        <FormEnlaceExterno
          claseId={claseId}
          onSuccess={handleSuccess}
          onCancel={() => setModo(null)}
        />
      )}

      {materiales.length === 0 && modo === null && (
        <p className="text-sm text-gray-400">Sin materiales aún.</p>
      )}

      <ul className="space-y-2">
        {materiales.map((m) => {
          const esDescargable = m.tipo === 'documento' || /\.(pdf|doc|docx|ppt|pptx)$/i.test(m.url)
          return (
            <li key={m.id}>
              <div className="flex items-center justify-between rounded-xl border border-[#E5E0D9] bg-white px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0">
                    <TipoIcon tipo={m.tipo} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.nombre}</p>
                    {m.descripcion && (
                      <p className="text-xs text-gray-400 truncate">{m.descripcion}</p>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                  {m.tipo !== 'video' && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={esDescargable ? m.nombre : undefined}
                      title={esDescargable ? 'Descargar' : 'Abrir'}
                      className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 hover:text-[#1B3557] transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => setEditandoId(editandoId === m.id ? null : m.id)}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-[#1B3557] hover:bg-[#EBF0F7] transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(m.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {editandoId === m.id && (
                <FormEditarMaterial
                  material={m}
                  claseId={claseId}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setEditandoId(null)}
                />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
