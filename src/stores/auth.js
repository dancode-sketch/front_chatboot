import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/composables/useApi'
import { ENDPOINTS, STORAGE_KEYS } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  
  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const authHeader = computed(() => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  })
  const isAdmin = computed(() => {
    const r = user.value?.role
    return typeof r === 'string' && r.toUpperCase() === 'ADMIN'
  })
  
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
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        console.log('Checked auth user', JSON.stringify(user.value))
        // si es administrador cargar datos iniciales
        if (user.value?.role === 'ADMIN') {
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
    loading,
    
    // Getters
    isAuthenticated,
    isAdmin,
    authHeader,
    
    // Actions
    login,
    logout,
    checkAuth,
    fetchProfile
  }
})
