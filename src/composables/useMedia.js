import { ref } from 'vue'
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants'

/**
 * Composable para manejar archivos multimedia de WhatsApp
 * Usa el endpoint proxy del backend que descarga y sirve los archivos
 */
export function useMedia() {
  const loading = ref(false)
  const mediaCache = ref(new Map()) // Cache de blob URLs

  /**
   * Descarga un archivo multimedia usando fetch con Authorization header
   * y retorna un Blob URL que puede usarse en <img>, <video>, <audio>
   * 
   * @param {string} mediaId - ID del archivo en WhatsApp
   * @returns {Promise<string|null>} Blob URL o null si falla
   */
  async function getMediaUrl(mediaId) {
    console.log('[useMedia] getMediaUrl llamado con:', mediaId);
    
    if (!mediaId) {
      console.error('[useMedia] No hay mediaId');
      return null
    }

    // Verificar si ya está en cache
    if (mediaCache.value.has(mediaId)) {
      console.log('[useMedia] Retornando desde cache:', mediaId);
      return mediaCache.value.get(mediaId)
    }

    // Obtener token JWT desde localStorage
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    console.log('[useMedia] Token encontrado:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
    
    if (!token) {
      console.error('[useMedia] No hay token de autenticacion en localStorage');
      return null
    }

    loading.value = true

    try {
      // Usar fetch con Authorization header
      const url = `${API_BASE_URL}/api/clientes/media/${mediaId}/download`
      console.log('[useMedia] Descargando desde:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.error('[useMedia] Error en respuesta:', response.status, response.statusText);
        const errorText = await response.text()
        console.error('[useMedia] Detalle:', errorText);
        return null
      }

      // Convertir a blob y crear URL
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      console.log('[useMedia] Blob URL creada:', blobUrl);
      
      // Guardar en cache
      mediaCache.value.set(mediaId, blobUrl)
      
      return blobUrl
    } catch (error) {
      console.error('[useMedia] Error descargando media:', error);
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpia el cache de blob URLs
   */
  function clearCache() {
    console.log('[useMedia] Limpiando cache de', mediaCache.value.size, 'items');
    
    // Revocar todos los blob URLs para liberar memoria
    for (const blobUrl of mediaCache.value.values()) {
      URL.revokeObjectURL(blobUrl)
    }
    
    mediaCache.value.clear()
  }

  /**
   * Limpia entradas expiradas (no implementado aún)
   */
  function cleanExpiredCache() {
    // Podriamos implementar TTL si es necesario
    console.log('[useMedia] cleanExpiredCache called (not implemented)')
  }

  return {
    loading,
    getMediaUrl,
    clearCache,
    cleanExpiredCache
  }
}
