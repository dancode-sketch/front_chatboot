import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'
import { useAuthMotorizadoStore } from './authMotorizado'

export const useMotorizadosStore = defineStore('motorizados', () => {
  // State
  const motorizados = ref([])
  const loading = ref(false)
  
  // Getters
  const motorizadosActivos = computed(() => 
    motorizados.value.filter(m => m.is_active)
  )
  
  const motorizadosDisponibles = computed(() => 
    motorizados.value.filter(m => m.is_active && m.esta_disponible)
  )
  
  /**
   * Obtiene la lista de motorizados
   */
  async function fetchMotorizados(activos_solo = false, disponibles_solo = false) {
    loading.value = true
    
    try {
      const params = {
        activos_solo,
        disponibles_solo
      }
      
      const { data, error } = await apiHelpers.get(ENDPOINTS.MOTORIZADOS, { params })
      
      if (error) {
        console.error('Error obteniendo motorizados:', error)
        return { success: false, error }
      }
      
      motorizados.value = data
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Crea un nuevo motorizado
   */
  async function crearMotorizado(datosMotorizado) {
    loading.value = true
    
    try {
      const { data, error } = await apiHelpers.post(ENDPOINTS.MOTORIZADOS, datosMotorizado)
      
      if (error) {
        console.error('Error creando motorizado:', error)
        return { success: false, error }
      }
      
      // Agregar a la lista
      motorizados.value.push(data)
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Actualiza un motorizado existente
   */
  async function actualizarMotorizado(id, datosActualizados) {
    loading.value = true
    
    try {
      const { data, error } = await apiHelpers.patch(
        ENDPOINTS.MOTORIZADO_BY_ID(id),
        datosActualizados
      )
      
      if (error) {
        console.error('Error actualizando motorizado:', error)
        return { success: false, error }
      }
      
      // Actualizar en la lista
      const index = motorizados.value.findIndex(m => m.id === id)
      if (index !== -1) {
        motorizados.value[index] = data
      }
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Cambia la disponibilidad de un motorizado
   */
  async function cambiarDisponibilidad(id, disponible) {
    loading.value = true
    
    try {
      console.log(`🔄 Cambiando disponibilidad: ID=${id}, nuevo valor=${disponible}`)
      
      const { data, error } = await apiHelpers.patch(
        ENDPOINTS.MOTORIZADO_DISPONIBILIDAD(id),
        { esta_disponible: disponible }
      )
      
      console.log('📡 Respuesta del backend:', { data, error })
      
      if (error) {
        console.error('❌ Error cambiando disponibilidad:', error)
        return { success: false, error }
      }
      
      console.log('✅ Disponibilidad actualizada:', data)
      
      // Actualizar en la lista
      const index = motorizados.value.findIndex(m => m.id === id)
      if (index !== -1) {
        motorizados.value[index] = data
      }
      
      // Si es el motorizado actual, actualizar también su sesión
      const authMotorizado = useAuthMotorizadoStore()
      if (authMotorizado.motorizado?.id === id) {
        console.log('🔄 Actualizando sesión del motorizado actual')
        authMotorizado.motorizado.disponible = disponible
        localStorage.setItem('motorizado_user', JSON.stringify(authMotorizado.motorizado))
        console.log('✔️ Sesión actualizada:', authMotorizado.motorizado)
      }
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Elimina (desactiva) un motorizado
   */
  async function eliminarMotorizado(id) {
    loading.value = true
    
    try {
      const { error } = await apiHelpers.del(ENDPOINTS.MOTORIZADO_BY_ID(id))
      
      if (error) {
        console.error('Error eliminando motorizado:', error)
        return { success: false, error }
      }
      
      // Remover de la lista
      motorizados.value = motorizados.value.filter(m => m.id !== id)
      
      return { success: true }
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    motorizados,
    loading,
    
    // Getters
    motorizadosActivos,
    motorizadosDisponibles,
    
    // Actions
    fetchMotorizados,
    crearMotorizado,
    actualizarMotorizado,
    cambiarDisponibilidad,
    eliminarMotorizado
  }
})
