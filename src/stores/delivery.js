import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

export const useDeliveryStore = defineStore('delivery', () => {
  const config = ref(null)
  const loading = ref(false)

  async function fetchConfig() {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.get(ENDPOINTS.DELIVERY)
      if (error) {
        console.error('Error fetching delivery config:', error)
        return { success: false, error }
      }
      config.value = data
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function updateConfig(payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.patch(ENDPOINTS.DELIVERY, payload)
      if (error) {
        console.error('Error updating delivery config:', error)
        return { success: false, error }
      }
      config.value = data
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  return {
    config,
    loading,
    fetchConfig,
    updateConfig
  }
})
