# creeducaCampus

Plataforma educativa online para centro pequeño (<150 alumnos).
Prototipo funcional al 70% con dos roles: Profesor y Alumno.

---

## Stack

- **Framework:** Next.js 14 (App Router) — SIEMPRE App Router, nunca Pages Router
- **Base de datos / Auth / Storage:** Supabase
- **Estilos:** Tailwind CSS + shadcn/ui
- **Lenguaje:** TypeScript estricto (sin `any`)
- **Deploy:** Vercel

---

## Estructura de carpetas

```
creeducaCampus/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── registro/
│   ├── dashboard/
│   │   ├── profesor/
│   │   └── alumno/
│   └── layout.tsx
├── components/
│   ├── ui/          ← shadcn/ui components
│   └── shared/      ← componentes reutilizables propios
├── lib/
│   ├── supabase.ts  ← cliente Supabase (server + client)
│   └── utils.ts
├── types/
│   └── index.ts     ← tipos globales TypeScript
├── .claude/
│   └── agents/
└── CLAUDE.md
```

---

## Esquema de base de datos

### Tabla: `usuarios`
```sql
id          uuid PRIMARY KEY (auth.users)
nombre      text NOT NULL
email       text NOT NULL
rol         text CHECK (rol IN ('profesor', 'alumno')) NOT NULL
avatar_url  text
created_at  timestamptz DEFAULT now()
```

### Tabla: `clases`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
nombre       text NOT NULL
descripcion  text
profesor_id  uuid REFERENCES usuarios(id)
horario      jsonb        -- { dia: string, hora_inicio: string, hora_fin: string }[]
created_at   timestamptz DEFAULT now()
```

### Tabla: `matriculas`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
alumno_id  uuid REFERENCES usuarios(id)
clase_id   uuid REFERENCES clases(id)
created_at timestamptz DEFAULT now()
UNIQUE (alumno_id, clase_id)
```

### Tabla: `materiales`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
clase_id    uuid REFERENCES clases(id)
nombre      text NOT NULL
descripcion text
tipo        text CHECK (tipo IN ('documento', 'video', 'enlace', 'otro'))
url         text NOT NULL   -- Supabase Storage URL o enlace externo
subido_por  uuid REFERENCES usuarios(id)
created_at  timestamptz DEFAULT now()
```

### Tabla: `notas`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
alumno_id   uuid REFERENCES usuarios(id)
clase_id    uuid REFERENCES clases(id)
valor       numeric(4,2) CHECK (valor BETWEEN 0 AND 10)
comentario  text
creado_por  uuid REFERENCES usuarios(id)  -- siempre el profesor
created_at  timestamptz DEFAULT now()
```

### Tabla: `mensajes`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
de_usuario   uuid REFERENCES usuarios(id)
para_usuario uuid REFERENCES usuarios(id)
asunto       text
cuerpo       text NOT NULL
leido        boolean DEFAULT false
created_at   timestamptz DEFAULT now()
```

### Tabla: `comunicados`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
autor_id     uuid REFERENCES usuarios(id)   -- siempre profesor
clase_id     uuid REFERENCES clases(id)     -- null = comunicado global
titulo       text NOT NULL
cuerpo       text NOT NULL
created_at   timestamptz DEFAULT now()
```

---

## Row Level Security (RLS) — reglas clave

- **usuarios:** cada usuario solo lee/edita su propio perfil
- **clases:** profesores ven y editan las suyas; alumnos ven solo las que tienen matrícula
- **materiales:** profesores de la clase pueden insertar; alumnos matriculados solo leen
- **notas:** profesores de la clase insertan/editan; alumnos solo leen las suyas
- **mensajes:** usuario lee si es `de_usuario` o `para_usuario`
- **comunicados:** profesores insertan; alumnos matriculados en la clase leen

> ⚠️ NUNCA desactivar RLS en ninguna tabla. Todas las tablas deben tener RLS habilitado.

---

## Convenciones de código

- Usar **Server Components** por defecto; `'use client'` solo cuando haya interactividad real
- **Server Actions** para todas las mutations (no endpoints API salvo excepciones)
- El cliente de Supabase vive en `/lib/supabase.ts` — no instanciar en otro sitio
- Rutas protegidas mediante **middleware.ts** en la raíz verificando sesión y rol
- Imports absolutos con alias `@/` (configurado en tsconfig)
- Nombres de archivos en **kebab-case**, componentes en **PascalCase**
- Formularios con **react-hook-form** + **zod** para validación

---

## Patrones prohibidos

- ❌ `any` en TypeScript
- ❌ Queries a Supabase sin RLS activo
- ❌ Lógica de negocio en componentes cliente
- ❌ Variables de entorno sin prefijo `NEXT_PUBLIC_` expuestas al cliente
- ❌ `pages/` router — solo `app/`
- ❌ Instanciar Supabase fuera de `/lib/supabase.ts`

---

## Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # solo server-side, nunca al cliente
```

---

## Supabase Storage

- Bucket: `materiales` — archivos de clases (PDFs, imágenes, docs)
- Política: solo el profesor de la clase puede subir; alumnos matriculados pueden descargar
- Tamaño máximo por archivo: 50MB
- Tipos permitidos: pdf, doc, docx, ppt, pptx, jpg, png, mp4

---

## Funcionalidades del prototipo (70%)

| Módulo              | Profesor                        | Alumno                        |
|---------------------|---------------------------------|-------------------------------|
| Clases/Horarios     | Crear, editar, ver horario      | Ver sus clases y horario      |
| Materiales          | Subir, eliminar materiales      | Descargar materiales          |
| Notas               | Añadir/editar nota por alumno   | Ver sus notas por clase       |
| Mensajería          | Enviar/recibir mensajes         | Enviar/recibir mensajes       |
| Comunicados         | Publicar comunicados por clase  | Leer comunicados de su clase  |

---

## Sesiones de desarrollo sugeridas