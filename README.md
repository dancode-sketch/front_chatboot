# 💻 Resta — Frontend Dashboard & POS

Dashboard web administrativo y punto de venta (POS) para restaurantes, construido con **Vue 3 (Composition API)**, **Vite**, **Tailwind CSS** y **Pinia**, completamente integrado con el sistema de pedidos por **WhatsApp**, **KDS en tiempo real**, **caja chica**, **gestión de delivery** y **módulo de almacén & inventario**.

---

## 🚀 Módulos Funcionales

La aplicación está organizada en 7 áreas departamentales con control de acceso basado en roles (RBAC):

### 1. 🍳 Cocina & Operaciones
- **KDS (Kitchen Display System)** (`/dashboard/kds`): Tablero Kanban reactivo en tiempo real con WebSockets (`/ws/kds`) para gestión de comandas (`PENDIENTE` → `PREPARANDO` → `LISTO`).
- **Live Chat WhatsApp** (`/dashboard/chat`): Interfaz estilo WhatsApp con divisores inteligentes de fecha ("HOY", "AYER", fechas pasadas), control de pausa del bot conversacional y deduplicación en vivo de mensajes.

### 2. 🍽️ Salón & Ventas (POS)
- **Mapa de Mesas** (`/pos/mapa`): Vista gráfica de distribución del salón con estados en tiempo real (Disponible, Ocupada, Por Cobrar).
- **Tomar Pedido** (`/pos/nueva-orden`): Punto de venta ágil para salón con modificadores (presas de pollo, guarniciones, cremas).
- **Historial de Pedidos** (`/dashboard/pedidos`): Listado general de pedidos con filtros por fecha, estado y tipo de consumo.

### 3. 💰 Finanzas (Separado del KDS)
- **Flujo de Caja** (`/dashboard/caja`): Apertura de caja, registro de gastos/egresos en efectivo, control de ingresos por método de pago (Efectivo, Yape/Plin, Tarjeta) y cierre de turno (Arqueo Z). *Acceso exclusivo para Cajero y Admin.*

### 4. 🛵 Delivery & Envíos
- **Asignación de Pedidos** (`/admin/asignacion-pedidos`): Asignación de pedidos listos de cocina hacia motorizados disponibles ordenados por cercanía en km.
- **Gestión de Motorizados** (`/admin/motorizados`): Alta de repartidores, teléfonos, usuarios y contraseñas/PINs, con control de disponibilidad en línea.
- **Tarifas & Cobertura** (`/admin/delivery`): Configuración de radio máximo de reparto (km), costo base y tarifa por km adicional.
- **Portal Móvil de Repartidor** (`/motorizado/login` y `/motorizado/panel`): Vista optimizada para smartphones donde el repartidor visualiza sus pedidos en ruta, mapa de navegación y confirmación de entrega.

### 5. 📦 Almacén & Inventario (Nuevo)
- **Stock de Insumos** (`/admin/inventario/insumos`): Control de existencias actuales, stocks mínimos, costos unitarios y alertas de reposición para carnes, abarrotes y descartables.
- **Recetarios / Escandallos (BOM)** (`/admin/inventario/recetas`): Fichas técnicas por plato que desglosan insumos consumidos por porción, costo teórico y margen bruto.
- **Movimientos & Mermas** (`/admin/inventario/movimientos`): Registro de compras/entradas, salidas automáticas por venta y registro de mermas operativas de cocina.

### 6. 📋 Carta & Menú
- **Categorías** (`/admin/catalog/categories`): Gestión de familias de productos.
- **Platos y Productos** (`/admin/catalog/products`): Catálogo con precios, fotos, disponibilidad y sinónimos para el bot.
- **Modificadores Globales** (`/admin/modificadores`): Grupos de opciones obligatorias y adicionales (ej. presas, bebidas, cremas).

### 7. ⚙️ Configuración General
- **Mesas / Zonas** (`/admin/mesas`): Mapeo de áreas del salón y numeración de mesas.
- **Plantillas Bot** (`/admin/templates`): Mensajes automáticos de bienvenida, horarios y despedida del chatbot.
- **Ajustes Generales** (`/admin/settings`): Datos fiscales del restaurante, moneda, teléfono y parámetros globales.

---

## 🔐 Control de Acceso por Roles (RBAC)

La navegación y las rutas están protegidas según el perfil autenticado:

| Rol | Vistas Habilitadas |
| :--- | :--- |
| **`ADMIN`** | Acceso irrestricto a todos los módulos y configuraciones (`is_superuser`). |
| **`CAJERO`** | Flujo de Caja, Historial de Pedidos, Mapa de Mesas y KDS. |
| **`MESERO`** | Mapa de Mesas, Tomar Pedidos y Consulta de Comandas. |
| **`COCINA`** | KDS Cocina y Módulo de Almacén & Inventario. |
| **`MOTORIZADO`**| Acceso exclusivo al Portal Móvil de Repartidor (`/motorizado/*`). |

> [!IMPORTANT]
> Los tokens de administrador (`auth_token`) y de repartidor (`motorizado_token`) están completamente aislados en `localStorage`. El interceptor HTTP detecta el contexto de la ruta activa para no mezclar sesiones ni provocar cierres de sesión accidentales.

---

## 📦 Instalación y Ejecución Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación correrá en `http://localhost:5173`.

### 3. Compilar para producción
```bash
npm run build
```
Genera la carpeta optimizada `dist/` en segundos sin errores.

---

## 🔧 Configuración de Entorno

En desarrollo local, el frontend utiliza el proxy configurado en `vite.config.js` para redirigir `/api`, `/ws` y `/static` hacia `http://127.0.0.1:8000`.

En producción (ej. **Cloudflare Pages**), define las siguientes variables de entorno:
```env
VITE_API_URL=https://api-resta.tudominio.com
VITE_WS_URL=wss://api-resta.tudominio.com
VITE_RESTAURANTE_LAT=-12.046374
VITE_RESTAURANTE_LON=-77.042793
```

---

## 🎨 Stack Tecnológico

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build Tool:** Vite 5
- **Estilos:** Tailwind CSS
- **Estado Global:** Pinia
- **Enrutamiento:** Vue Router 4 (Guards con validación JWT exp y RBAC)
- **Iconos:** Lucide Vue Next
- **HTTP & Tiempo Real:** Axios (con interceptores inteligentes) y WebSockets nativos
- **Fechas:** Day.js (con localización en español)
- **Notificaciones:** Vue Toastification

