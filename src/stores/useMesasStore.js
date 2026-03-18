import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

export const useMesasStore = defineStore('mesas', () => {
  const zonas = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pollingId = ref(null)

  async function fetchMapaMesas() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.get(ENDPOINTS.MAPA_MESAS)
      if (err) {
        error.value = err
        console.error('Error fetching mapa de mesas:', err)
        return { success: false, error: err }
      }
      zonas.value = data || []
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  function startPolling(intervalMs = 8000) {
    stopPolling()
    pollingId.value = window.setInterval(async () => {
      await fetchMapaMesas()
    }, intervalMs)
  }

  function stopPolling() {
    if (pollingId.value) {
      clearInterval(pollingId.value)
      pollingId.value = null
    }
  }

  return {
    zonas,
    loading,
    error,
    fetchMapaMesas,
    startPolling,
    stopPolling
  }
})
