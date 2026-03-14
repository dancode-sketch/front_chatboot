import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.get(ENDPOINTS.CATEGORIES)
      if (error) {
        console.error('Error fetching categories:', error)
        return { success: false, error }
      }
      categories.value = data || []
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function createCategory(payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.post(ENDPOINTS.CATEGORIES, payload)
      if (error) {
        console.error('Error creating category:', error)
        return { success: false, error }
      }
      categories.value.push(data)
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id, payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.patch(ENDPOINTS.CATEGORY_BY_ID(id), payload)
      if (error) {
        console.error('Error updating category:', error)
        return { success: false, error }
      }
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx !== -1) categories.value[idx] = data
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(id) {
    loading.value = true
    try {
      const { error } = await apiHelpers.del(ENDPOINTS.CATEGORY_BY_ID(id))
      if (error) {
        console.error('Error deleting category:', error)
        return { success: false, error }
      }
      categories.value = categories.value.filter(c => c.id !== id)
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
})
