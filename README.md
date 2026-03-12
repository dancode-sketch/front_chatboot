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

## 🎨 Stack Tecnológico

- Vue 3 (Composition API)
- Vite
- Tailwind CSS
- Pinia
- Vue Router
- Axios
- Day.js
- Vue Toastification
