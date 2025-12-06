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
- `frontend` en el host: `http://localhost:5173` (Vite dev server)
- `backend` en `http://localhost:4000` (API + WebSocket)

Features añadidos:
- UI de simulación local (se guarda en `localStorage`).
- Panel Admin básico para publicar el fixture real (POST a `/api/admin/fixture`).
- WebSocket en cliente para recibir actualizaciones en tiempo real.
- Service worker básico para caching offline (`/service-worker.js`).

Siguientes pasos recomendados: compilar frontend para producción y servir archivos estáticos desde backend para un despliegue simple.
