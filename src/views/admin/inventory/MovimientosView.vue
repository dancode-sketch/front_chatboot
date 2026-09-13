<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Movimientos de Almacén y Mermas</h1>
        <p class="text-sm text-gray-500 mt-1">Historial de entradas por compras, salidas por ventas y registro de mermas</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="mostrarModalMerma = true"
          class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Registrar Merma</span>
        </button>
        <button
          @click="mostrarModalCompra = true"
          class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Ingresar Compra</span>
        </button>
      </div>
    </div>

    <!-- Pestañas de Filtro -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="tabActual = tab.id"
          class="py-3 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="tabActual === tab.id ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          {{ tab.nombre }}
        </button>
      </nav>
    </div>

    <!-- Tabla de Movimientos -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Fecha y Hora</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Tipo</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Insumo</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Cantidad</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Motivo / Referencia</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-500 uppercase">Responsable</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="mov in movimientosFiltrados" :key="mov.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ mov.fecha }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="{
                  'bg-green-100 text-green-800': mov.tipo === 'ENTRADA',
                  'bg-blue-100 text-blue-800': mov.tipo === 'SALIDA_VENTA',
                  'bg-red-100 text-red-800': mov.tipo === 'MERMA'
                }"
              >
                {{ mov.tipo === 'ENTRADA' ? 'Entrada (Compra)' : (mov.tipo === 'SALIDA_VENTA' ? 'Salida (Venta)' : 'Merma Cocina') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ mov.insumo }}</td>
            <td class="px-6 py-4 whitespace-nowrap font-bold" :class="mov.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'">
              {{ mov.tipo === 'ENTRADA' ? '+' : '-' }}{{ mov.cantidad }} {{ mov.unidad }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ mov.motivo }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ mov.responsable }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tabActual = ref('TODOS')
const mostrarModalMerma = ref(false)
const mostrarModalCompra = ref(false)

const tabs = [
  { id: 'TODOS', nombre: 'Todos los movimientos' },
  { id: 'ENTRADA', nombre: 'Entradas (Compras)' },
  { id: 'SALIDA_VENTA', nombre: 'Salidas por Venta (KDS)' },
  { id: 'MERMA', nombre: 'Mermas y Desperdicio' },
]

const movimientos = ref([
  { id: 1, fecha: '13/09/2026 13:58', tipo: 'SALIDA_VENTA', insumo: 'Pollo Entero Crudo', cantidad: 0.25, unidad: 'un', motivo: 'Pedido WhatsApp #104', responsable: 'Sistema KDS' },
  { id: 2, fecha: '13/09/2026 13:58', tipo: 'SALIDA_VENTA', insumo: 'Papa Huamantanga', cantidad: 0.25, unidad: 'kg', motivo: 'Pedido WhatsApp #104', responsable: 'Sistema KDS' },
  { id: 3, fecha: '13/09/2026 11:30', tipo: 'MERMA', insumo: 'Pollo Entero Crudo', cantidad: 1, unidad: 'un', motivo: 'Pollo sobrecocido en cilindro', responsable: 'Parrillero Juan' },
  { id: 4, fecha: '13/09/2026 09:15', tipo: 'ENTRADA', insumo: 'Pollo Entero Crudo', cantidad: 30, unidad: 'un', motivo: 'Factura F001-492 Avícola', responsable: 'Administrador' },
  { id: 5, fecha: '13/09/2026 09:15', tipo: 'ENTRADA', insumo: 'Papa Huamantanga', cantidad: 50, unidad: 'kg', motivo: 'Mercado Mayorista', responsable: 'Administrador' },
])

const movimientosFiltrados = computed(() => {
  if (tabActual.value === 'TODOS') return movimientos.value
  return movimientos.value.filter(m => m.tipo === tabActual.value)
})
</script>
