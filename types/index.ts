export type Rol = 'profesor' | 'alumno'
export type TipoMaterial = 'documento' | 'video' | 'enlace' | 'otro'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  avatar_url: string | null
  created_at: string
}

export interface HorarioSlot {
  dia: string
  hora_inicio: string
  hora_fin: string
}

export interface Clase {
  id: string
  nombre: string
  descripcion: string | null
  profesor_id: string | null
  horario: HorarioSlot[] | null
  created_at: string
}

export interface Matricula {
  id: string
  alumno_id: string
  clase_id: string
  created_at: string
}

export interface Material {
  id: string
  clase_id: string
  nombre: string
  descripcion: string | null
  tipo: TipoMaterial | null
  url: string
  subido_por: string | null
  created_at: string
}

export interface Nota {
  id: string
  alumno_id: string
  clase_id: string
  valor: number | null
  comentario: string | null
  creado_por: string | null
  created_at: string
}

export interface Mensaje {
  id: string
  de_usuario: string
  para_usuario: string
  asunto: string | null
  cuerpo: string
  leido: boolean
  created_at: string
}

export interface Comunicado {
  id: string
  autor_id: string
  clase_id: string | null
  titulo: string
  cuerpo: string
  created_at: string
}

export type EstadoEntrega = 'pendiente' | 'entregado' | 'revisado'

export interface Tarea {
  id: string
  clase_id: string
  titulo: string
  descripcion: string | null
  fecha_entrega: string | null
  creado_por: string | null
  created_at: string
}

export interface Entrega {
  id: string
  tarea_id: string
  alumno_id: string
  respuesta: string | null
  estado: EstadoEntrega
  nota: number | null
  comentario_profesor: string | null
  created_at: string
}
