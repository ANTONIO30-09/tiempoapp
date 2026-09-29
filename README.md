# TIEMPOAPP

Plataforma web de banco de tiempo que permite a los usuarios intercambiar habilidades y servicios usando el tiempo dedicado como unidad de valor, en lugar de dinero.

## Descripción

Proyecto académico de la Carrera de Ingeniería de Sistemas, Universidad Privada Franz Tamayo (UNIFRANZ), materia Programación Gráfica y Multimedia I (PGM-611, Paralelo 2), 6to semestre, docente Richard Jiménez Velasco, Gestión Académica I-2026.

## Stack tecnológico

- **Frontend:** React + Vite + Tailwind CSS v4 + React Router + Axios
- **Testing frontend:** Vitest + React Testing Library
- **Backend:** Node.js / Express
- **Testing backend:** Jest
- **Base de datos:** PostgreSQL
- **ORM:** Sequelize
- **Autenticación:** JWT (JSON Web Tokens) + bcryptjs
- **Tiempo real:** Socket.io (base para patrón Observer)
- **Mapa interactivo:** Leaflet (pendiente de integrar)
- **Almacenamiento de medios:** Por definir (local, Cloudinary o S3)

## Estructura del repositorio

tiempoapp/
├── client/ # Frontend React + Vite
│ ├── src/
│ │ ├── components/ # Formularios, Navbar, CardSaldo, TarjetaPublicacion, FormularioPublicacion
│ │ ├── context/ # AuthContext
│ │ ├── pages/ # Home, Registro, Login, Perfil, Creditos, Publicaciones
│ │ ├── services/ # api, authService, usuarioService, creditosService, publicacionesService
│ │ └── test/ # setup de Vitest
│ └── .env.example
├── server/ # Backend Node + Express + Sequelize
│ ├── src/
│ │ ├── config/ # sequelize.js, database.js
│ │ ├── controllers/ # authController, usuarioController, creditosController, publicacionController
│ │ ├── middleware/ # auth.js (JWT)
│ │ ├── migrations/ # create-usuario, create-transaccion, create-publicacion
│ │ ├── models/ # Usuario, Transaccion, Publicacion, index (asociaciones)
│ │ └── routes/ # authRoutes, usuarioRoutes, creditosRoutes, publicacionRoutes
│ ├── jest.config.js
│ └── .env.example
├── docs/
├── .gitignore
├── README.md
└── PROGRESS.md # Estado y próximos pasos del proyecto

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
# Editar .env con credenciales reales de PostgreSQL y ajustar DB_PORT si aplica
npx sequelize-cli db:migrate
npm run dev
El backend queda en http://localhost:4000. Endpoint de salud: GET /api/health.
Frontend
cd client
npm install
cp .env.example .env
# Verificar VITE_API_URL (por defecto http://localhost:4000)
npm run dev
El frontend queda disponible en la URL que indique Vite (por defecto http://localhost:5173).

Tests del backend
cd server
npm run test:run       # ejecución única (CI)
npm run test           # modo watch
Tests del frontend
cd client
npm run test:run       # ejecución única (CI)
npm run test           # modo watch
npm run test:ui        # UI interactiva de Vitest
API (backend)
Autenticación
POST /api/auth/registro — Registra un nuevo usuario y devuelve JWT.

POST /api/auth/login — Inicia sesión y devuelve JWT.

Usuarios (requieren Authorization: Bearer <token>)
GET /api/usuarios — Lista usuarios.

GET /api/usuarios/:id — Detalle de un usuario.

PUT /api/usuarios/:id — Actualiza un usuario (solo el propio).

DELETE /api/usuarios/:id — Elimina un usuario (solo el propio).

Créditos (requieren Authorization: Bearer <token>)
POST /api/creditos/transferir — Transfiere horas a otro usuario (atómico).

GET /api/creditos/historial — Historial de movimientos del usuario autenticado.

GET /api/creditos/saldo — Saldo actual de horas del usuario autenticado.

Publicaciones (requieren Authorization: Bearer <token>)
GET /api/publicaciones — Lista publicaciones activas. Acepta query params: habilidad, ciudad, texto (búsqueda libre en título).

GET /api/publicaciones/:id — Detalle de una publicación, incluye datos del autor.

POST /api/publicaciones — Crea una publicación (título, descripción, horas estimadas, habilidades, ciudad, modalidad).

PUT /api/publicaciones/:id — Actualiza una publicación (solo el autor).

DELETE /api/publicaciones/:id — Elimina una publicación (solo el autor, borrado real).

Rutas del frontend
/ — Home pública.

/registro — Registro de usuario.

/login — Inicio de sesión.

/perfil — Perfil del usuario autenticado (ruta protegida).

/creditos — Saldo, transferencias e historial de horas (ruta protegida).

/publicaciones — Listado, filtros, creación y edición inline de publicaciones (ruta protegida).

Estado del proyecto
☑ Inicialización del repositorio y estructura base.
☑ Backend del módulo de gestión de perfiles de usuario (auth + CRUD).
☑ Frontend del módulo de perfiles (formularios, páginas, rutas y tests).
☑ Módulo de créditos de tiempo (transferencias atómicas + historial).
☑ Módulo de publicaciones / servicios (CRUD con filtros y control de autoría).
□ Módulo de calificaciones.
□ Elementos multimedia.
□ Mapa interactivo con Leaflet.
Para el detalle por módulo y decisiones técnicas, ver PROGRESS.md.

Alcance
Implementación inicial solo para la ciudad de Cochabamba.

Fuera de alcance: pagos monetarios entre usuarios y mediación legal de conflictos.

Cronograma orientativo
Marzo-abril 2026: Análisis de requerimientos y diseño de arquitectura (MVC + Observer).

Abril-junio 2026: Desarrollo iterativo del sistema.

Julio 2026: Validación con usuarios reales y cierre.

Estrategia de ramas
main: rama protegida por ruleset de GitHub, recibe merges vía Pull Request solo al cerrar cada etapa.

dev: rama de integración.

Ramas de tarea: feat/..., fix/..., docs/..., chore/... creadas desde dev.

Flujo: rama de tarea → commits → push → PR hacia dev → merge. Al cerrar etapa: PR de dev hacia main.

Commits en formato conventional commits, en español, en presente.
