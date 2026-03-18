import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS, ESTADO_PEDIDO, DEFAULT_LIMIT } from '@/utils/constants'

export const usePedidosStore = defineStore('pedidos', () => {
  // State
  const pedidos = ref([])
  const loading = ref(false)
  const filtroEstado = ref(null)
  const filtroFecha = ref(null)
  
  // Getters
  const pedidosPorEstado = computed(() => {
    return (estado) => pedidos.value.filter(p => p.estado === estado)
  })
  
  const pedidosPendientes = computed(() => 
    pedidos.value.filter(p => p.estado === ESTADO_PEDIDO.PENDIENTE)
  )
  
  const pedidosPreparando = computed(() => 
    pedidos.value.filter(p => p.estado === ESTADO_PEDIDO.PREPARANDO)
  )
  
  const pedidosListos = computed(() => 
    pedidos.value.filter(p => p.estado === ESTADO_PEDIDO.LISTO)
  )
  
  const pedidosAsignados = computed(() => 
    pedidos.value.filter(p => p.estado === ESTADO_PEDIDO.ASIGNADO)
  )
  
  const pedidosEnCamino = computed(() => 
    pedidos.value.filter(p => p.estado === ESTADO_PEDIDO.EN_CAMINO)
  )
  
  const pedidosEntregados = computed(() => 
    pedidos.value.filter(p => p.estado === ESTADO_PEDIDO.ENTREGADO)
  )
  
  const pedidosCancelados = computed(() => 
    pedidos.value.filter(p => p.estado === ESTADO_PEDIDO.CANCELADO)
  )
  
  const totalPedidos = computed(() => pedidos.value.length)
  
  // helper para normalizar valores recibidos del backend
  function normalizePedido(p) {
    // convertir estados y tipos a mayúsculas
    if (p.estado && typeof p.estado === 'string') {
      p.estado = p.estado.toUpperCase()
    }
    if (p.tipo_entrega && typeof p.tipo_entrega === 'string') {
      p.tipo_entrega = p.tipo_entrega.toUpperCase()
    }
    // algunos endpoints de delivery usan "pedido_id" en vez de "id"
    if (p.pedido_id && !p.id) {
      p.id = p.pedido_id
    }
    return p
  }
  
  /**
   * Obtiene los pedidos con filtros
   */
  async function fetchPedidos(filtros = {}) {
    loading.value = true
    
    try {
      const params = {
        limit: filtros.limit || DEFAULT_LIMIT,
        offset: filtros.offset || 0
      }
      
      // Si se pasa fecha exacta, usar rango [mañana 00:00, misma noche 23:59]
      if (filtros.fecha) {
        const dia = new Date(filtros.fecha)
        dia.setHours(0,0,0,0)
        const siguiente = new Date(dia)
        siguiente.setDate(dia.getDate()+1)
        params.fecha_desde = dia.toISOString()
        params.fecha_hasta = siguiente.toISOString()
      } else {
        // calcular fecha desde válida: si se envía, limitar a últimos 7 días
        let fechaDesde
        if (filtros.fecha_desde) {
          fechaDesde = new Date(filtros.fecha_desde)
          const ahora = new Date()
          const sieteDias = new Date(ahora)
          sieteDias.setDate(ahora.getDate() - 7)
          if (fechaDesde < sieteDias) {
            fechaDesde = sieteDias
          }
        } else {
          fechaDesde = new Date()
        }
        fechaDesde.setHours(0, 0, 0, 0)
        params.fecha_desde = fechaDesde.toISOString()
      }

      if (filtros.estado) {
        params.estado = filtros.estado
      }
      
      const { data, error } = await apiHelpers.get(ENDPOINTS.PEDIDOS, { params })
      
      if (error) {
        console.error('Error obteniendo pedidos:', error)
        const { useNotify } = await import('@/composables/useNotify')
        useNotify().error('No se pudieron cargar los pedidos: ' + error)
        return { success: false, error }
      }
      
      pedidos.value = data.pedidos.map(normalizePedido).map(normalizePedido)
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Actualiza el estado de un pedido
   */
  async function updateEstadoPedido(pedidoId, nuevoEstado) {
    const { data, error } = await apiHelpers.patch(ENDPOINTS.ACTUALIZAR_ESTADO(pedidoId), {
      estado: nuevoEstado
    })
    
    if (error) {
      console.error('Error actualizando estado:', error)
      return { success: false, error }
    }
    
    // Actualizar en el array local
    const index = pedidos.value.findIndex(p => p.id === pedidoId)
    if (index !== -1) {
      pedidos.value[index] = data
    }
    
    return { success: true, data }
  }
  
  /**
   * Agrega un nuevo pedido (desde WebSocket)
   */
  function agregarNuevoPedido(pedido) {
    // Verificar que no exista ya
    const existe = pedidos.value.some(p => p.id === pedido.id)
    if (!existe) {
      pedidos.value.unshift(pedido)
    }
  }
  
  /**
   * Actualiza un pedido existente (desde WebSocket)
   */
  function actualizarPedido(pedidoActualizado) {
    const index = pedidos.value.findIndex(p => p.id === pedidoActualizado.id)
    if (index !== -1) {
      pedidos.value[index] = { ...pedidos.value[index], ...pedidoActualizado }
    }
  }
  
  /**
   * Obtiene un pedido por ID
   */
  async function fetchPedidoById(pedidoId) {
    const { data, error } = await apiHelpers.get(ENDPOINTS.PEDIDO_BY_ID(pedidoId))
    
    if (error) {
      return { success: false, error }
    }
    
    return { success: true, data }
  }
  
  /**
   * Limpia los pedidos
   */
  function limpiarPedidos() {
    pedidos.value = []
  }
  
  /**
   * Agrega ítems a un pedido (ronda 2)
   */
  async function agregarItems(pedidoId, items) {
    const { data, error } = await apiHelpers.post(
      ENDPOINTS.ENVIAR_ITEMS_COCINA(pedidoId),
      { items },
    )

    if (error) {
      console.error('Error agregando items al pedido:', error)
      if (Array.isArray(error) && error.length > 0) {
        console.error('Primer error de validación:', error[0])
      }
      return { success: false, error }
    }

    // Actualizamos el pedido localmente si viene actualizado
    if (data?.pedido) {
      const index = pedidos.value.findIndex(p => p.id === pedidoId)
      if (index !== -1) pedidos.value[index] = normalizePedido(data.pedido)
    }

    return { success: true, data }
  }

  /**
   * Marca el estado de cocina de un ítem (PATCH /items/{itemId}/estado)
   */
  async function actualizarEstadoItem(pedidoId, itemId, estado) {
    const { data, error } = await apiHelpers.patch(
      ENDPOINTS.PEDIDO_ITEM_ESTADO(pedidoId, itemId),
      { estado_cocina: estado },
    )

    if (error) {
      console.error('Error actualizando estado de item:', error)
      return { success: false, error }
    }

    return { success: true, data }
  }

  /**
   * Obtiene la comanda para imprimir (KDS)
   */
  async function getComanda(pedidoId) {
    const { data, error } = await apiHelpers.get(
      ENDPOINTS.COMANDA(pedidoId),
    )

    if (error) {
      console.error('Error obteniendo comanda:', error)
      return { success: false, error }
    }

    return { success: true, data }
  }

  /**
   * Obtiene la pre-cuenta de un pedido
   */
  async function getPreCuenta(pedidoId) {
    const { data, error } = await apiHelpers.get(
      ENDPOINTS.PRECUENTA(pedidoId),
    )

    if (error) {
      console.error('Error obteniendo pre-cuenta:', error)
      return { success: false, error }
    }

    return { success: true, data }
  }

  /**
   * Obtiene pedidos listos para asignar a motorizado
   */
  async function fetchPedidosListosParaAsignar() {
    loading.value = true
    
    try {
      const { data, error } = await apiHelpers.get(ENDPOINTS.PEDIDOS_LISTOS_ASIGNAR)
      
      if (error) {
        console.error('Error obteniendo pedidos listos:', error)
        return { success: false, error }
      }
      
      // normalizar cada pedido devuelto
      if (data && data.pedidos) {
        data.pedidos = data.pedidos.map(normalizePedido)
      }
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Asigna un motorizado a un pedido
   */
  async function asignarMotorizado(pedidoId, motorizadoId) {
    loading.value = true
    
    try {
      const { data, error } = await apiHelpers.post(
        ENDPOINTS.ASIGNAR_MOTORIZADO(pedidoId),
        { motorizado_id: motorizadoId }
      )
      
      if (error) {
        console.error('Error asignando motorizado:', error)
        return { success: false, error }
      }
      
      // Actualizar en el array local
      const index = pedidos.value.findIndex(p => p.id === pedidoId)
      if (index !== -1) {
        pedidos.value[index] = data
      }
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Obtiene los pedidos del motorizado actual (para el panel)
   */

  /**
   * Crea un nuevo pedido (usado por formulario admin)
   * payload debe incluir al menos tipo_entrega y total.
   */
  async function createPedido(payload) {
    loading.value = true
    try {
      const { data, error } = await apiHelpers.post(ENDPOINTS.PEDIDOS, payload)
      if (error) {
        console.error('Error creando pedido:', error)
        return { success: false, error }
      }
      // insertar al inicio de lista local
      pedidos.value.unshift(data)
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }

  async function fetchMisPedidosDelivery() {
    loading.value = true
    
    try {
      const { data: rawData, error } = await apiHelpers.get(ENDPOINTS.MIS_PEDIDOS_DELIVERY)
      
      if (error) {
        console.error('Error obteniendo mis pedidos:', error)
        return { success: false, error }
      }
      
      let data = rawData
      if (data && Array.isArray(data)) {
        data = data.map(normalizePedido)
      }
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Actualiza el estado de un pedido desde el panel del motorizado
   */
  async function actualizarEstadoDelivery(pedidoId, nuevoEstado) {
    loading.value = true
    
    try {
      const { data, error } = await apiHelpers.patch(
        ENDPOINTS.ACTUALIZAR_ESTADO_DELIVERY(pedidoId),
        { estado: nuevoEstado }
      )
      
      if (error) {
        console.error('Error actualizando estado delivery:', error)
        return { success: false, error }
      }
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    pedidos,
    loading,
    filtroEstado,
    filtroFecha,
    
    // Getters
    pedidosPorEstado,
    pedidosPendientes,
    pedidosPreparando,
    pedidosListos,
    pedidosAsignados,
    pedidosEnCamino,
    pedidosEntregados,
    pedidosCancelados,
    totalPedidos,
    
    // Actions
    fetchPedidos,
    updateEstadoPedido,
    agregarNuevoPedido,
    actualizarPedido,
    fetchPedidoById,
    limpiarPedidos,
    agregarItems,
    actualizarEstadoItem,
    getComanda,
    getPreCuenta,
    fetchPedidosListosParaAsignar,
    asignarMotorizado,
    fetchMisPedidosDelivery,
    actualizarEstadoDelivery,
    createPedido
  }
})
