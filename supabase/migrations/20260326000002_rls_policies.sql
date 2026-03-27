-- ============================================================
-- Migración 2: RLS y políticas — creeducaCampus
-- ============================================================

-- ============================================================
-- TABLA: usuarios
-- ============================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_own"
  ON public.usuarios
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "usuarios_update_own"
  ON public.usuarios
  FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- TABLA: clases
-- ============================================================
ALTER TABLE public.clases ENABLE ROW LEVEL SECURITY;

-- Profesor ve sus propias clases
CREATE POLICY "clases_select_profesor"
  ON public.clases
  FOR SELECT
  USING (profesor_id = auth.uid());

-- Alumno ve las clases en las que tiene matrícula
CREATE POLICY "clases_select_alumno"
  ON public.clases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.matriculas
      WHERE matriculas.clase_id = clases.id
        AND matriculas.alumno_id = auth.uid()
    )
  );

-- Solo usuarios con rol 'profesor' pueden crear clases
CREATE POLICY "clases_insert_profesor"
  ON public.clases
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'profesor'
    )
  );

-- Solo el profesor propietario puede actualizar
CREATE POLICY "clases_update_profesor"
  ON public.clases
  FOR UPDATE
  USING (profesor_id = auth.uid());

-- Solo el profesor propietario puede eliminar
CREATE POLICY "clases_delete_profesor"
  ON public.clases
  FOR DELETE
  USING (profesor_id = auth.uid());

-- ============================================================
-- TABLA: matriculas
-- ============================================================
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;

-- Alumno ve sus propias matrículas; profesor ve matrículas de sus clases
CREATE POLICY "matriculas_select"
  ON public.matriculas
  FOR SELECT
  USING (
    alumno_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.clases
      WHERE clases.id = matriculas.clase_id
        AND clases.profesor_id = auth.uid()
    )
  );

-- Solo el propio alumno puede matricularse
CREATE POLICY "matriculas_insert_alumno"
  ON public.matriculas
  FOR INSERT
  WITH CHECK (alumno_id = auth.uid());

-- Solo el propio alumno puede darse de baja
CREATE POLICY "matriculas_delete_alumno"
  ON public.matriculas
  FOR DELETE
  USING (alumno_id = auth.uid());

-- ============================================================
-- TABLA: materiales
-- ============================================================
ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;

-- Alumno matriculado o profesor de la clase pueden ver materiales
CREATE POLICY "materiales_select"
  ON public.materiales
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.matriculas
      WHERE matriculas.clase_id = materiales.clase_id
        AND matriculas.alumno_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.clases
      WHERE clases.id = materiales.clase_id
        AND clases.profesor_id = auth.uid()
    )
  );

-- Solo el profesor de la clase puede subir materiales
CREATE POLICY "materiales_insert_profesor"
  ON public.materiales
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clases
      WHERE clases.id = materiales.clase_id
        AND clases.profesor_id = auth.uid()
    )
  );

-- Solo el profesor de la clase puede eliminar materiales
CREATE POLICY "materiales_delete_profesor"
  ON public.materiales
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.clases
      WHERE clases.id = materiales.clase_id
        AND clases.profesor_id = auth.uid()
    )
  );

-- ============================================================
-- TABLA: notas
-- ============================================================
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;

-- Alumno ve sus propias notas; profesor ve todas las notas de su clase
CREATE POLICY "notas_select"
  ON public.notas
  FOR SELECT
  USING (
    alumno_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.clases
      WHERE clases.id = notas.clase_id
        AND clases.profesor_id = auth.uid()
    )
  );

-- Solo el profesor de la clase puede insertar notas
CREATE POLICY "notas_insert_profesor"
  ON public.notas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clases
      WHERE clases.id = notas.clase_id
        AND clases.profesor_id = auth.uid()
    )
  );

-- Solo el profesor de la clase puede actualizar notas
CREATE POLICY "notas_update_profesor"
  ON public.notas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.clases
      WHERE clases.id = notas.clase_id
        AND clases.profesor_id = auth.uid()
    )
  );

-- Solo el profesor de la clase puede eliminar notas
CREATE POLICY "notas_delete_profesor"
  ON public.notas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.clases
      WHERE clases.id = notas.clase_id
        AND clases.profesor_id = auth.uid()
    )
  );

-- ============================================================
-- TABLA: mensajes
-- ============================================================
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

-- Usuario ve mensajes enviados o recibidos por él
CREATE POLICY "mensajes_select"
  ON public.mensajes
  FOR SELECT
  USING (
    de_usuario = auth.uid()
    OR para_usuario = auth.uid()
  );

-- Solo puede enviar mensajes como remitente propio
CREATE POLICY "mensajes_insert"
  ON public.mensajes
  FOR INSERT
  WITH CHECK (de_usuario = auth.uid());

-- Solo el destinatario puede actualizar (marcar como leído)
CREATE POLICY "mensajes_update_destinatario"
  ON public.mensajes
  FOR UPDATE
  USING (para_usuario = auth.uid());

-- ============================================================
-- TABLA: comunicados
-- ============================================================
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

-- Alumno matriculado en la clase ve el comunicado;
-- también se ven comunicados globales (clase_id IS NULL);
-- el propio autor siempre ve sus comunicados
CREATE POLICY "comunicados_select"
  ON public.comunicados
  FOR SELECT
  USING (
    autor_id = auth.uid()
    OR clase_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.matriculas
      WHERE matriculas.clase_id = comunicados.clase_id
        AND matriculas.alumno_id = auth.uid()
    )
  );

-- Solo usuarios con rol 'profesor' pueden publicar comunicados
CREATE POLICY "comunicados_insert_profesor"
  ON public.comunicados
  FOR INSERT
  WITH CHECK (
    autor_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'profesor'
    )
  );

-- Solo el autor puede actualizar sus comunicados
CREATE POLICY "comunicados_update_autor"
  ON public.comunicados
  FOR UPDATE
  USING (autor_id = auth.uid());

-- Solo el autor puede eliminar sus comunicados
CREATE POLICY "comunicados_delete_autor"
  ON public.comunicados
  FOR DELETE
  USING (autor_id = auth.uid());
