import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/composables/useApi'
import { ENDPOINTS, STORAGE_KEYS } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const roles = ref([])
  const loading = ref(false)
  
  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const authHeader = computed(() => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  })
  const roleList = computed(() => roles.value.map((r) => (typeof r === 'string' ? r.toUpperCase() : r)))
  const isAdmin = computed(() => hasRole('ADMIN'))
  
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
    return roleList.value.includes(roleName.toUpperCase())
  }

  function hasAnyRole(requiredRoles) {
    if (!requiredRoles) return false
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
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
  
  /**
   * Verifica autenticación desde localStorage
   */
  async function checkAuth() {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    const storedRoles = localStorage.getItem(STORAGE_KEYS.ROLES)

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        setRoles(JSON.parse(storedRoles || '[]'))

        console.log('Checked auth user', JSON.stringify(user.value))

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
      } catch (error) {
        console.error('Error parseando usuario guardado:', error)
        logout()
      }
    }
  }
  
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
