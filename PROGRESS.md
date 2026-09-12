# PROGRESS — TIEMPOAPP

Estado actual del proyecto, decisiones técnicas y próximos pasos.
Este archivo se actualiza al inicio y al fin de cada sesión de trabajo.

**Última actualización:** 2026-09-11
**Rama de integración:** `dev`
**Último commit en `dev`:** `d18238e` (Merge PR #2: backend de perfiles)

---

## Estado por módulo

### 1. Gestión de perfiles de usuario
- [x] Modelo `Usuario` con Sequelize (UUID, email único, habilidades, créditos de tiempo, avatar).
- [x] Migración `20260905054746-create-usuario.js`.
- [x] Registro y login con bcryptjs + JWT (`/api/auth/registro`, `/api/auth/login`).
- [x] CRUD de usuarios protegido con middleware JWT (`/api/usuarios`).
- [ ] Frontend del módulo (formularios de registro, login y edición de perfil).
- [ ] Pruebas unitarias de endpoints (Jest) y componentes (Vitest + RTL).

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

- **Arquitectura:** MVC en el backend + patrón Observer (base de Socket.io en `server/src/app.js`).
- **ORM:** Sequelize sobre PostgreSQL.
- **Autenticación:** JWT, tokens firmados con `JWT_SECRET` y expiración configurable por `JWT_EXPIRES_IN`.
- **Estructura del repositorio:** `client/` (React + Vite) y `server/` (Node + Express). Lockfiles versionados para reproducibilidad.
- **Control de secretos:** `.env` ignorado siempre; `.env.example` documenta las variables necesarias.
- **Estrategia de ramas:** `main` protegida, `dev` de integración, ramas por tarea (`feat/`, `fix/`, `docs/`, `chore/`), merge vía PR.

---

## Próximos pasos inmediatos

1. Abrir PR de `docs/documentacion-inicial` hacia `dev` y fusionarlo.
2. Implementar frontend del módulo de perfiles en rama `feat/frontend-perfil-usuario`:
   - Formularios de registro y login.
   - Vista de perfil propio y edición.
   - Consumo de `/api/auth` y `/api/usuarios` con manejo de token JWT.
3. Configurar Vitest + React Testing Library en `client/`.
4. Configurar Jest en `server/` y escribir las primeras pruebas de `authController`.
5. Ejecutar la migración en la base de datos local de desarrollo.
6. Al cierre de esta etapa: PR de `dev` hacia `main`.

---

## Pendientes de definición

- Almacenamiento de avatares: local, Cloudinary o S3.
- Política de expiración de tokens (refresh tokens o re-login).
- Cronograma fino de los módulos restantes (créditos, publicaciones, calificaciones, mapa).
