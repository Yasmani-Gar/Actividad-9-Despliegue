# Informe de Despliegue - Actividad #9
**Fecha:** 1 de agosto de 2025
**Hora:** 08:20 AM -05

## Descripción del Proyecto
Este informe documenta el despliegue de la aplicación CRUD-LISTA, un proyecto basado en Node.js con SQLite, utilizando Docker y Render. La aplicación incluye funcionalidades de login, CRUD de productos y un historial de operaciones.

## Entorno de Desarrollo
- Sistema Operativo: [e.g., Windows 10/11]
- Herramientas: Git, GitHub Desktop, Docker Desktop, Render
- Repositorio: [URL de GitHub, https://github.com/Yasmani-Gar/Actividad-9-Despliegue.git]

## Pasos de Despliegue
1. **Clonar el repositorio**: Se clonó el repositorio Actividad#9 Despliegue en `C:\GITHUB\Actividad-9-Despliegue`.
2. **Configurar el proyecto**: Se copió el contenido de CRUD-LISTA (backend/, Dockerfile, .dockerignore) a la carpeta del repositorio.
3. **Construir la imagen Docker localmente**: Se ejecutó `docker build -t actividad-9-despliegue .` y `docker run -p 3000:3000 -e JWT_SECRET=tu_clave_secreta -d actividad-9-despliegue`.
4. **Desplegar en Render**:
   - Se creó un servicio Web en Render con nombre `crud-lista-despliegue`.
   - Se configuró el entorno Docker con la rama `main`.
   - Se añadieron variables de entorno: `TZ=America/Bogota`, `JWT_SECRET=tu_clave_secreta`.
   - Se desplegó y se verificó la URL: [URL de Render, e.g., https://crud-lista-despliegue.onrender.com].
5. **Solucionar problemas**:
   - Se identificó que un bloqueador de anuncios bloqueaba `/api/login`, resuelto desactivándolo.
   - Se ajustó el `Dockerfile` para que `server.js` inicialice el usuario en lugar de `init-db.sql`.

## Pruebas Realizadas
- **Login**: Exitoso con `admin@example.com` / `123` tras desactivar el bloqueador.
- **CRUD**: Funcionalidad de crear, actualizar y eliminar productos verificada.
- **Historial**: [Indica si se muestra o no; si no, menciona que se investigará más].

## URL de Despliegue
[URL de Render, https://crud-lista-despliegue.onrender.com/login.html]
