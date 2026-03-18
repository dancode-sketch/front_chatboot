import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/composables/useApi'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])

  async function fetchOrders() {
    // Para lista de pedidos del mesero / comensal
    const { data } = await apiClient.get('/api/pedidos')
    orders.value = Array.isArray(data.pedidos) ? data.pedidos : data
  }

  async function fetchKdsOrders() {
    // Para tablero de cocina (items pendientes)
    // Nota: el backend no expone /api/kds/pedidos en todas las versiones,
    // así que usamos /api/pedidos y filtramos aquí.
    const { data } = await apiClient.get('/api/pedidos')
    const raw = Array.isArray(data.pedidos) ? data.pedidos : data

    // Filtrar pedidos que tienen ítems por hacer o listos (PENDIENTE, PREPARANDO o LISTO)
    orders.value = raw.filter((pedido) => {
      if (!pedido || !pedido.detalles) return false
      return pedido.detalles.some(
        (d) =>
          d.estado_cocina === 'PENDIENTE' ||
          d.estado_cocina === 'PREPARANDO' ||
          d.estado_cocina === 'LISTO',
      )
    })
  }

  function getOrderById(id) {
    return orders.value.find(o => o.id === id)
  }

  function addQty(itemId) {
    const item = findItem(itemId)
    if (item) item.cantidad++
  }

  function subQty(itemId) {
    const item = findItem(itemId)
    if (item && item.cantidad > 1) item.cantidad--
  }

  function removeItem(itemId) {
    const order = orders.value.find(o => o.items.some(i => i.id === itemId))
    if (order) order.items = order.items.filter(i => i.id !== itemId)
  }

  async function enviarItemsCocina(orderId, items) {
    await apiClient.post(`/api/pedidos/${orderId}/items`, { items })
    await fetchOrders()
  }

  async function getPreCuenta(orderId) {
    const { data } = await apiClient.get(`/api/pedidos/${orderId}/impresion/precuenta`)
    return data
  }

  async function marcarItemEstado(orderId, itemId, estado) {
    await apiClient.patch(`/api/pedidos/${orderId}/items/${itemId}/estado`, {
      estado_cocina: estado,
    })
    await fetchOrders()
  }

  async function marcarItemListo(orderId, itemId) {
    await marcarItemEstado(orderId, itemId, 'LISTO')
  }

  function findItem(itemId) {
    for (const order of orders.value) {
      const item = order.items.find(i => i.id === itemId)
      if (item) return item
    }
    return null
  }

  return {
    orders,
    fetchOrders,
    fetchKdsOrders,
    getOrderById,
    addQty,
    subQty,
    removeItem,
    enviarItemsCocina,
    getPreCuenta,
    marcarItemListo,
    marcarItemEstado,
  }
})
