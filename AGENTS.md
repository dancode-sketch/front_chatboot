# AGENTS (Personalización de Agents para este proyecto)

Este archivo describe los agentes (custom agents / workflows) disponibles para trabajar con este repositorio y ofrece una guía para crear nuevos agentes en el futuro.

> ⚠️ Nota: Actualmente este proyecto **no tiene agentes personalizados ya definidos** (no hay archivos `*.agent.md` ni carpetas `.github/agents/`). Este documento sirve como punto de partida para registrar y explicar cualquier agente que se agregue.

---

## 🧭 Visión general del proyecto

Este repositorio es el frontend de un **dashboard administrativo** para un sistema de pedidos + chat de atención al cliente (WhatsApp Business) orientado a restaurantes.

### Tecnologías principales

- **Vue 3** (Composition API)
- **Vite** (bundler / dev server)
- **Pinia** (state management)
- **Tailwind CSS**
- **Axios** (HTTP)
- **WebSocket** (actualizaciones en tiempo real)

### Estructura clave

- `src/main.js` → punto de entrada: monta Vue, router, Pinia, notificaciones y directiva de roles.
- `src/router/` → rutas de la app (login, dashboard, views por módulo).
- `src/stores/` → stores de Pinia para auth, pedidos, productos, chat, settings, etc.
- `src/views/` → vistas principales (KDS, chat, pedidos, administración, panel motorizado).
- `src/components/` → componentes reutilizables y modales (chat, pedidos, KDS, etc.).
- `src/composables/` → hooks reutilizables (`useApi`, `useWebSocket`, `useNotify`, etc.).
- `src/utils/` → utilidades (formatters, constantes).

### Cómo ejecutar

```bash
npm install
npm run dev
```

Visitar: `http://localhost:5173`

---

## 🤖 Agentes disponibles (este workspace)

### Agentes incorporados

- **Explore**: subagente de solo lectura para explorar el código y responder preguntas. Úsalo cuando necesites entender structure, lógica o encontrar archivos/classes.

### Agentes personalizados (ninguno aún)

No hay agentes personalizados definidos en este repositorio. Para agregar un nuevo agente personalizado:

1. Crear carpeta `.github/agents/` (si no existe).
2. Añadir un archivo `mi-agent.agent.md` con metadatos y descripción.
3. Documentar aquí el propósito del agente y los comandos clave.

Ejemplo mínimo:

```md
---
name: mi-agent
description: "Ayuda con tareas específicas del frontend (vistas, stores, componentes)."
---

# Mi Agent

Usos comunes:

- "Revisar la lógica de autenticación"
- "Agregar nueva vista de reportes"
```

---

## 🧩 Sugerencias para trabajar con el código

- **Cambios API**: el frontend asume que el backend expone rutas en `/api/...` y utiliza proxy en `vite.config.js` para desarrollo.
- **Autorización**: el token JWT se guarda en `localStorage` y se envía en encabezados (`Authorization: Bearer ...`).
- **WebSocket**: Se usa para eventos en tiempo real (nuevos pedidos, mensajes, cambios de estado).
- **Roles**: la directiva `v-role` oculta elementos HTML según roles definidos en el store `auth`.

---

## 📌 Cómo documentar nuevos agentes

1. Añade una entrada aquí con:
   - Nombre del agente
   - Propósito principal
   - Ejemplos de prompts / frases clave que activan el agente
2. Añade el archivo `*.agent.md` correspondiente en `.github/agents/`.
3. (Opcional) Agrega ejemplos de uso en un README o en comentarios de código.

---

Si quieres que genere un agente específico (por ejemplo: "Agente de refactorización de stores" o "Agente de pruebas unitarias"), dime qué objetivos debería cubrir y lo creo aquí.
