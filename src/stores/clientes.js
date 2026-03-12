import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiHelpers } from '@/composables/useApi'
import { ENDPOINTS, DEFAULT_LIMIT } from '@/utils/constants'

export const useClientesStore = defineStore('clientes', () => {
  // State
  const clientes = ref([])
  const clienteSeleccionado = ref(null)
  const mensajesActuales = ref([])
  const loading = ref(false)
  const loadingMensajes = ref(false)
  
  // Paginación de mensajes
  const mensajesOffset = ref(0)
  const mensajesLimit = ref(50)
  const mensajesHasMore = ref(true)
  const mensajesTotal = ref(0)
  
  // Getters
  const clienteActual = computed(() => clienteSeleccionado.value)
  
  const mensajesDelCliente = computed(() => {
    return (telefono) => {
      if (clienteSeleccionado.value?.telefono === telefono) {
        return mensajesActuales.value
      }
      return []
    }
  })
  
  /**
   * Obtiene la lista de clientes activos
   */
  async function fetchClientesActivos(filtros = {}) {
    loading.value = true
    
    try {
      const params = {
        limit: filtros.limit || DEFAULT_LIMIT,
        offset: filtros.offset || 0
      }
      
      const { data, error } = await apiHelpers.get(ENDPOINTS.CLIENTES_ACTIVOS, { params })
      
      if (error) {
        console.error('Error obteniendo clientes:', error)
        return { success: false, error }
      }
      
      clientes.value = data.clientes
      
      return { success: true, data }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Selecciona un cliente y carga sus mensajes iniciales
   */
  async function seleccionarCliente(telefono) {
    // Si ya está seleccionado, no hacer nada
    if (clienteSeleccionado.value?.telefono === telefono) {
      return { success: true }
    }
    
    // Buscar cliente en la lista
    const cliente = clientes.value.find(c => c.telefono === telefono)
    if (!cliente) {
      return { success: false, error: 'Cliente no encontrado' }
    }
    
    clienteSeleccionado.value = cliente
    
    // Resetear paginación
    mensajesOffset.value = 0
    mensajesHasMore.value = true
    mensajesActuales.value = []
    
    // Cargar mensajes iniciales
    return await fetchMensajes(telefono)
  }
  
  /**
   * Obtiene los mensajes de un cliente (con paginación)
   */
  async function fetchMensajes(telefono, resetear = false) {
    if (loadingMensajes.value) return { success: false, error: 'Ya cargando' }
    if (!mensajesHasMore.value && !resetear) return { success: true, data: [] }
    
    loadingMensajes.value = true
    
    try {
      const offset = resetear ? 0 : mensajesOffset.value
      
      const { data, error } = await apiHelpers.get(ENDPOINTS.MENSAJES_CLIENTE(telefono), {
        params: { 
          limit: mensajesLimit.value,
          offset 
        }
      })
      
      if (error) {
        console.error('Error obteniendo mensajes:', error)
        return { success: false, error }
      }
      
      // El backend puede devolver:
      // 1. Un array directo de mensajes (compatibilidad)
      // 2. Un objeto { mensajes, total, has_more, ... }
      const esPaginado = data && typeof data === 'object' && 'mensajes' in data
      const mensajes = esPaginado ? (data.mensajes || []) : (Array.isArray(data) ? data : [])
      
      // Actualizar paginación
      if (esPaginado) {
        mensajesTotal.value = data.total || 0
        mensajesHasMore.value = data.has_more !== undefined ? data.has_more : false
        mensajesOffset.value = offset + mensajes.length
      } else {
        // Sin paginación, asumir que cargó todo
        mensajesTotal.value = mensajes.length
        mensajesHasMore.value = false
        mensajesOffset.value = mensajes.length
      }
      
      // Si es resetear, reemplazar todo
      if (resetear) {
        mensajesActuales.value = mensajes
      } else {
        // Agregar al inicio (para cargar mensajes antiguos)
        // Los mensajes vienen ordenados por fecha DESC (más recientes primero)
        // Así que los invertimos y los ponemos al inicio
        const nuevosMensajes = mensajes.reverse()
        mensajesActuales.value.unshift(...nuevosMensajes)
      }
      
      return { success: true, data }
    } finally {
      loadingMensajes.value = false
    }
  }
  
  /**
   * Carga más mensajes antiguos (lazy loading)
   */
  async function cargarMensajesAntiguos() {
    if (!clienteSeleccionado.value) return { success: false, error: 'No hay cliente seleccionado' }
    return await fetchMensajes(clienteSeleccionado.value.telefono, false)
  }
  
  /**
   * Envía un mensaje manual
   */
  async function enviarMensaje(telefono, texto) {
    const { data, error } = await apiHelpers.post(ENDPOINTS.ENVIAR_MENSAJE(telefono), {
      texto
    })
    
    if (error) {
      console.error('Error enviando mensaje:', error)
      return { success: false, error }
    }
    
    // Agregar mensaje a la lista local
    if (clienteSeleccionado.value?.telefono === telefono) {
      mensajesActuales.value.push(data)
    }
    
    // Actualizar cliente en la lista para marcar que el bot está pausado
    const cliente = clientes.value.find(c => c.telefono === telefono)
    if (cliente) {
      cliente.bot_pausado = true
      cliente.ultimo_mensaje = texto
      cliente.fecha_ultimo_mensaje = data.fecha
    }
    
    return { success: true, data }
  }
  
  /**
   * Cambia el estado del bot (pausado/activo)
   */
  async function toggleBotStatus(telefono, botPausado) {
    const { data, error } = await put(ENDPOINTS.TOGGLE_BOT(telefono), {
      bot_pausado: botPausado
    })
    
    if (error) {
      console.error('Error cambiando estado del bot:', error)
      return { success: false, error }
    }
    
    // Actualizar cliente en la lista
    const cliente = clientes.value.find(c => c.telefono === telefono)
    if (cliente) {
      cliente.bot_pausado = botPausado
    }
    
    // Actualizar cliente seleccionado
    if (clienteSeleccionado.value?.telefono === telefono) {
      clienteSeleccionado.value.bot_pausado = botPausado
    }
    
    return { success: true, data }
  }
  
  /**
   * Actualiza el nombre de un cliente
   */
  async function actualizarNombreCliente(telefono, nombre) {
    if (!nombre || !nombre.trim()) {
      return { success: false, error: 'Nombre requerido' }
    }

    const { data, error } = await put(ENDPOINTS.TOGGLE_BOT(telefono), {
      nombre: nombre.trim()
    })
    
    if (error) {
      console.error('Error actualizando nombre:', error)
      return { success: false, error }
    }
    
    // Actualizar cliente en la lista
    const cliente = clientes.value.find(c => c.telefono === telefono)
    if (cliente) {
      cliente.nombre = nombre.trim()
    }
    
    // Actualizar cliente seleccionado
    if (clienteSeleccionado.value?.telefono === telefono) {
      clienteSeleccionado.value.nombre = nombre.trim()
    }
    
    return { success: true, data }
  }
  
  /**
   * Agrega un nuevo mensaje (desde WebSocket)
   */
  function agregarNuevoMensaje(mensaje) {
    // Si el mensaje es del cliente actual, agregarlo
    if (clienteSeleccionado.value?.id === mensaje.cliente_id) {
      const existe = mensajesActuales.value.some(m => m.id === mensaje.id)
      if (!existe) {
        mensajesActuales.value.push(mensaje)
      }
    }
    
    // Actualizar último mensaje en la lista de clientes
    const cliente = clientes.value.find(c => c.id === mensaje.cliente_id)
    if (cliente) {
      cliente.ultimo_mensaje = mensaje.contenido
      cliente.fecha_ultimo_mensaje = mensaje.fecha
      
      // Mover al principio de la lista
      const index = clientes.value.indexOf(cliente)
      if (index > 0) {
        clientes.value.splice(index, 1)
        clientes.value.unshift(cliente)
      }
    }
  }
  
  /**
   * Deselecciona el cliente actual
   */
  function deseleccionarCliente() {
    clienteSeleccionado.value = null
    mensajesActuales.value = []
  }
  
  return {
    // State
    clientes,
    clienteSeleccionado,
    mensajesActuales,
    loading,
    loadingMensajes,
    mensajesHasMore,
    mensajesTotal,
    
    // Getters
    clienteActual,
    mensajesDelCliente,
    
    // Actions
    fetchClientesActivos,
    seleccionarCliente,
    fetchMensajes,
    cargarMensajesAntiguos,
    enviarMensaje,
    toggleBotStatus,
    actualizarNombreCliente,
    agregarNuevoMensaje,
    deseleccionarCliente
  }
})
