import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)

  async function fetchProducts(activos = null) {
    loading.value = true
    try {
      const params = {}
      if (activos !== null) {
        params.activos = activos
      }
      const { data, error } = await apiHelpers.get(ENDPOINTS.PRODUCTS, { params })
      if (error) {
        console.error('Error fetching products:', error)
        return { success: false, error }
      }
      products.value = data || []
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function createProduct(payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.post(ENDPOINTS.PRODUCTS, payload)
      if (error) {
        console.error('Error creating product:', error)
        return { success: false, error }
      }
      products.value.push(data)
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id, payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.patch(ENDPOINTS.PRODUCT_BY_ID(id), payload)
      if (error) {
        console.error('Error updating product:', error)
        return { success: false, error }
      }
      const idx = products.value.findIndex(p => p.id === id)
      if (idx !== -1) products.value[idx] = data
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id) {
    loading.value = true
    try {
      const { error } = await apiHelpers.del(ENDPOINTS.PRODUCT_BY_ID(id))
      if (error) {
        console.error('Error deleting product:', error)
        return { success: false, error }
      }
      products.value = products.value.filter(p => p.id !== id)
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
