-- ============================================================
-- Migración 1: Creación de tablas — creeducaCampus
-- ============================================================

-- 1. usuarios (extiende auth.users)
CREATE TABLE public.usuarios (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      text NOT NULL,
  email       text NOT NULL,
  rol         text NOT NULL CHECK (rol IN ('profesor', 'alumno')),
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);

-- 2. clases
CREATE TABLE public.clases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text NOT NULL,
  descripcion  text,
  profesor_id  uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  horario      jsonb,   -- [{ dia: string, hora_inicio: string, hora_fin: string }]
  created_at   timestamptz DEFAULT now()
);

-- 3. matriculas
CREATE TABLE public.matriculas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id  uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  clase_id   uuid NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (alumno_id, clase_id)
);

-- 4. materiales
CREATE TABLE public.materiales (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id    uuid NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  nombre      text NOT NULL,
  descripcion text,
  tipo        text CHECK (tipo IN ('documento', 'video', 'enlace', 'otro')),
  url         text NOT NULL,
  subido_por  uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

-- 5. notas
CREATE TABLE public.notas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id   uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  clase_id    uuid NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  valor       numeric(4,2) CHECK (valor BETWEEN 0 AND 10),
  comentario  text,
  creado_por  uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

-- 6. mensajes
CREATE TABLE public.mensajes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  de_usuario   uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  para_usuario uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  asunto       text,
  cuerpo       text NOT NULL,
  leido        boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- 7. comunicados
CREATE TABLE public.comunicados (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id   uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  clase_id   uuid REFERENCES public.clases(id) ON DELETE CASCADE,  -- null = comunicado global
  titulo     text NOT NULL,
  cuerpo     text NOT NULL,
  created_at timestamptz DEFAULT now()
);
