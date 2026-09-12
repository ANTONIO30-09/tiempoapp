# PROGRESS — TIEMPOAPP

Estado actual del proyecto, decisiones técnicas y próximos pasos.
Este archivo se actualiza al inicio y al fin de cada sesión de trabajo.

**Última actualización:** 2026-09-12
**Rama de integración:** `dev`
**Último commit en `dev`:** `26c7353` (Merge PR #4: frontend de perfiles)
**Rama de trabajo activa:** `docs/verificacion-etapa-1` (PR #5)

---

## Estado por módulo

### 1. Gestión de perfiles de usuario — COMPLETADO Y VERIFICADO

**Backend (integrado en `dev` vía PR #2):**
- [x] Modelo `Usuario` con Sequelize (UUID, email único, habilidades, créditos de tiempo, avatar).
- [x] Migración `20260905054746-create-usuario.js` aplicada en BD local.
- [x] Registro y login con bcryptjs + JWT (`/api/auth/registro`, `/api/auth/login`).
- [x] CRUD de usuarios protegido con middleware JWT (`/api/usuarios`).

**Frontend (integrado en `dev` vía PR #4):**
- [x] Tailwind v4, react-router-dom, axios, Vitest/RTL configurados.
- [x] Cliente HTTP con interceptor JWT y manejo de 401.
- [x] `AuthContext` con persistencia en `localStorage`.
- [x] Formularios de registro, login y edición de perfil.
- [x] Páginas Home, Registro, Login y Perfil.
- [x] Rutas protegidas, navbar con logout, `ProtectedRoute`.
- [x] 15 tests pasando (AuthContext, FormularioRegistro, FormularioLogin, ProtectedRoute).

**Verificación end-to-end (sesión 2026-09-12):**
- [x] Base de datos local creada: `tiempoapp` con usuario `tiempoapp_user`.
- [x] Migración aplicada, tabla `usuarios` verificada en PostgreSQL.
- [x] Backend levantado, health OK, registro vía curl OK, login + listado OK.
- [x] Frontend levantado, flujo manual completo probado en navegador:
  - Home → Registro → Perfil → Edición → Logout → Login → Perfil.
  - Ruta protegida `/perfil` redirige a `/login` sin sesión.
- [x] Sin errores en consola del navegador, ni en backend ni en frontend.

**Pendientes del módulo:**
- [ ] Cargar avatar (almacenamiento por definir).
- [ ] Validación de formato de email más robusta (actualmente confía en `isEmail` de Sequelize).

### 2. Créditos de tiempo
- [ ] Pendiente. Solo existe el campo `creditos_tiempo` en el modelo `Usuario`, inicializado en 5.0 al registrarse. Falta el módulo de transferencia de créditos entre usuarios.

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
- **Variable de entorno del frontend:** `VITE_API_URL` (en `client/.env`, ejemplo en `client/.env.example`).
- **Lockfiles versionados:** `client/package-lock.json` y `server/package-lock.json` en control de versiones.
- **Control de secretos:** `.env` ignorado siempre; `.env.example` documenta las variables necesarias.
- **Estrategia de ramas:** `main` protegida, `dev` de integración, ramas por tarea (`feat/`, `fix/`, `docs/`, `chore/`), merge vía PR.

---

## Próximos pasos inmediatos

1. Fusionar PR #5 (`docs/verificacion-etapa-1`) hacia `dev`.
2. Abrir PR de `dev` hacia `main` para cerrar formalmente la Etapa 1 del módulo de perfiles.
3. Arrancar el siguiente módulo en rama `feat/creditos-tiempo`:
   - Modelo `Transaccion` (origen, destino, horas, descripción, estado).
   - Endpoints de transferencia de créditos.
   - Vista de historial y saldo.
4. Configurar Jest en `server/` y escribir las primeras pruebas de `authController`.
5. Al cierre de cada módulo: PR de `dev` hacia `main`.

---

## Pendientes de definición

- Almacenamiento de avatares: local, Cloudinary o S3.
- Política de expiración de tokens (refresh tokens o re-login).
- Cronograma fino de los módulos restantes (créditos, publicaciones, calificaciones, mapa).
