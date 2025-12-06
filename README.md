# worldcup-fixture-pwa

Proyecto PWA para armar y simular el fixture del mundial.

Estructura:
- `frontend/` : Vite + React + TypeScript + MUI + PWA
- `backend/` : Node + Express + WebSocket (admin updates)

Instrucciones rápidas:
1. Instalar dependencias en `frontend` y `backend`.
2. Ejecutar backend: `npm run dev` en `backend`.
3. Ejecutar frontend: `npm run dev` en `frontend`.

Para publicar en GitHub desde esta máquina se intenta usar la CLI `gh`.

Docker (local):
1. Asegurate de tener Docker y docker-compose instalados.
2. Desde la raíz del repo ejecutá:

```bash
docker-compose up --build
```

Esto levantará dos servicios:

Features añadidos:

Siguientes pasos recomendados: compilar frontend para producción y servir archivos estáticos desde backend para un despliegue simple.
Generar `ADMIN_PASSWORD_HASH` (recomendado)
1. Para no guardar la contraseña en texto plano en producción, generá un hash con bcrypt y exportalo como variable de entorno `ADMIN_PASSWORD_HASH`.

Desde la carpeta `backend` podés usar el script incluido:

```bash
cd backend
npm install
npm run gen-hash mySuperSecretPassword
# copia el valor generado y exportalo en tu entorno de despliegue
# ejemplo (macOS / Linux):
export ADMIN_PASSWORD_HASH='<hash-aqui>'
```

Luego arrancá el backend con esa variable definida. Si preferís, podés usar `ADMIN_PASSWORD` en desarrollo y el servidor generará un hash al inicio (no recomendado en prod).

Bloqueo por intentos fallidos y logging
- El backend implementa un bloqueo básico por IP: después de 5 intentos fallidos en 15 minutos se bloquea por 15 minutos.
- Los eventos importantes (login fallido/éxitos, publicación de fixture) se registran en `logs/app.log` (archivo creado en el contenedor o en la carpeta del repo cuando se ejecuta localmente).

Mejoras del panel admin
- El panel `/admin` ahora incluye un editor visual del fixture: podés añadir/quitar equipos, reordenarlos y editar nombre/código.
- Validaciones básicas aseguran que cada grupo tenga al menos un equipo y que nombre/código no estén vacíos antes de publicar.
