# 🚀 Guía de Inicio Rápido

## 📦 Instalación Completa

### 1. Instalar Dependencias (Ya completado)

```bash
npm install
```

### 2. Iniciar el Backend

```bash
# En otra terminal, ir a la carpeta del backend
cd c:\Users\Daniel\Desktop\chatbot_api

# Activar entorno virtual (si usas venv)
.\venv\Scripts\activate

# Iniciar servidor FastAPI
uvicorn main:app --reload
```

El backend estará disponible en: `http://localhost:8000`

### 3. Iniciar el Frontend

```bash
# En la carpeta front_chatbot
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## 🔐 Credenciales de Acceso

### Primera vez (crear usuario administrador)

1. Ir a: `http://localhost:8000/api/auth/first-user`
2. Esto creará el usuario admin automáticamente

### Credenciales por defecto:

- **Usuario**: `admin`
- **Contraseña**: `admin123`

⚠️ **IMPORTANTE**: Cambia estas credenciales después del primer login

---

## 🎯 Uso del Dashboard

### Vista KDS (Kitchen Display System)

1. **Tablero Kanban de 5 columnas**:
   - **Pendiente**: Pedidos nuevos sin atender
   - **Preparando**: Pedidos en cocina
   - **Listo**: Pedidos listos para entrega
   - **Entregado**: Pedidos completados
   - **Cancelado**: Pedidos cancelados

2. **Acciones disponibles**:
   - Clic en "Iniciar Preparación" → Mueve a PREPARANDO
   - Clic en "Marcar Listo" → Mueve a LISTO
   - Clic en "Marcar Entregado" → Mueve a ENTREGADO

3. **Actualización automática**:
   - Los nuevos pedidos aparecen automáticamente vía WebSocket
   - Recibirás notificaciones toast en la esquina superior derecha

### Vista Chat (Atención al Cliente)

1. **Lista de Clientes** (panel izquierdo):
   - Clientes ordenados por último mensaje
   - Indicador 🔴 = Bot pausado (atención manual)
   - Indicador 🟢 = Bot activo (automático)

2. **Área de Conversación** (panel derecho):
   - Burbujas blancas = Mensajes del cliente
   - Burbujas verdes = Nuestros mensajes
   - Toggle para pausar/activar el bot
   - Input para enviar mensajes manuales

3. **Enviar mensajes**:
   - Escribe en el textarea inferior
   - `Enter` para enviar
   - `Shift + Enter` para nueva línea
   - Al enviar un mensaje, el bot se pausa automáticamente

---

## 🔧 Configuración Adicional

### Cambiar URL del Backend

Edita el archivo `.env`:

```env
VITE_API_URL=http://TU_IP:8000
VITE_WS_URL=ws://TU_IP:8000
```

Luego reinicia el servidor de desarrollo:

```bash
npm run dev
```

### Variables de Entorno Disponibles

- `VITE_API_URL`: URL base de la API (default: http://localhost:8000)
- `VITE_WS_URL`: URL del WebSocket (default: ws://localhost:8000)

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to backend"

1. Verifica que el backend esté corriendo: `http://localhost:8000/health`
2. Revisa la configuración de CORS en el backend
3. Verifica que el puerto 8000 no esté bloqueado

### Error: "WebSocket disconnected"

1. El backend debe estar corriendo
2. Verifica la URL del WebSocket en `.env`
3. Revisa la consola del navegador para más detalles

### Los pedidos no aparecen

1. Verifica que estés autenticado (login exitoso)
2. Comprueba que hay pedidos en la base de datos
3. Revisa los filtros de fecha (por defecto: hoy)

### Los mensajes no se envían

1. Verifica que `WHATSAPP_TOKEN` esté configurado en el backend
2. Comprueba que `PHONE_NUMBER_ID` esté en el `.env` del backend
3. Revisa los logs del backend para errores

---

## 📱 Acceso desde Tablet

### Configuración para acceso en red local

1. **Obtén la IP de tu PC**:

   ```bash
   ipconfig
   # Busca "Dirección IPv4" (ej: 192.168.1.100)
   ```

2. **Inicia el frontend con host permisivo**:

   ```bash
   npm run dev -- --host
   ```

3. **Edita `.env` en la tablet** (si navegas desde otra IP):

   ```env
   VITE_API_URL=http://192.168.1.100:8000
   VITE_WS_URL=ws://192.168.1.100:8000
   ```

4. **Accede desde la tablet**:
   - URL: `http://192.168.1.100:5173`

---

## 🔄 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview

# Limpiar cache de node_modules
rm -rf node_modules
npm install
```

---

## 📊 Estructura del Proyecto

```
src/
├── main.js                 # Punto de entrada
├── App.vue                 # Componente raíz
├── router/                 # Rutas Vue Router
│   └── index.js
├── stores/                 # Stores Pinia
│   ├── auth.js             # Autenticación
│   ├── pedidos.js          # Gestión de pedidos
│   ├── clientes.js         # Gestión de clientes
│   └── websocket.js        # WebSocket
├── views/                  # Vistas principales
│   ├── LoginView.vue
│   ├── DashboardLayout.vue
│   ├── KdsView.vue
│   └── ChatView.vue
├── components/             # Componentes Vue
│   ├── common/             # Componentes compartidos
│   ├── kds/                # Componentes KDS
│   └── chat/               # Componentes Chat
├── composables/            # Composables Vue
│   ├── useApi.js           # HTTP requests
│   ├── useWebSocket.js     # WebSocket
│   └── useNotify.js        # Notificaciones
└── utils/                  # Utilidades
    ├── constants.js        # Constantes
    └── formatters.js       # Funciones de formato
```

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo en `http://localhost:8000`
- [ ] Usuario admin creado (visitar `/api/auth/first-user`)
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Login exitoso con credenciales admin
- [ ] Vista KDS carga pedidos
- [ ] Vista Chat carga clientes
- [ ] WebSocket conectado (indicador verde en sidebar)
- [ ] Notificaciones funcionando

---

## 📚 Documentación Adicional

- **Backend API**: Ver `BACKEND_DOCUMENTACION.md` en la carpeta del backend
- **Endpoints**: Ver `ENDPOINTS_FRONTEND.md` en la carpeta del backend
- **Vue 3**: https://vuejs.org/
- **Pinia**: https://pinia.vuejs.org/
- **Tailwind CSS**: https://tailwindcss.com/

---

## 🎉 ¡Listo para Usar!

Si todo funciona correctamente, deberías ver:

1. ✅ Página de login funcional
2. ✅ Dashboard con sidebar y header
3. ✅ Vista KDS con tablero Kanban
4. ✅ Vista Chat con lista de clientes
5. ✅ Indicador de conexión WebSocket en verde
6. ✅ Notificaciones toast apareciendo

**¡Disfruta tu nuevo dashboard!** 🚀
