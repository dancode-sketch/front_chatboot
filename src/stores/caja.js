import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS } from '@/utils/constants'

function normalizeError(error) {
  if (!error) return 'Error de conexión con el servidor'
  if (typeof error === 'string') return error
  if (error.message) return error.message
  return String(error)
}

export const useCajaStore = defineStore('caja', () => {
  const isCajaAbierta = ref(false)
  const resumenActual = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function verificarEstadoCaja() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.get(ENDPOINTS.CAJA_RESUMEN)
      if (err) {
        const errMsg = normalizeError(err)
        error.value = errMsg
        return { success: false, error: errMsg }
      }

      resumenActual.value = data
      // El backend puede devolver `abierta` / `is_open`, pero también podemos inferir por turno_id
      isCajaAbierta.value = Boolean(
        data?.abierta ?? data?.is_open ?? data?.turno_id ?? false,
      )

      return { success: true, data }
    } catch (e) {
      const errMsg = normalizeError(e)
      error.value = errMsg
      return { success: false, error: errMsg }
    } finally {
      loading.value = false
    }
  }

  async function abrirCaja(montoInicial) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.post(ENDPOINTS.CAJA_ABRIR, {
        monto_inicial: Number(montoInicial) || 0,
      })
      if (err) {
        const errMsg = normalizeError(err)
        error.value = errMsg
        return { success: false, error: errMsg }
      }

      isCajaAbierta.value = true
      resumenActual.value = data
      return { success: true, data }
    } catch (e) {
      const errMsg = normalizeError(e)
      error.value = errMsg
      return { success: false, error: errMsg }
    } finally {
      loading.value = false
    }
  }

  async function registrarEgreso(monto, descripcion) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await apiHelpers.post(ENDPOINTS.CAJA_EGRESO, {
        monto: Number(monto) || 0,
        descripcion: descripcion || '',
      })
      if (err) {
        const errMsg = normalizeError(err)
        error.value = errMsg
        return { success: false, error: errMsg }
      }

      // refrescar resumen tras registrar egreso
      await verificarEstadoCaja()
      return { success: true, data }
    } catch (e) {
      const errMsg = normalizeError(e)
      error.value = errMsg
      return { success: false, error: errMsg }
    } finally {
      loading.value = false
    }
  }

  async function cerrarCaja(montoDeclarado) {
    loading.value = true
    error.value = null
    try {
      // El backend espera `monto_declarado_cierre`
      const payload = { monto_declarado_cierre: Number(montoDeclarado) || 0 }
      console.debug('Cerrar caja payload:', payload)
      const { data, error: err } = await apiHelpers.post(ENDPOINTS.CAJA_CERRAR, payload)
      if (err) {
        const errMsg = normalizeError(err)
        error.value = errMsg
        return { success: false, error: errMsg }
      }

      // después de cerrar caja, se marca como cerrada y se limpia el resumen
      isCajaAbierta.value = false
      resumenActual.value = null
      return { success: true, data }
    } catch (e) {
      const errMsg = normalizeError(e)
      error.value = errMsg
      return { success: false, error: errMsg }
    } finally {
      loading.value = false
    }
  }

  return {
    isCajaAbierta,
    resumenActual,
    loading,
    error,
    verificarEstadoCaja,
    abrirCaja,
    registrarEgreso,
    cerrarCaja,
  }
})
