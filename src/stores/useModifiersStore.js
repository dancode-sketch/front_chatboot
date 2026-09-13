import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

export const useModifiersStore = defineStore('modifiers', () => {
  const modifiers = ref([])
  const loading = ref(false)

  async function fetchModifiers() {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.get(ENDPOINTS.MODIFICADORES)
      if (error) {
        console.error('Error fetching modifiers:', error)
        return { success: false, error }
      }
      modifiers.value = data || []
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function createModifier(payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.post(ENDPOINTS.MODIFICADORES, payload)
      if (error) {
        console.error('Error creating modifier group:', error)
        return { success: false, error }
      }
      modifiers.value.push(data)
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function updateModifier(id, payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.patch(ENDPOINTS.MODIFICADOR_BY_ID(id), payload)
      if (error) {
        console.error('Error updating modifier group:', error)
        return { success: false, error }
      }
      const idx = modifiers.value.findIndex((m) => m.id === id)
      if (idx !== -1) modifiers.value[idx] = data
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function deleteModifier(id) {
    loading.value = true
    try {
      const { error } = await apiHelpers.del(ENDPOINTS.MODIFICADOR_BY_ID(id))
      if (error) {
        console.error('Error deleting modifier group:', error)
        return { success: false, error }
      }
      modifiers.value = modifiers.value.filter((m) => m.id !== id)
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  return {
    modifiers,
    loading,
    fetchModifiers,
    createModifier,
    updateModifier,
    deleteModifier,
  }
})
