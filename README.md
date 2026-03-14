# Dashboard Frontend - Sistema de Gestión de Pedidos y Chat

Dashboard administrativo para gestionar pedidos y atención al cliente del restaurante conectado a WhatsApp Business.

## 🚀 Características

- **KDS (Kitchen Display System)**: Tablero Kanban para gestionar pedidos en tiempo real
- **Chat de Atención al Cliente**: Interfaz tipo WhatsApp para responder mensajes
- **WebSocket**: Actualizaciones en tiempo real sin refresh
- **Autenticación**: Login con JWT tokens
- **Responsive**: Diseñado para tablets y monitores

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 🔧 Configuración

El proyecto está configurado para conectarse al backend en `http://localhost:8000`.

Si necesitas cambiar la URL del backend, edita el proxy en `vite.config.js`.

## 📱 Acceso por Defecto

- **URL**: http://localhost:5173
- **Usuario**: admin
- **Contraseña**: admin123

⚠️ **Cambia estas credenciales después del primer login**

<blockquote>
El frontend usa rutas relativas (`/api/...`) y en desarrollo un proxy Vite (ver `vite.config.js`). Esto evita problemas de CORS.

**Importante para desarrollo:** asegúrate de que no existe la variable de entorno `VITE_API_URL` o que está vacía; de lo contrario las peticiones se harán contra su valor (ej. `http://192.168...:8000`) y saltará el error de CORS. El proxy sólo funciona cuando la URL es relativa. En producción puedes establecer `VITE_API_URL` al dominio real de la API.

</blockquote>

## 🏗️ Estructura del Proyecto

```
src/
├── main.js              # Punto de entrada
├── App.vue              # Componente raíz
├── router/              # Configuración de rutas
├── stores/              # Stores de Pinia
├── views/               # Vistas principales
├── components/          # Componentes reutilizables
├── composables/         # Composables de Vue
└── utils/               # Utilidades y constantes
```

## 🔐 Autenticación

Todas las rutas excepto `/login` requieren autenticación. El token JWT se guarda en localStorage.

## 📡 WebSocket

El dashboard se conecta automáticamente al WebSocket del backend para recibir:

- Nuevos pedidos
- Actualizaciones de estado
- Nuevos mensajes de clientes
- Cambios en estado del bot

## 🔗 API Endpoints

El frontend consume el siguiente conjunto de rutas expuestas por el backend. Se recomienda revisar el OpenAPI generado por FastAPI para obtener esquemas detallados.

### Autenticación

- `POST /api/auth/login`
- `GET /api/auth/me` (perfil)

### Clientes & Chat

- `/api/clientes/activos`
- `/api/clientes/{telefono}/mensajes`
- etc. (chat ya implementado en la vista de chat)

### Pedidos

- `POST /api/pedidos`
- `GET /api/pedidos` (filtros `?tipo=...&estado=...`)
- `GET /api/pedidos/{id}`
- `PATCH /api/pedidos/{id}/estado` (cambio de estado)
- `PATCH /api/pedidos/{id}/motorizado` (asignar motorizado)
- WebSocket eventos `new_order`, `order_updated`

### Administración (requiere rol ADMIN)

- **Settings dinámicos**: `GET /api/admin/settings`, `PATCH /api/admin/settings`
- **Categorías**: CRUD con `/api/admin/categories`
- **Productos**: CRUD con `/api/admin/products` (incluye campo `sinonimos[]`)
- **Delivery**: `GET/PATCH /api/admin/delivery`
- **Plantillas**: CRUD con `/api/admin/templates`

### Otros

- `/api/motorizados` (lista, creación, actualización, disponibilidad)
- `/api/pedidos/delivery/mis-pedidos` (para panel de motorizado)

Los enums importantes que maneja el frontend son:

- `SettingType`: STRING, INT, FLOAT, BOOL, JSON
- `EstadoPedido`: PENDIENTE, PREPARANDO, LISTO, ASIGNADO, EN_CAMINO, ENTREGADO, CANCELADO
- `TipoEntrega`: DELIVERY, RECOJO, MESA, PRESENCIAL

## 🎨 Stack Tecnológico

- Vue 3 (Composition API)
- Vite
- Tailwind CSS
- Pinia
- Vue Router
- Axios
- Day.js
- Vue Toastification
