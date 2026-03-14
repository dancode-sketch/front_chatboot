import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref([])
  const loading = ref(false)

  async function fetchTemplates() {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.get(ENDPOINTS.TEMPLATES)
      if (error) {
        console.error('Error fetching templates:', error)
        return { success: false, error }
      }
      templates.value = data || []
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.post(ENDPOINTS.TEMPLATES, payload)
      if (error) {
        console.error('Error creating template:', error)
        return { success: false, error }
      }
      templates.value.push(data)
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function updateTemplate(id, payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.patch(ENDPOINTS.TEMPLATE_BY_ID(id), payload)
      if (error) {
        console.error('Error updating template:', error)
        return { success: false, error }
      }
      const idx = templates.value.findIndex(t => t.id === id)
      if (idx !== -1) templates.value[idx] = data
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function deleteTemplate(id) {
    loading.value = true
    try {
      const { error } = await apiHelpers.del(ENDPOINTS.TEMPLATE_BY_ID(id))
      if (error) {
        console.error('Error deleting template:', error)
        return { success: false, error }
      }
      templates.value = templates.value.filter(t => t.id !== id)
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
})
