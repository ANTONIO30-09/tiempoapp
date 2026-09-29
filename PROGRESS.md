# PROGRESS — TIEMPOAPP

Estado actual del proyecto, decisiones técnicas y próximos pasos.
Este archivo se actualiza al inicio y al fin de cada sesión de trabajo.

**Última actualización:** 2026-09-29
**Rama de integración:** `dev`
**Último commit en `dev`:** `fcac3de` (Merge PR #8: módulo de créditos de tiempo)
**Último commit en `main`:** `d7a401e` (Merge PR #9: dev → main, cierre Etapa 2)
**Rama de trabajo activa:** `feat/publicaciones-servicios` (PR pendiente)

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

### 2. Créditos de tiempo — COMPLETADO Y VERIFICADO (en `dev`)

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

**Bugs detectados y corregidos durante verificación:**
- Símbolo `$` literal en `CardSaldo` (por usar `${...}` fuera de template literal). Corregido en commit `2d92ccd`.
- Input de horas con `step="0.25"` y `min="0.01"` rechazaba valores enteros. Cambiado a `min="0"`.

### 3. Publicaciones / servicios — COMPLETADO Y VERIFICADO (en `feat/publicaciones-servicios`, PR pendiente)

**Diseño confirmado:**
- Campo `habilidades` como array (consistente con `Usuario`).
- `ciudad` como campo propio de la publicación, NO heredado del autor (deja puerta abierta a multi-ciudad).
- `modalidad`: string con 3 valores válidos (`presencial`, `remota`, `ambas`).
- `activa`: booleano simple, sin estados intermedios.
- Edición/borrado: solo el autor, borrado real (no soft delete).
- Filtros: `habilidad` + `ciudad` + texto libre en `titulo`.
- SIN acoplar con créditos: la transferencia sigue siendo manual desde `/creditos`.

**Backend:**
- [x] Migración `20260929120000-create-publicacion.js` aplicada en BD local.
- [x] Modelo `Publicacion` con `belongsTo(Usuario, { as: 'autor' })` declarado en `models/index.js`.
- [x] Controlador `publicacionController` con `crear`, `listar`, `obtenerPorId`, `actualizar`, `eliminar`.
- [x] Control de autoría inline (patrón del fix IDOR de `usuarioController`).
- [x] Rutas `/api/publicaciones` (todas protegidas con `auth`).
- [x] 29 tests Jest del controlador (crear/listar/obtenerPorId/actualizar/eliminar + 403 + 404 + 400).

**Frontend:**
- [x] Servicio `publicacionesService` (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`).
- [x] `TarjetaPublicacion` con badge de modalidad, chips de habilidades y botones Editar/Eliminar visibles solo si el usuario es el autor.
- [x] `FormularioPublicacion` en modo dual crear/editar, con validación local y parseo de habilidades separadas por coma.
- [x] Página `/publicaciones` protegida, con formulario inline (mismo patrón que `Creditos.jsx`), filtros y confirmación de borrado vía `window.confirm`.
- [x] Enlace "Publicaciones" en navbar (solo autenticado).
- [x] 45 tests frontend (11 service + 12 tarjeta + 10 formulario + 12 página).

**Verificación end-to-end (2026-09-29, humo manual):**
- [x] Registro de usuario nuevo (`test.publicador@ejemplo.com`).
- [x] Login y navegación a `/publicaciones` (listado vacío sin error).
- [x] Crear publicación (título, horas, ciudad, habilidades, modalidad) → aparece la tarjeta con autor, chips y botones.
- [x] `/créditos` carga saldo del usuario nuevo.
- [x] Navbar muestra link "Publicaciones" solo autenticado.
- [x] `GET /api/publicaciones` y `GET /api/creditos/saldo` responden 200 con token fresco.

**Incidente durante el humo (no es bug, documentado para la próxima):**
- El token de `ana.test@ejemplo.com` estaba expirado en `localStorage`. El interceptor axios de `api.js` borra `token` y `usuario` ante un 401, pero `AuthContext` mantiene el estado React en memoria. Resultado: navbar sigue mostrando sesión activa pero todos los endpoints devuelven 401. Se resolvió haciendo logout manual y login con usuario fresco. Anotado como deuda técnica más abajo.

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
- **Testing backend:** Jest con `jest.config.js`. Comando: `npm run test:run`.
- **Lockfiles versionados:** `client/package-lock.json` y `server/package-lock.json`.
- **Control de secretos:** `.env` ignorado siempre; `.env.example` documenta variables.
- **Estrategia de ramas:** `main` protegida por ruleset de GitHub, `dev` de integración, ramas por tarea (`feat/`, `fix/`, `docs/`, `chore/`).
- **Publicaciones:** todas las rutas exigen `auth` (incluso los GET). El frontend trata `/publicaciones` como ruta protegida.

---

## Deuda técnica registrada

- **Refactor a middleware:** los checks de autoría están inline en `usuarioController`, `creditosController` y `publicacionController`. Con tres repeticiones ya justifica extraer un middleware reutilizable `esMismoUsuario`.
- **Roles/administradores:** sin sistema de roles. Si se necesita admin que modifique otros, agregar campo `rol` al modelo `Usuario`.
- **Validación de email:** delegada a `isEmail` de Sequelize. Podría endurecerse.
- **Carga de avatares:** `avatar_url` existe pero no hay endpoint de subida.
- **Datos de prueba en BD local:** quedaron usuarios y transacciones sintéticas. Limpiar antes del cierre de etapa si se desea empezar de cero.
- **Bug UX — 401 sin logout automático:** al expirar el token, el interceptor de `api.js` limpia `localStorage` pero `AuthContext` no reacciona, dejando la UI en estado inconsistente (navbar con sesión aparente + endpoints devolviendo 401). Fix propuesto: evento global que `AuthContext` escuche para hacer logout. Prioridad: media.
- **Bug UX — mensaje de error en verde en `Creditos.jsx`:** hay un solo `useState('mensaje')` reutilizado para éxito y error, siempre con estilo `text-green-700 bg-green-50`. El error de carga aparece en verde. Fix propuesto: separar `mensaje` y `error` con estilos distintos. Prioridad: baja.
- **Warning `act(...)` en `FormularioTransferencia.test.jsx`:** actualización de estado de React no envuelta en `act()` durante los tests. No rompe nada pero ensucia la salida de Vitest. Fix propuesto: envolver los `render`/interacciones problemáticas. Prioridad: baja.
- **Mojibake en PROGRESS.md y README.md:** corregido en commit de documentación del cierre del módulo de publicaciones (2026-09-29).

---

## Próximos pasos inmediatos

1. Abrir PR de `feat/publicaciones-servicios` hacia `dev`.
2. Al mergear, abrir PR de `dev` hacia `main` para cerrar Etapa 3.
3. Arrancar el módulo de calificaciones:
   - Modelo `Calificacion` (autor, receptor, publicación/transacción asociada, puntaje, comentario).
   - Endpoints CRUD + regla de "solo se puede calificar tras una transacción".
   - Vista de calificaciones por usuario.
4. Al cerrar cada módulo: PR de `dev` hacia `main`.

---

## Pendientes de definición

- Almacenamiento de avatares: local, Cloudinary o S3.
- Política de expiración de tokens (refresh tokens o re-login).
- Cronograma fino de los módulos restantes (calificaciones, multimedia, mapa).
