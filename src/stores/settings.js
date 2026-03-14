import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref([])
  const loading = ref(false)

  const settingsMap = computed(() => {
    const map = {}
    settings.value.forEach(s => {
      map[s.key] = s
    })
    return map
  })

  async function fetchSettings() {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.get(ENDPOINTS.SETTINGS)
      if (error) {
        console.error('Error fetching settings:', error)
        return { success: false, error }
      }
      settings.value = data || []
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function updateSettings(updates = []) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.patch(ENDPOINTS.SETTINGS, updates)
      if (error) {
        console.error('Error updating settings:', error)
        return { success: false, error }
      }
      // assume backend returns list of updated settings
      if (Array.isArray(data)) {
        // merge into local state
        data.forEach(u => {
          const idx = settings.value.findIndex(s => s.key === u.key)
          if (idx === -1) {
            settings.value.push(u)
          } else {
            settings.value[idx] = u
          }
        })
      }
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    settingsMap,
    fetchSettings,
    updateSettings
  }
})
