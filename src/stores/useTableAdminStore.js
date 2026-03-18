import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

export const useTableAdminStore = defineStore('tableAdmin', () => {
  const zonas = ref([])
  const mesas = ref([])
  const zonaSeleccionada = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const mesasPorZona = computed(() => {
    if (!zonaSeleccionada.value) return []
    return mesas.value.filter((m) => m.zona_id === zonaSeleccionada.value.id)
  })

  async function fetchZonas() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.get(ENDPOINTS.ZONAS)
      if (err) {
        error.value = err
        console.error('Error fetching zonas:', err)
        return { success: false, error: err }
      }
      zonas.value = data || []
      // Si no hay zona seleccionada, elegir la primera automáticamente
      if (!zonaSeleccionada.value && zonas.value.length > 0) {
        zonaSeleccionada.value = zonas.value[0]
      }
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function fetchMesas(zonaId = null) {
    loading.value = true
    error.value = null
    try {
      let url = ENDPOINTS.MESAS
      if (zonaId) {
        const separator = url.includes('?') ? '&' : '?'
        url = `${url}${separator}zona_id=${zonaId}`
      }
      const { data, error: err } = await apiHelpers.get(url)
      if (err) {
        error.value = err
        console.error('Error fetching mesas:', err)
        return { success: false, error: err }
      }
      mesas.value = data || []
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function createZona(payload) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.post(ENDPOINTS.ZONAS, payload)
      if (err) {
        error.value = err
        console.error('Error creating zona:', err)
        return { success: false, error: err }
      }
      zonas.value.push(data)
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function updateZona(id, payload) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.patch(ENDPOINTS.ZONA_BY_ID(id), payload)
      if (err) {
        error.value = err
        console.error('Error updating zona:', err)
        return { success: false, error: err }
      }
      const idx = zonas.value.findIndex((z) => z.id === id)
      if (idx !== -1) {
        zonas.value[idx] = data
        if (zonaSeleccionada.value?.id === id) {
          zonaSeleccionada.value = data
        }
      }
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function deleteZona(id) {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await apiHelpers.del(ENDPOINTS.ZONA_BY_ID(id))
      if (err) {
        error.value = err
        console.error('Error deleting zona:', err)
        return { success: false, error: err }
      }
      zonas.value = zonas.value.filter((z) => z.id !== id)
      if (zonaSeleccionada.value?.id === id) {
        zonaSeleccionada.value = zonas.value[0] || null
        if (zonaSeleccionada.value) {
          await fetchMesas(zonaSeleccionada.value.id)
        } else {
          mesas.value = []
        }
      }
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  async function createMesa(payload) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.post(ENDPOINTS.MESAS, payload)
      if (err) {
        error.value = err
        console.error('Error creating mesa:', err)
        return { success: false, error: err }
      }
      mesas.value.push(data)
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function updateMesa(id, payload) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.patch(ENDPOINTS.MESA_BY_ID(id), payload)
      if (err) {
        error.value = err
        console.error('Error updating mesa:', err)
        return { success: false, error: err }
      }
      const idx = mesas.value.findIndex((m) => m.id === id)
      if (idx !== -1) mesas.value[idx] = data
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function deleteMesa(id) {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await apiHelpers.del(ENDPOINTS.MESA_BY_ID(id))
      if (err) {
        error.value = err
        console.error('Error deleting mesa:', err)
        return { success: false, error: err }
      }
      mesas.value = mesas.value.filter((m) => m.id !== id)
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  function selectZona(zona) {
    zonaSeleccionada.value = zona
  }

  return {
    zonas,
    mesas,
    zonaSeleccionada,
    mesasPorZona,
    loading,
    error,
    fetchZonas,
    fetchMesas,
    createZona,
    updateZona,
    deleteZona,
    createMesa,
    updateMesa,
    deleteMesa,
    selectZona
  }
})
