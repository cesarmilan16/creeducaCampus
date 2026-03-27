-- ============================================================
-- Migración 3: Constraint único en notas + política mensajería
-- ============================================================

-- Un alumno solo puede tener una nota por clase (permite upsert limpio)
ALTER TABLE public.notas
  ADD CONSTRAINT notas_alumno_clase_unique UNIQUE (alumno_id, clase_id);

-- Permite a cualquier usuario autenticado leer nombres de otros usuarios
-- (necesario para el selector de destinatarios en mensajería)
CREATE POLICY "usuarios_select_authenticated"
  ON public.usuarios
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
