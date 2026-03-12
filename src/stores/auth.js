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
  function checkAuth() {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
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
    authHeader,
    
    // Actions
    login,
    logout,
    checkAuth,
    fetchProfile
  }
})
