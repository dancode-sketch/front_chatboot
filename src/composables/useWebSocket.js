import { ref } from 'vue'
import { WS_BASE_URL, ENDPOINTS, WS_RECONNECT_DELAY, WS_MAX_RECONNECT_ATTEMPTS } from '@/utils/constants'

/**
 * Composable para gestionar conexión WebSocket
 */
export function useWebSocket() {
  const ws = ref(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const reconnectTimer = ref(null)
  
  /**
   * Conecta al WebSocket
   */
  const connect = () => {
    try {
      // use relative ws path when base is blank (dev proxy)
      const wsUrl = WS_BASE_URL
        ? `${WS_BASE_URL}${ENDPOINTS.WS_KDS}`
        : `${window.location.origin.replace(/^http/, 'ws')}${ENDPOINTS.WS_KDS}`
      console.log('🌐 Intentando conectar WebSocket a:', wsUrl)
      ws.value = new WebSocket(wsUrl)
      
      ws.value.onopen = () => {
        console.log('✅ WebSocket conectado')
        isConnected.value = true
        reconnectAttempts.value = 0
      }
      
      ws.value.onclose = () => {
        console.log('❌ WebSocket desconectado')
        isConnected.value = false
        
        // Intentar reconectar
        if (reconnectAttempts.value < WS_MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.value++
          console.log(`🔄 Intentando reconectar (${reconnectAttempts.value}/${WS_MAX_RECONNECT_ATTEMPTS})...`)
          
          reconnectTimer.value = setTimeout(() => {
            connect()
          }, WS_RECONNECT_DELAY)
        } else {
          console.error('❌ Máximo de intentos de reconexión alcanzado')
        }
      }
      
      ws.value.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error)
      }
      
    } catch (error) {
      console.error('❌ Error creando WebSocket:', error)
    }
  }
  
  // Exponer función para reconexión manual
  const reconnect = () => {
    if (ws.value) {
      try { ws.value.close() } catch (e) {}
    }
    isConnected.value = false
    reconnectAttempts.value = 0
    connect()
  }
  
  /**
   * Desconecta el WebSocket
   */
  const disconnect = () => {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
    
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    
    isConnected.value = false
    reconnectAttempts.value = 0
  }
  
  /**
   * Escucha mensajes del WebSocket
   */
  const onMessage = (callback) => {
    if (!ws.value) return
    
    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('❌ Error parseando mensaje WebSocket:', error)
      }
    }
  }
  
  /**
   * Envía un mensaje por WebSocket
   */
  const send = (data) => {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify(data))
    } else {
      console.warn('⚠️ WebSocket no conectado, no se puede enviar mensaje')
    }
  }
  
  return {
    ws,
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    onMessage,
    send,
    reconnect // <-- para depuración manual
  }
}
