# TIEMPOAPP

Plataforma web de banco de tiempo que permite a los usuarios intercambiar habilidades y servicios usando el tiempo dedicado como unidad de valor, en lugar de dinero.

## Descripción

Proyecto académico de la Carrera de Ingeniería de Sistemas, Universidad Privada Franz Tamayo (UNIFRANZ), materia Programación Gráfica y Multimedia I (PGM-611, Paralelo 2), 6to semestre, docente Richard Jiménez Velasco, Gestión Académica I-2026.

## Stack tecnológico

- **Frontend:** React + Vite
- **Backend:** Node.js / Express
- **Base de datos:** PostgreSQL
- **ORM:** Sequelize
- **Autenticación:** JWT (JSON Web Tokens) + bcryptjs
- **Tiempo real:** Socket.io (base para patrón Observer)
- **Mapa interactivo:** Leaflet (pendiente de integrar)
- **Almacenamiento de medios:** Por definir (local, Cloudinary o S3)

## Estructura del repositorio

```
tiempoapp/
├── client/         # Frontend React + Vite
├── server/         # Backend Node + Express + Sequelize
├── docs/           # Documentación adicional
├── .gitignore
├── README.md
└── PROGRESS.md     # Estado y próximos pasos del proyecto
```

## Requisitos previos

- Node.js 18+ y npm
- PostgreSQL 14+ en ejecución local
- Git

## Puesta en marcha

### Backend

```bash
cd server
npm install
cp .env.example .env
# Editar .env con credenciales reales de PostgreSQL
npx sequelize-cli db:migrate
npm run dev
```

El backend queda en `http://localhost:4000`. Endpoint de salud: `GET /api/health`.

### Frontend

```bash
cd client
npm install
npm run dev
```

El frontend queda disponible en la URL que indique Vite (por defecto `http://localhost:5173`).

## API (backend)

### Autenticación
- `POST /api/auth/registro` — Registra un nuevo usuario.
- `POST /api/auth/login` — Inicia sesión y devuelve un token JWT.

### Usuarios (requieren `Authorization: Bearer <token>`)
- `GET /api/usuarios` — Lista usuarios.
- `GET /api/usuarios/:id` — Detalle de un usuario.
- `PUT /api/usuarios/:id` — Actualiza un usuario.
- `DELETE /api/usuarios/:id` — Elimina un usuario.

## Estado del proyecto

- [x] Inicialización del repositorio y estructura base.
- [x] Backend del módulo de gestión de perfiles de usuario (auth + CRUD).
- [ ] Frontend del módulo de perfiles.
- [ ] Módulo de créditos de tiempo.
- [ ] Módulo de publicaciones.
- [ ] Módulo de calificaciones.
- [ ] Elementos multimedia.
- [ ] Mapa interactivo con Leaflet.

Para el detalle por módulo y decisiones técnicas, ver `PROGRESS.md`.

## Alcance

- Implementación inicial solo para la ciudad de Cochabamba.
- Fuera de alcance: pagos monetarios entre usuarios y mediación legal de conflictos.

## Cronograma orientativo

- **Marzo–abril 2026:** Análisis de requerimientos y diseño de arquitectura (MVC + Observer).
- **Abril–junio 2026:** Desarrollo iterativo del sistema.
- **Julio 2026:** Validación con usuarios reales y cierre.

## Estrategia de ramas

- `main`: rama protegida, recibe merges vía Pull Request solo al cerrar cada etapa.
- `dev`: rama de integración.
- Ramas de tarea: `feat/…`, `fix/…`, `docs/…`, `chore/…` creadas desde `dev`.
- Flujo: rama de tarea → commits → push → PR hacia `dev` → merge. Al cerrar etapa: PR de `dev` hacia `main`.
- Commits en formato *conventional commits*, en español, en presente.
