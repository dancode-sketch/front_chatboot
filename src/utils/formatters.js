import dayjs from 'dayjs'
import 'dayjs/locale/es'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('es')
dayjs.extend(relativeTime)

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato deseado (default: 'DD/MM/YYYY HH:mm')
 * @returns {string} Fecha formateada
 */
export function formatDate(date, format = 'DD/MM/YYYY HH:mm') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * Formatea solo la hora de una fecha
 * @param {string|Date} date - Fecha
 * @returns {string} Hora formateada (HH:mm)
 */
export function formatTime(date) {
  if (!date) return ''
  return dayjs(date).format('HH:mm')
}

/**
 * Formatea una fecha en tiempo relativo ("hace 5 minutos")
 * @param {string|Date} date - Fecha
 * @returns {string} Tiempo relativo
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * Formatea un monto de dinero en soles peruanos
 * @param {number} amount - Monto
 * @returns {string} Monto formateado (S/ 145.50)
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'S/ 0.00'
  return `S/ ${Number.parseFloat(amount).toFixed(2)}`
}

/**
 * Formatea un número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export function formatPhone(phone) {
  if (!phone) return ''
  
  // Si empieza con código de país, formatearlo
  if (phone.startsWith('51') && phone.length === 11) {
    return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`
  }
  
  // Formato local
  if (phone.length === 9) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`
  }
  
  return phone
}

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String
 * @returns {string} String capitalizado
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales (máximo 2)
 */
export function getInitials(name) {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts.at(-1)[0]).toUpperCase()
}

/**
 * Valida si un string es un JSON válido
 * @param {string} str - String a validar
 * @returns {boolean} True si es JSON válido
 */
export function isValidJSON(str) {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Parsea coordenadas de un mensaje de ubicación
 * @param {string} contenido - Contenido del mensaje
 * @returns {object|null} { latitude, longitude } o null
 */
export function parseLocation(contenido) {
  if (!isValidJSON(contenido)) return null
  try {
    const data = JSON.parse(contenido)
    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Genera un enlace de Google Maps desde coordenadas
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {string} URL de Google Maps
 */
export function getGoogleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}
