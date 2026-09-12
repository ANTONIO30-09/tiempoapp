# PROGRESS — TIEMPOAPP

Estado actual del proyecto, decisiones técnicas y próximos pasos.
Este archivo se actualiza al inicio y al fin de cada sesión de trabajo.

**Última actualización:** 2026-09-12
**Rama de integración:** `dev`
**Último commit en `dev`:** `f9984d9` (Merge PR #7: fix autorización + Jest)
**Último commit en `main`:** `3ddb3c3` (Merge PR #6: cierre Etapa 1)
**Rama de trabajo activa:** `feat/creditos-tiempo` (módulo de créditos)

---

## Estado por módulo

### 1. Gestión de perfiles de usuario — COMPLETADO Y VERIFICADO (en `main`)

**Backend (PR #2):**
- [x] Modelo `Usuario` con Sequelize (UUID, email único, habilidades, créditos de tiempo, avatar).
- [x] Migración `20260905054746-create-usuario.js` aplicada en BD local.
- [x] Registro y login con bcryptjs + JWT.
- [x] CRUD de usuarios protegido con middleware JWT.
- [x] Fix de autorización IDOR en `actualizar()` y `eliminar()` (PR #7): 403 si `req.usuario.id !== req.params.id`.

**Frontend (PR #4):**
- [x] Tailwind v4, react-router-dom, axios, Vitest/RTL.
- [x] `AuthContext` con persistencia en `localStorage`.
- [x] Formularios de registro, login y edición de perfil.
- [x] Páginas Home, Registro, Login y Perfil.
- [x] Rutas protegidas, navbar con logout.

**Tests:**
- [x] 15 tests de frontend (Vitest + RTL) pasando.
- [x] 7 tests de backend (Jest) pasando para `usuarioController`.

**Verificación end-to-end (2026-09-12):**
- [x] Flujo completo probado en navegador contra backend real.
- [x] Sin errores en consola ni en terminales.

### 2. Créditos de tiempo — EN DESARROLLO

**Decisiones de diseño confirmadas:**
- Transferencia instantánea, un solo estado: `completada`. El flujo propuesta/aceptación se difiere hasta que exista el módulo de servicios/publicaciones.
- Reglas de negocio: saldo no negativo, sin auto-transferencia, horas > 0, atomicidad obligatoria, historial inmutable (cancelaciones = transacción inversa, nunca edición ni borrado). Sin tope máximo de horas por transacción.
- Endpoints: `POST /api/creditos/transferir`, `GET /api/creditos/historial` (propio), `GET /api/creditos/saldo` (propio). Sin endpoint para ver historial de otro usuario.
- Frontend: una sola página `/creditos` con saldo, formulario de transferencia e historial.
- Referencia visual: `https://dribbble.com/shots/24858846-Crypto-Wallet-Dashboard` (adaptado: card de saldo + acción principal + historial; sin sidebar ni gráficos).

**Backend:**
- [ ] Modelo `Transaccion` y migración.
- [ ] Controlador `creditosController` con transferencia atómica.
- [ ] Rutas `/api/creditos`.
- [ ] Tests Jest de `creditosController`.

**Frontend:**
- [ ] Página `/creditos` con card de saldo.
- [ ] Formulario de transferencia con selector de usuario destinatario.
- [ ] Lista de historial con íconos de envío/recepción.
- [ ] Enlace "Créditos" en la navbar.
- [ ] Tests Vitest + RTL.

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
- **Usuario BD del proyecto:** `tiempoapp_user`.
- **Base de datos:** `tiempoapp`.
- **Backend:** puerto 4000. **Frontend:** puerto 5173 (Vite).
- El `server/.env` real debe tener `DB_PORT=5433`. El `server/.env.example` mantiene 5432 (default genérico de PostgreSQL).

---

## Decisiones técnicas tomadas

- **Arquitectura backend:** MVC + patrón Observer (base de Socket.io en `server/src/app.js`).
- **Arquitectura frontend:** React + Context API + services desacoplados + rutas con `react-router-dom`.
- **ORM:** Sequelize sobre PostgreSQL.
- **Autenticación:** JWT, tokens firmados con `JWT_SECRET`, expiración configurable por `JWT_EXPIRES_IN`. Frontend inyecta `Authorization: Bearer <token>` vía interceptor axios.
- **Estado del frontend:** Context API (`AuthProvider`) con persistencia en `localStorage`.
- **Estilos:** Tailwind CSS v4 (config CSS-first, plugin oficial de Vite, sin `tailwind.config.js`).
- **Testing frontend:** Vitest + React Testing Library + jsdom. Comando: `npm run test:run`.
- **Testing backend:** Jest con `jest.config.js`. Comando: `npm run test:run` (usa `--runInBand`).
- **Variable de entorno del frontend:** `VITE_API_URL` (en `client/.env`, ejemplo en `client/.env.example`).
- **Lockfiles versionados:** `client/package-lock.json` y `server/package-lock.json` en control de versiones.
- **Control de secretos:** `.env` ignorado siempre; `.env.example` documenta las variables necesarias.
- **Estrategia de ramas:** `main` protegida por ruleset de GitHub (PR obligatorio, sin force push), `dev` de integración, ramas por tarea (`feat/`, `fix/`, `docs/`, `chore/`), merge vía PR.

---

## Deuda técnica registrada

- **Refactor a middleware:** el check de autoría del usuario está inline en `actualizar()` y `eliminar()`. Si se repite en créditos, publicaciones y calificaciones, conviene extraerlo a un middleware `esMismoUsuario` reutilizable.
- **Roles/administradores:** el check bloquea a todos por igual. Si se necesita un rol admin, hay que agregar campo `rol` al modelo y permitir excepción.
- **Validación de email:** delegada a `isEmail` de Sequelize. Podría endurecerse.
- **Carga de avatares:** `avatar_url` existe en el modelo pero no hay endpoint de subida todavía.

---

## Próximos pasos inmediatos

1. Completar el módulo de créditos de tiempo (modelo, controlador, endpoints, frontend, tests).
2. Fusionar PR de `feat/creditos-tiempo` hacia `dev`.
3. Al cierre del módulo: PR de `dev` hacia `main`.
4. Arrancar el siguiente módulo (publicaciones/servicios).

---

## Pendientes de definición

- Almacenamiento de avatares: local, Cloudinary o S3.
- Política de expiración de tokens (refresh tokens o re-login).
- Cronograma fino de los módulos restantes (publicaciones, calificaciones, mapa).
