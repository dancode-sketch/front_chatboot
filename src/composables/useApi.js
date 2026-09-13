import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Instancia de axios para usar en stores (sin router)
 * Esta no redirige automáticamente en errores 401
 */
export const apiClient = axios.create({
  // Permitimos usar un base URL configurable (VITE_API_URL).
  // Si no se provee, dejamos que sea relativo al origen (p.ej. /api/... cuando usamos proxy Vite).
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token automáticamente (sin router)
apiClient.interceptors.request.use(
  (config) => {
    const currentPath = window.location.pathname || '';
    const motorizadoToken = localStorage.getItem(STORAGE_KEYS.MOTORIZADO_TOKEN);
    const adminToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

    // Solo usar token de motorizado si estamos dentro del portal móvil /motorizado/*
    // Para cualquier ruta administrativa (/admin/*, /dashboard/*, /pos/*) se usa adminToken
    let token = null;
    if (currentPath.startsWith('/motorizado')) {
      token = motorizadoToken || adminToken;
    } else {
      token = adminToken;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas 401 (token expirado o inválido) y redirigir al login correspondiente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname || '';
      if (currentPath.startsWith('/motorizado')) {
        localStorage.removeItem(STORAGE_KEYS.MOTORIZADO_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.MOTORIZADO_USER);
        if (!currentPath.includes('/login')) {
          window.location.href = '/motorizado/login';
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.ROLES);
        if (!currentPath.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);


/**
 * Helpers para usar apiClient en stores con la misma API que useApi()
 * Retorna { data, error } en lugar de lanzar excepciones
 */
export const apiHelpers = {
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  },
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  },
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  },
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.patch(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  },
  del: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
}

function safeStringify(value) {
  const seen = new WeakSet()
  try {
    return JSON.stringify(value, (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]'
        seen.add(val)
      }
      return val
    })
  } catch {
    return String(value)
  }
}

function getErrorMessage(error) {
  if (!error) return 'Error de conexión con el servidor'
  if (typeof error === 'string') return error
  if (error.response?.data) {
    const data = error.response.data
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    if (data.message) return data.message
    return safeStringify(data)
  }
  if (error.message) return error.message
  return safeStringify(error)
}

/**
 * Composable para peticiones HTTP con autenticación automática
 * Solo usar dentro de componentes Vue
 */
export function useApi() {
  const router = useRouter()
  
  // Crear instancia de axios con configuración base
  // use relative path when no base url configured (dev proxy mode)
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // Interceptor para agregar token de autenticación
  api.interceptors.request.use(
    (config) => {
      // Determinar qué token usar según la URL de la petición
      let token = null
      
      // Decidir qué token adjuntar basándonos en la ruta actual de la UI,
      // no en el texto de la URL del API. De este modo el admin puede llamar a
      // /api/motorizados sin que se confunda con el token de motorizado.
      const currentPath = router.currentRoute?.value?.path || '';

      if (currentPath.startsWith('/motorizado')) {
        token = localStorage.getItem(STORAGE_KEYS.MOTORIZADO_TOKEN);
      } else {
        // Por defecto, asumimos que es un usuario admin/cocina
        token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  // Interceptor para manejar errores de autenticación
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Si el token expiró o es inválido, redirigir a login correspondiente
      if (error.response?.status === 401) {
        const authStore = useAuthStore()
        const currentPath = router.currentRoute?.value?.path || ''

        if (currentPath.startsWith('/motorizado')) {
          localStorage.removeItem(STORAGE_KEYS.MOTORIZADO_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.MOTORIZADO_USER)
          if (!currentPath.includes('/login')) {
            router.push('/motorizado/login')
          }
        } else {
          authStore.logout()
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER)
          localStorage.removeItem(STORAGE_KEYS.ROLES)
          if (!currentPath.includes('/login')) {
            router.push('/login')
          }
        }
      }
      return Promise.reject(error)
    }
  )
  
  /**
   * GET request
   */
  const get = async (url, config = {}) => {
    try {
      const response = await api.get(url, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
  
  /**
   * POST request
   */
  const post = async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
  
  /**
   * PUT request
   */
  const put = async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
  
  /**
   * PATCH request
   */
  const patch = async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
  
  /**
   * DELETE request
   */
  const del = async (url, config = {}) => {
    try {
      const response = await api.delete(url, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
  
  return {
    api,
    get,
    post,
    put,
    patch,
    del,
    getErrorMessage
  }
}
