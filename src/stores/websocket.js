import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { useNotify } from '@/composables/useNotify'
import { useRouter } from 'vue-router'
import { usePedidosStore } from './pedidos'
import { useClientesStore } from './clientes'
import { useMensajesStore } from './mensajes'

export const useWebSocketStore = defineStore('websocket', () => {
  // State
  const connected = ref(false)
  const reconnectAttempts = ref(0)
  
  // Composables
  const { connect, disconnect, onMessage, isConnected } = useWebSocket()
  const notify = useNotify()
  const router = useRouter()
  
  /**
   * Inicia la conexión WebSocket
   */
  function startConnection() {
    connect()
    
    // Escuchar mensajes
    onMessage((message) => {
      handleWebSocketMessage(message)
    })
  }

  // Sincronizar estado reactivo
  watch(isConnected, (val) => {
    connected.value = val
  }, { immediate: true })
  
  /**
   * Detiene la conexión WebSocket
   */
  function stopConnection() {
    disconnect()
    connected.value = false
  }
  
  /**
   * Maneja los mensajes recibidos por WebSocket
   */
  function handleWebSocketMessage(message) {
    const { event, data } = message
    
    console.log('📨 Evento WebSocket recibido:', event, data)
    
    switch (event) {
      case 'new_order':
        handleNewOrder(data)
        break
        
      case 'order_updated':
        handleOrderUpdated(data)
        break
        
      case 'new_message':
        handleNewMessage(data)
        break
        
      case 'bot_status_changed':
        handleBotStatusChanged(data)
        break
        
      default:
        console.warn('Evento WebSocket no reconocido:', event)
    }
  }
  
  /**
   * Maneja nuevo pedido
   */
  function handleNewOrder(pedidoData) {
    const pedidosStore = usePedidosStore()
    
    // Agregar pedido al store
    pedidosStore.agregarNuevoPedido(pedidoData)
    
    // Mostrar notificación
    notify.newOrder(pedidoData.id)
    
    // Reproducir sonido (opcional)
    playNotificationSound()
  }
  
  /**
   * Maneja actualización de pedido
   */
  function handleOrderUpdated(pedidoData) {
    const pedidosStore = usePedidosStore()
    
    // Actualizar pedido en el store
    pedidosStore.actualizarPedido(pedidoData)
    
    // Mostrar notificación
    if (pedidoData.estado) {
      notify.orderStatusChanged(pedidoData.id, pedidoData.estado)
    }
  }
  
  /**
   * Maneja nuevo mensaje
   */
  function handleNewMessage(mensajeData) {
    const clientesStore = useClientesStore()
    const mensajesStore = useMensajesStore()
    
    // Agregar mensaje al store
    clientesStore.agregarNuevoMensaje(mensajeData)
    
    // Si el mensaje viene de un cliente (no del bot)
    if (!mensajeData.es_bot_o_humano) {
      // Incrementar contador global y por cliente
      mensajesStore.incrementarSinLeer(mensajeData.cliente_id)
    }

    // Mostrar notificación solo si NO es del cliente actual
    if (clientesStore.clienteActual?.id !== mensajeData.cliente_id) {
      // utilizar nombre si está disponible, de lo contrario teléfono
      const clienteNombre = mensajeData.nombre || mensajeData.telefono || 'Cliente'
      notify.newMessage(clienteNombre, () => {
        router.push(`/dashboard/chat?telefono=${mensajeData.telefono}`)
      })
      
      // Reproducir sonido
      playNotificationSound()
    }
  }
  
  /**
   * Maneja cambio de estado del bot
   */
  function handleBotStatusChanged(clienteData) {
    const clientesStore = useClientesStore()
    
    // Actualizar cliente en el store
    const cliente = clientesStore.clientes.find(c => c.telefono === clienteData.telefono)
    if (cliente) {
      cliente.bot_pausado = clienteData.bot_pausado
    }
    
    // Actualizar cliente seleccionado si es el mismo
    if (clientesStore.clienteActual?.telefono === clienteData.telefono) {
      clientesStore.clienteActual.bot_pausado = clienteData.bot_pausado
    }
  }
  
  /**
   * Reproduce sonido de notificación
   */
  function playNotificationSound() {
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(err => {
        // Ignorar errores de autoplay
        console.log('No se pudo reproducir sonido:', err.message)
      })
    } catch (error) {
      // Ignorar errores
    }
  }
  
  return {
    // State
    connected,
    reconnectAttempts,
    
    // Actions
    startConnection,
    stopConnection,
    handleWebSocketMessage
  }
})
