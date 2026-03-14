import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Instancia de axios para usar en stores (sin router)
 * Esta no redirige automáticamente en errores 401
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token automáticamente (sin router)
apiClient.interceptors.request.use(
  (config) => {
    // Prioridad: motorizado > admin
    const motorizadoToken = localStorage.getItem(STORAGE_KEYS.MOTORIZADO_TOKEN);
    const adminToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

    let token = motorizadoToken || adminToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('Enviando token:', token); // Descomenta para debug
    }
    return config;
  },
  (error) => Promise.reject(error)
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

function getErrorMessage(error) {
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'Error de conexión con el servidor'
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
    baseURL: API_BASE_URL || '/api',
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
      // Si el token expiró o es inválido, redirigir a login
      if (error.response?.status === 401) {
        const authStore = useAuthStore()
        // Determinar qué tipo de autenticación falló
        const motorizadoToken = localStorage.getItem(STORAGE_KEYS.MOTORIZADO_TOKEN)
        const adminToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
        
        // Si hay token de motorizado, limpiar y redirigir al login de motorizado
        if (motorizadoToken) {
          authStore.logout()
          localStorage.removeItem(STORAGE_KEYS.MOTORIZADO_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.MOTORIZADO_USER)
          if (!router.currentRoute?.value?.path?.includes('/login')) {
            router.push('/motorizado/login')
          }
        }
        // Si hay token de admin, limpiar y redirigir al login de admin
        else if (adminToken) {
          authStore.logout()
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER)
          if (!router.currentRoute?.value?.path?.includes('/login')) {
            router.push('/login')
          }
        }
        // Si no hay ningún token pero estamos en ruta de motorizado, no redirigir
        else if (router.currentRoute?.value?.path?.startsWith('/motorizado')) {
          // No hacer nada, dejar que el componente maneje el error
        }
        // Por defecto, redirigir a login admin solo si no estamos en login
        else if (!router.currentRoute.value.path.includes('/login')) {
          router.push('/login')
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
