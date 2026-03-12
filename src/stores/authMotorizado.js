import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/composables/useApi'
import { ENDPOINTS, STORAGE_KEYS } from '@/utils/constants'

export const useAuthMotorizadoStore = defineStore('authMotorizado', () => {
  
  // State
  const motorizado = ref(null)
  const token = ref(null)
  const loading = ref(false)
  
  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const motorizadoActual = computed(() => motorizado.value)
  
  // Cargar desde localStorage al inicializar
  function init() {
    const savedToken = localStorage.getItem(STORAGE_KEYS.MOTORIZADO_TOKEN)
    const savedMotorizado = localStorage.getItem(STORAGE_KEYS.MOTORIZADO_USER)
    
    if (savedToken && savedMotorizado) {
      token.value = savedToken
      motorizado.value = JSON.parse(savedMotorizado)
    }
  }
  
  /**
   * Obtiene los datos actualizados del motorizado desde el servidor
   */
  async function fetchMotorizadoActual() {
    if (!motorizado.value?.id) {
      console.error('No hay motorizado en sesión')
      return { success: false, error: 'No hay motorizado en sesión' }
    }
    
    try {
      const response = await apiClient.get(ENDPOINTS.MOTORIZADO_BY_ID(motorizado.value.id))
      const data = response.data
      
      // Actualizar datos del motorizado
      motorizado.value = data
      
      // Actualizar en localStorage
      localStorage.setItem(STORAGE_KEYS.MOTORIZADO_USER, JSON.stringify(data))
      
      return { success: true, data }
    } catch (error) {
      console.error('Error obteniendo motorizado actual:', error)
      return { success: false, error: error.response?.data?.detail || error.message }
    }
  }

  /**
   * Login de motorizado
   */
  async function login(credentials) {
    loading.value = true
    
    try {
      const response = await apiClient.post(ENDPOINTS.LOGIN_MOTORIZADO, credentials)
      const data = response.data
      
      console.log('🔐 Login response:', data)
      console.log('👤 Motorizado:', data.motorizado)
      console.log('📍 Disponible inicial:', data.motorizado?.disponible)
      
      // Guardar token y datos del motorizado
      token.value = data.access_token
      motorizado.value = data.motorizado
      
      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEYS.MOTORIZADO_TOKEN, data.access_token)
      localStorage.setItem(STORAGE_KEYS.MOTORIZADO_USER, JSON.stringify(data.motorizado))
      
      // Obtener datos actualizados del servidor (con disponibilidad correcta)
      console.log('🔄 Obteniendo datos actualizados...')
      const fetchResult = await fetchMotorizadoActual()
      console.log('✅ Datos actualizados:', fetchResult)
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Logout de motorizado
   */
  function logout() {
    token.value = null
    motorizado.value = null
    
    localStorage.removeItem(STORAGE_KEYS.MOTORIZADO_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.MOTORIZADO_USER)
  }
  
  // Inicializar al crear el store
  init()
  
  return {
    // State
    motorizado,
    token,
    loading,
    
    // Getters
    isAuthenticated,
    motorizadoActual,
    
    // Actions
    login,
    logout,
    init,
    fetchMotorizadoActual
  }
})
