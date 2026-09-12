# PROGRESS — TIEMPOAPP

Estado actual del proyecto, decisiones técnicas y próximos pasos.
Este archivo se actualiza al inicio y al fin de cada sesión de trabajo.

**Última actualización:** 2026-09-11
**Rama de integración:** `dev`
**Último commit en `dev`:** `6435922` (Merge PR #3: documentación y lockfiles)
**Rama de trabajo activa:** `feat/frontend-perfil-usuario` (PR #4 pendiente)

---

## Estado por módulo

### 1. Gestión de perfiles de usuario

**Backend — completado (integrado en `dev` vía PR #2):**
- [x] Modelo `Usuario` con Sequelize (UUID, email único, habilidades, créditos de tiempo, avatar).
- [x] Migración `20260905054746-create-usuario.js`.
- [x] Registro y login con bcryptjs + JWT (`/api/auth/registro`, `/api/auth/login`).
- [x] CRUD de usuarios protegido con middleware JWT (`/api/usuarios`).

**Frontend — completado (PR #4 pendiente de merge):**
- [x] Configuración de Tailwind v4, react-router-dom, axios y Vitest/RTL.
- [x] Cliente HTTP con interceptor JWT y manejo de 401.
- [x] `AuthContext` con persistencia en `localStorage`.
- [x] Formularios de registro, login y edición de perfil.
- [x] Páginas `Home`, `Registro`, `Login` y `Perfil`.
- [x] Rutas, navbar y `ProtectedRoute` para rutas privadas.
- [x] 15 tests pasando (AuthContext, FormularioRegistro, FormularioLogin, ProtectedRoute).

**Pendientes del módulo:**
- [ ] Ejecutar la migración en la base de datos local de desarrollo.
- [ ] Probar el flujo completo contra el backend real corriendo.
- [ ] Validar visualmente el diseño (Tailwind) en navegador.

### 2. Créditos de tiempo
- [ ] Pendiente. Solo existe el campo `creditos_tiempo` en el modelo `Usuario`, inicializado en 5.0 al registrarse.

### 3. Publicaciones / servicios
- [ ] Pendiente.

### 4. Calificaciones
- [ ] Pendiente.

### 5. Multimedia
- [ ] Pendiente. Almacenamiento por definir (local, Cloudinary o S3).

### 6. Mapa interactivo (Leaflet)
- [ ] Pendiente.

---

## Decisiones técnicas tomadas

- **Arquitectura backend:** MVC + patrón Observer (base de Socket.io en `server/src/app.js`).
- **Arquitectura frontend:** React + Context API + services desacoplados + rutas con `react-router-dom`.
- **ORM:** Sequelize sobre PostgreSQL.
- **Autenticación:** JWT, tokens firmados con `JWT_SECRET`, expiración configurable por `JWT_EXPIRES_IN`. Frontend inyecta `Authorization: Bearer <token>` vía interceptor axios.
- **Estado del frontend:** Context API (`AuthProvider`) con persistencia en `localStorage` (clave `tiempoapp.auth`).
- **Estilos:** Tailwind CSS v4 (config CSS-first, plugin oficial de Vite, sin `tailwind.config.js`).
- **Testing frontend:** Vitest + React Testing Library + jsdom. Comando: `npm run test:run`.
- **Variable de entorno del frontend:** `VITE_API_URL` (en `client/.env`, ejemplo en `client/.env.example`).
- **Estructura del repositorio:** `client/` (React + Vite) y `server/` (Node + Express). Lockfiles versionados.
- **Control de secretos:** `.env` ignorado siempre; `.env.example` documenta las variables necesarias.
- **Estrategia de ramas:** `main` protegida, `dev` de integración, ramas por tarea (`feat/`, `fix/`, `docs/`, `chore/`), merge vía PR.

---

## Próximos pasos inmediatos

1. Abrir PR #4 de `feat/frontend-perfil-usuario` hacia `dev` y fusionarlo.
2. Ejecutar migración en la base local: `cd server && npx sequelize-cli db:migrate`.
3. Levantar backend (`cd server && npm run dev`) y frontend (`cd client && npm run dev`) y probar el flujo completo.
4. Al cerrar la Etapa 1: PR de `dev` hacia `main`.
5. Iniciar el siguiente módulo (créditos de tiempo) en rama `feat/creditos-tiempo`.

---

## Pendientes de definición

- Almacenamiento de avatares: local, Cloudinary o S3.
- Política de expiración de tokens (refresh tokens o re-login).
- Cronograma fino de los módulos restantes (créditos, publicaciones, calificaciones, mapa).
