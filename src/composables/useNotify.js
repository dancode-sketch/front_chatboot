import { useToast } from 'vue-toastification'

/**
 * Composable para notificaciones toast
 */
export function useNotify() {
  const toast = useToast()
  
  // si quieres sonidos personalizados, coloca los archivos en /public/sounds
  const soundNewOrder = new Audio('/sounds/new-order.mp3')
  const soundNewMessage = new Audio('/sounds/new-message.mp3')
  // construimos primero el array con los dos primeros, añadiremos el resto
  const allSounds = [soundNewOrder, soundNewMessage]
  
  const soundStatus = new Audio('/sounds/status-change.mp3')
  allSounds.push(soundStatus)

  // intenta precargar y detecta si los archivos existen
  allSounds.forEach((a) => {
    a.addEventListener('error', () => console.warn('No se pudo cargar el sonido', a.src))
    a.load()
  })

  const playSound = (audio) => {
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch((err) => {
      // el navegador ha bloqueado la reproducción automática
      console.debug('playSound bloqueado o fallido:', err)
    })
  }

  /**
   * Convierte el mensaje a string si es necesario
   */
  const formatMessage = (message) => {
    if (Array.isArray(message)) {
      // Si es un array, tomar el primer elemento o concatenar
      return message[0]?.message || message[0] || 'Error desconocido'
    }
    if (typeof message === 'object' && message !== null) {
      return message.message || JSON.stringify(message)
    }
    return message || 'Error desconocido'
  }
  
  /**
   * Notificación de éxito
   */
  const success = (message) => {
    toast.success(formatMessage(message))
  }
  
  /**
   * Notificación de error
   */
  const error = (message) => {
    toast.error(formatMessage(message))
  }
  
  /**
   * Notificación de advertencia
   */
  const warning = (message) => {
    toast.warning(formatMessage(message))
  }
  
  /**
   * Notificación informativa
   */
  const info = (message) => {
    toast.info(formatMessage(message))
  }
  
  /**
   * Notificación de nuevo pedido
   */
  const newOrder = (pedidoId) => {
    playSound(soundNewOrder)
    toast.success(`✅ Nuevo pedido #${pedidoId} recibido`, {
      icon: '🔔'
    })
  }
  
  /**
   * Notificación de cambio de estado de pedido
   */
  const orderStatusChanged = (pedidoId, nuevoEstado) => {
    playSound(soundStatus)
    toast.info(`📦 Pedido #${pedidoId} → ${nuevoEstado}`, {
      icon: '📦'
    })
  }
  
  /**
   * Notificación de nuevo mensaje
   */
  const newMessage = (clienteNombre, onClick) => {
    playSound(soundNewMessage)
    toast.info(`💬 Nuevo mensaje de ${clienteNombre}`, {
      icon: '💬',
      onClick
    })
  }
  
  /**
   * Notificación de mensaje enviado
   */
  const messageSent = () => {
    toast.success('✓ Mensaje enviado')
  }
  
  /**
   * Notificación de error de conexión WebSocket
   */
  const wsDisconnected = () => {
    toast.warning('⚠️ Conexión perdida. Reconectando...', {
      timeout: false,
      closeButton: false
    })
  }
  
  /**
   * Notificación de reconexión WebSocket exitosa
   */
  const wsReconnected = () => {
    toast.success('✓ Conexión restaurada')
  }
  
  return {
    success,
    error,
    warning,
    info,
    newOrder,
    orderStatusChanged,
    newMessage,
    messageSent,
    wsDisconnected,
    wsReconnected
  }
}
