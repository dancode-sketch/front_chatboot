import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/composables/useApi'
import { ENDPOINTS, STORAGE_KEYS } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  // Helper para validar si un JWT está expirado
  function isTokenValid(tokenStr) {
    if (!tokenStr) return false
    try {
      const parts = tokenStr.split('.')
      if (parts.length !== 3) return false
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return false // Expirado
      }
      return true
    } catch {
      return false
    }
  }

  // State (inicializado desde localStorage de inmediato)
  const user = ref(null)
  const token = ref(null)
  const roles = ref([])
  const loading = ref(false)
  
  // Getters
  const isAuthenticated = computed(() => !!token.value && isTokenValid(token.value))
  const authHeader = computed(() => {
    return (token.value && isTokenValid(token.value)) ? { Authorization: `Bearer ${token.value}` } : {}
  })

  const roleList = computed(() => roles.value.map((r) => (typeof r === 'string' ? r.toUpperCase() : r)))
  const isAdmin = computed(() => {
    if (user.value?.is_superuser) return true
    return hasRole('ADMIN')
  })
  
  function normalizeRole(role) {
    if (!role) return null

    if (typeof role === 'string') {
      return role.trim().toUpperCase()
    }

    // Algunos backend pueden devolver objetos de rol
    if (typeof role === 'object') {
      const candidate = role.role || role.name || role.rol || role.codigo
      if (typeof candidate === 'string') {
        return candidate.trim().toUpperCase()
      }
    }

    return null
  }

  function setRoles(rawRoles) {
    // puede venir como string, array o undefined
    if (!rawRoles) {
      roles.value = []
      return
    }

    if (typeof rawRoles === 'string') {
      roles.value = [rawRoles.toUpperCase()]
      return
    }

    if (Array.isArray(rawRoles)) {
      roles.value = rawRoles
        .map(normalizeRole)
        .filter((r) => typeof r === 'string')
      return
    }

    roles.value = []
  }

  function hasRole(roleName) {
    if (!roleName) return false
    const name = roleName.toUpperCase()

    // Superusuario siempre tiene acceso total a cualquier rol
    if (user.value?.is_superuser) return true

    // Verificar en roleList
    if (roleList.value.includes(name)) return true

    // Verificar en user.value?.role
    if (typeof user.value?.role === 'string' && user.value.role.toUpperCase() === name) return true

    // Verificar en user.value?.roles (array)
    if (Array.isArray(user.value?.roles)) {
      return user.value.roles.some((r) => {
        if (typeof r === 'string') return r.toUpperCase() === name
        if (r && typeof r === 'object') {
          const val = r.role || r.name || r.rol || r.codigo
          return typeof val === 'string' && val.toUpperCase() === name
        }
        return false
      })
    }

    return false
  }

  function hasAnyRole(requiredRoles) {
    if (!requiredRoles) return false
    // Si es superusuario o admin, siempre tiene acceso a cualquier ruta de rol de empleado
    if (user.value?.is_superuser || roleList.value.includes('ADMIN')) return true
    const arrayRoles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles]
    return arrayRoles.some((r) => hasRole(r))
  }
  
  /**
   * Inicia sesión
   */
  async function login(username, password) {
    loading.value = true
    
    try {
      const response = await apiClient.post(ENDPOINTS.LOGIN, {
        username,
        password
      })
      
      const data = response.data
      
      // Guardar token y usuario
      token.value = data.access_token
      user.value = data.user
      // Roles viene desde backend (array) o desde user.role (string)
      setRoles(data.roles ?? data.user?.roles ?? data.user?.role)

      console.log('Login user data', JSON.stringify(user.value))
      // si el token trae un role distinto, puede actualizarse aquí

      // cargar configuración inicial para usuarios admin
      if (user.value?.role === 'ADMIN') {
        const { useSettingsStore } = await import('@/stores/settings')
        const { useCategoriesStore } = await import('@/stores/categories')
        const { useProductsStore } = await import('@/stores/products')
        const { useDeliveryStore } = await import('@/stores/delivery')
        const { useTemplatesStore } = await import('@/stores/templates')

        const settingsStore = useSettingsStore()
        const categoriesStore = useCategoriesStore()
        const productsStore = useProductsStore()
        const deliveryStore = useDeliveryStore()
        const templatesStore = useTemplatesStore()

        settingsStore.fetchSettings()
        categoriesStore.fetchCategories()
        productsStore.fetchProducts(true) // solo activos por defecto
        deliveryStore.fetchConfig()
        templatesStore.fetchTemplates()
      }
      
      // Persistir en localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles.value))
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Cierra sesión
   */
  function logout() {
    token.value = null
    user.value = null
    roles.value = []
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.ROLES)
  }
  
  /**
   * Verifica autenticación desde localStorage
   */
  async function checkAuth() {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    const storedRoles = localStorage.getItem(STORAGE_KEYS.ROLES)

    if (storedToken) {
      if (!isTokenValid(storedToken)) {
        console.warn('⚠️ Token expirado o inválido en localStorage. Cerrando sesión.')
        logout()
        return false
      }

      try {
        token.value = storedToken
        user.value = storedUser ? JSON.parse(storedUser) : null

        let loadedRoles = []
        if (storedRoles) {
          try {
            loadedRoles = JSON.parse(storedRoles)
          } catch {}
        }

        // Si no hay roles en localStorage, recuperar desde user o JWT
        if (!loadedRoles || loadedRoles.length === 0) {
          if (Array.isArray(user.value?.roles) && user.value.roles.length > 0) {
            loadedRoles = user.value.roles
          } else if (user.value?.role) {
            loadedRoles = [user.value.role]
          } else {
            try {
              const parts = storedToken.split('.')
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
                if (Array.isArray(payload.roles)) loadedRoles = payload.roles
                else if (payload.superuser) loadedRoles = ['ADMIN']
              }
            } catch {}
          }
        }

        // Si es superusuario, asegurar que ADMIN esté presente
        if (user.value?.is_superuser && !loadedRoles.includes('ADMIN')) {
          loadedRoles.push('ADMIN')
        }

        setRoles(loadedRoles)
        localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles.value))

        // si es administrador cargar datos iniciales
        if (hasRole('ADMIN')) {
          const { useSettingsStore } = await import('@/stores/settings')
          const { useCategoriesStore } = await import('@/stores/categories')
          const { useProductsStore } = await import('@/stores/products')
          const { useDeliveryStore } = await import('@/stores/delivery')
          const { useTemplatesStore } = await import('@/stores/templates')

          useSettingsStore().fetchSettings()
          useCategoriesStore().fetchCategories()
          useProductsStore().fetchProducts(true)
          useDeliveryStore().fetchConfig()
          useTemplatesStore().fetchTemplates()
        }
        return true
      } catch (error) {
        console.error('Error parseando usuario guardado:', error)
        logout()
        return false
      }
    } else {
      logout()
      return false
    }
  }

  // Inicializar inmediatamente al instanciar el store
  checkAuth()

  
  /**
   * Obtiene perfil del usuario actual
   */
  async function fetchProfile() {
    try {
      const response = await apiClient.get(ENDPOINTS.ME)
      const data = response.data
      
      user.value = data
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data))
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  return {
    // State
    user,
    token,
    roles,
    loading,
    
    // Getters
    isAuthenticated,
    isAdmin,
    roleList,
    authHeader,
    hasRole,
    hasAnyRole,
    
    // Actions
    login,
    logout,
    checkAuth,
    fetchProfile
  }
})
