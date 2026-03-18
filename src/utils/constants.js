/**
 * Constantes y configuración de la aplicación
 */

// URLs del backend
// En desarrollo usamos rutas relativas (/api, /ws) y confiamos en el proxy de Vite.
// En producción se puede inyectar la URL completa mediante variables de entorno.
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || ''

// Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  ME: '/api/auth/me',
  
  // Clientes
  CLIENTES_ACTIVOS: '/api/clientes/activos',
  MENSAJES_CLIENTE: (telefono) => `/api/clientes/${telefono}/mensajes`,
  ENVIAR_MENSAJE: (telefono) => `/api/clientes/${telefono}/mensaje`,
  TOGGLE_BOT: (telefono) => `/api/clientes/${telefono}/bot`,
  MEDIA_URL: (mediaId) => `/api/clientes/media/${mediaId}/url`,
  
  // Pedidos
  PEDIDOS: '/api/pedidos',
  PEDIDO_BY_ID: (id) => `/api/pedidos/${id}`,
  ACTUALIZAR_ESTADO: (id) => `/api/pedidos/${id}/estado`,
  PEDIDOS_LISTOS_ASIGNAR: '/api/pedidos/listos-para-asignar',
  ASIGNAR_MOTORIZADO: (id) => `/api/pedidos/${id}/asignar`,
  MIS_PEDIDOS_DELIVERY: '/api/pedidos/delivery/mis-pedidos',
  ACTUALIZAR_ESTADO_DELIVERY: (id) => `/api/pedidos/${id}/estado-delivery`,
  
  // Motorizados
  LOGIN_MOTORIZADO: '/api/motorizados/login',
  MOTORIZADOS: '/api/motorizados',
  MOTORIZADO_BY_ID: (id) => `/api/motorizados/${id}`,
  MOTORIZADO_DISPONIBILIDAD: (id) => `/api/motorizados/${id}/disponibilidad`,
  
  // WebSocket
  WS_KDS: '/ws/kds',

  // Configuración dinámica
  SETTINGS: '/api/admin/settings',

  // Catálogo
  CATEGORIES: '/api/admin/categories',
  CATEGORY_BY_ID: (id) => `/api/admin/categories/${id}`,
  PRODUCTS: '/api/admin/products',
  PRODUCT_BY_ID: (id) => `/api/admin/products/${id}`,

  // Delivery
  DELIVERY: '/api/admin/delivery',

  // Plantillas/mensajes
  TEMPLATES: '/api/admin/templates',
  TEMPLATE_BY_ID: (id) => `/api/admin/templates/${id}`,

  // Mesas / Zonas
  ZONAS: '/api/mesas/zonas',
  ZONA_BY_ID: (id) => `/api/mesas/zonas/${id}`,
  MESAS: '/api/mesas',
  MESA_BY_ID: (id) => `/api/mesas/${id}`,
  MAPA_MESAS: '/api/mesas/mapa',

  // Caja / Arqueo
  CAJA_RESUMEN: '/api/caja/resumen',
  CAJA_ABRIR: '/api/caja/abrir',
  CAJA_EGRESO: '/api/caja/egreso',
  CAJA_CERRAR: '/api/caja/cerrar',

  // Pagos
  PAGOS_POR_PEDIDO: (pedidoId) => `/api/pagos/${pedidoId}`,

  // Comandas / Cocina
  ENVIAR_ITEMS_COCINA: (pedidoId) => `/api/pedidos/${pedidoId}/items`,
  PRECUENTA: (pedidoId) => `/api/pedidos/${pedidoId}/impresion/precuenta`,
  COMANDA: (pedidoId) => `/api/pedidos/${pedidoId}/impresion/comanda`,
  PEDIDO_ITEM_ESTADO: (pedidoId, itemId) => `/api/pedidos/${pedidoId}/items/${itemId}/estado`,
}

// Estados de pedidos
export const ESTADO_PEDIDO = {
  PENDIENTE: 'PENDIENTE',
  PREPARANDO: 'PREPARANDO',
  LISTO: 'LISTO',
  ASIGNADO: 'ASIGNADO',
  EN_CAMINO: 'EN_CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO'
}

// Configuración de colores por estado
export const ESTADO_COLORS = {
  [ESTADO_PEDIDO.PENDIENTE]: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    badge: 'bg-yellow-500'
  },
  [ESTADO_PEDIDO.PREPARANDO]: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
    badge: 'bg-blue-500'
  },
  [ESTADO_PEDIDO.LISTO]: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
    badge: 'bg-green-500'
  },
  [ESTADO_PEDIDO.ASIGNADO]: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-800',
    badge: 'bg-orange-500'
  },
  [ESTADO_PEDIDO.EN_CAMINO]: {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-800',
    badge: 'bg-purple-500'
  },
  [ESTADO_PEDIDO.ENTREGADO]: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-800',
    badge: 'bg-gray-500'
  },
  [ESTADO_PEDIDO.CANCELADO]: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    badge: 'bg-red-500'
  }
}

// Labels de estados
export const ESTADO_LABELS = {
  [ESTADO_PEDIDO.PENDIENTE]: 'Pendiente',
  [ESTADO_PEDIDO.PREPARANDO]: 'Preparando',
  [ESTADO_PEDIDO.LISTO]: 'Listo',
  [ESTADO_PEDIDO.ASIGNADO]: 'Asignado',
  [ESTADO_PEDIDO.EN_CAMINO]: 'En Camino',
  [ESTADO_PEDIDO.ENTREGADO]: 'Entregado',
  [ESTADO_PEDIDO.CANCELADO]: 'Cancelado'
}

// Tipos de entrega
export const TIPO_ENTREGA = {
  DELIVERY: 'DELIVERY',
  RECOJO: 'RECOJO',
  MESA: 'MESA',
  PRESENCIAL: 'PRESENCIAL'
}

// Tipos de setting (`type` del backend)
export const SETTING_TYPES = {
  STRING: 'STRING',
  INT: 'INT',
  FLOAT: 'FLOAT',
  BOOL: 'BOOL',
  JSON: 'JSON'
}

// Tipos de mensaje
export const TIPO_MENSAJE = {
  TEXTO: 'TEXTO',
  IMAGEN: 'IMAGEN',
  UBICACION: 'UBICACION',
  ORDEN: 'ORDEN',
  AUDIO: 'AUDIO',
  STICKER: 'STICKER',
  DOCUMENTO: 'DOCUMENTO'
}

// Configuración de localStorage
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ROLES: 'auth_roles',
  MOTORIZADO_TOKEN: 'motorizado_token',
  MOTORIZADO_USER: 'motorizado_user'
}

// Límites de paginación
export const DEFAULT_LIMIT = 50
export const DEFAULT_OFFSET = 0

// Configuración de WebSocket
export const WS_RECONNECT_DELAY = 3000 // 3 segundos
export const WS_MAX_RECONNECT_ATTEMPTS = 10

// Coordenadas del restaurante
export const RESTAURANTE_LAT = import.meta.env.VITE_RESTAURANTE_LAT || '-12.046374'
export const RESTAURANTE_LON = import.meta.env.VITE_RESTAURANTE_LON || '-77.042793'

// Helper para generar link de Google Maps
export function generarLinkNavegacion(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&origin=${RESTAURANTE_LAT},${RESTAURANTE_LON}&destination=${lat},${lng}&travelmode=driving`
}
// alias para compatibilidad con imports erróneos
export const ESTADOS_PEDIDO = ESTADO_PEDIDO;

// Roles (se espera en el JWT)
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MOTORIZADO: 'MOTORIZADO'
}
