# PROGRESS — TIEMPOAPP

Estado actual del proyecto, decisiones técnicas y próximos pasos.
Este archivo se actualiza al inicio y al fin de cada sesión de trabajo.

**Última actualización:** 2026-09-12
**Rama de integración:** `dev`
**Último commit en `dev`:** `f9984d9` (Merge PR #7: fix autorización + Jest)
**Último commit en `main`:** `3ddb3c3` (Merge PR #6: cierre Etapa 1)
**Rama de trabajo activa:** `feat/creditos-tiempo` (PR #8 pendiente)

---

## Estado por módulo

### 1. Gestión de perfiles de usuario — COMPLETADO Y VERIFICADO (en `main`)

**Backend (PR #2):**
- [x] Modelo `Usuario` con Sequelize (UUID, email único, habilidades, créditos de tiempo, avatar).
- [x] Migración `20260905054746-create-usuario.js` aplicada en BD local.
- [x] Registro y login con bcryptjs + JWT.
- [x] CRUD de usuarios protegido con middleware JWT.
- [x] Fix de autorización IDOR (PR #7): 403 si `req.usuario.id !== req.params.id`.

**Frontend (PR #4):**
- [x] Tailwind v4, react-router-dom, axios, Vitest/RTL.
- [x] `AuthContext` con persistencia en `localStorage`.
- [x] Formularios de registro, login y edición de perfil.
- [x] Páginas Home, Registro, Login y Perfil.
- [x] Rutas protegidas, navbar con logout.

**Tests:** 15 frontend + 7 backend, todos pasando.

### 2. Créditos de tiempo — COMPLETADO Y VERIFICADO (PR #8 pendiente)

**Diseño confirmado:**
- Transferencia instantánea, sin estado intermedio.
- Atomicidad garantizada con `sequelize.transaction()` + `LOCK.UPDATE` (SELECT FOR UPDATE) bloqueando en orden consistente de UUID para evitar deadlocks.
- Saldo no negativo, sin auto-transferencia, horas > 0, historial inmutable.

**Backend:**
- [x] Modelo `Transaccion` con FK a `usuarios` y `ON DELETE CASCADE`.
- [x] Migración `20260912120000-create-transaccion.js` aplicada en BD local.
- [x] Controlador `creditosController` con `transferir`, `historial` y `saldo`.
- [x] Rutas `POST /api/creditos/transferir`, `GET /api/creditos/historial`, `GET /api/creditos/saldo`.
- [x] 13 tests Jest del controlador (incluye rollback y lock).

**Frontend:**
- [x] Servicio `creditosService`.
- [x] `CardSaldo` con saldo grande + botón CTA.
- [x] `FormularioTransferencia` con selector de usuario por búsqueda.
- [x] `HistorialTransacciones` con íconos envío (rojo) / recepción (verde).
- [x] Página `/creditos` protegida con `ProtectedRoute`.
- [x] Enlace "Créditos" en navbar.
- [x] 10 tests (CardSaldo + FormularioTransferencia).

**Verificación end-to-end (2026-09-12):**
- [x] Transferencia exitosa Ana → Nino (2.5 h).
- [x] Saldo insuficiente → 400 con mensaje correcto.
- [x] Auto-transferencia → 400 con mensaje correcto.
- [x] Historial muestra movimientos con emisor y receptor.
- [x] Saldos en BD consistentes tras múltiples transferencias.
- [x] Flujo completo probado en navegador con dos usuarios.

**Bug detectado y corregido durante verificación:**
- Símbolo `$` literal en CardSaldo (por usar `${...}` fuera de template literal). Corregido en commit 2d92ccd.
- Input de horas con `step="0.25"` y `min="0.01"` rechazaba valores enteros. Cambiado a `min="0"`.

### 3. Publicaciones / servicios
- [ ] Pendiente.

### 4. Calificaciones
- [ ] Pendiente.

### 5. Multimedia
- [ ] Pendiente. Almacenamiento por definir (local, Cloudinary o S3).

### 6. Mapa interactivo (Leaflet)
- [ ] Pendiente.

---

## Notas del entorno local (importante para futuras sesiones)

- **PostgreSQL del sistema:** puerto **5433** (no 5432). Cluster `16/main`.
- **Puerto 5432:** ocupado por un contenedor Docker (`mvc_proyecto_db`, postgres 15) de **otro proyecto**. No tocar.
- **Usuario BD del proyecto:** `tiempoapp_user`. **Base:** `tiempoapp`. **Password dev:** `abc123xyz`.
- **Backend:** puerto 4000. **Frontend:** puerto 5173 (Vite).
- El `server/.env` real debe tener `DB_PORT=5433`. El `server/.env.example` mantiene 5432 (default genérico).

---

## Decisiones técnicas tomadas

- **Arquitectura backend:** MVC + patrón Observer (base de Socket.io).
- **Arquitectura frontend:** React + Context API + services desacoplados + react-router-dom.
- **ORM:** Sequelize sobre PostgreSQL.
- **Autenticación:** JWT con `Authorization: Bearer <token>` inyectado por interceptor axios.
- **Transferencias atómicas:** `sequelize.transaction()` + `lock: t.LOCK.UPDATE` con orden consistente de UUID.
- **Estado del frontend:** Context API (`AuthProvider`) con persistencia en `localStorage`.
- **Estilos:** Tailwind CSS v4 (config CSS-first, sin `tailwind.config.js`).
- **Testing frontend:** Vitest + React Testing Library + jsdom. Comando: `npm run test:run`.
- **Testing backend:** Jest con `jest.config.js`. Comando: `npm run test:run` (usa `--runInBand`).
- **Lockfiles versionados:** `client/package-lock.json` y `server/package-lock.json`.
- **Control de secretos:** `.env` ignorado siempre; `.env.example` documenta variables.
- **Estrategia de ramas:** `main` protegida por ruleset de GitHub, `dev` de integración, ramas por tarea (`feat/`, `fix/`, `docs/`, `chore/`).

---

## Deuda técnica registrada

- **Refactor a middleware:** los checks de autoría están inline en `usuarioController` y `creditosController`. Si se repite en publicaciones y calificaciones, extraer a middleware reutilizable `esMismoUsuario`.
- **Roles/administradores:** sin sistema de roles. Si se necesita admin que modifique otros, agregar campo `rol` al modelo `Usuario`.
- **Validación de email:** delegada a `isEmail` de Sequelize. Podría endurecerse.
- **Carga de avatares:** `avatar_url` existe pero no hay endpoint de subida.
- **Datos de prueba en BD local:** quedaron 2 usuarios y 3 transacciones sintéticas. Limpiar antes del cierre de etapa si se desea empezar de cero.

---

## Próximos pasos inmediatos

1. Fusionar PR #8 (`feat/creditos-tiempo`) hacia `dev`.
2. Abrir PR de `dev` hacia `main` para cerrar Etapa 2 (perfiles + créditos).
3. Arrancar el módulo de publicaciones/servicios en rama `feat/publicaciones`:
   - Modelo `Publicacion` (autor, título, descripción, habilidad, ciudad, activa).
   - Endpoints CRUD con filtros por habilidad y ciudad.
   - Vista de listado con búsqueda.
4. Al cerrar cada módulo: PR de `dev` hacia `main`.

---

## Pendientes de definición

- Almacenamiento de avatares: local, Cloudinary o S3.
- Política de expiración de tokens (refresh tokens o re-login).
- Cronograma fino de los módulos restantes (publicaciones, calificaciones, multimedia, mapa).
