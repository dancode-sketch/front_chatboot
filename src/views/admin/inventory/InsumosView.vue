<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Stock de Insumos y Materia Prima</h1>
        <p class="text-sm text-gray-500 mt-1">Control de existencias para carnes, verduras, abarrotes y empaques</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="mostrarModalNuevo = true"
          class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Insumo</span>
        </button>
      </div>
    </div>

    <!-- Tarjetas de Métricas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase">Total Insumos</p>
          <p class="text-2xl font-bold text-gray-900">{{ insumos.length }}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div class="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase">Stock Óptimo</p>
          <p class="text-2xl font-bold text-green-600">{{ insumosOptimos }}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div class="w-12 h-12 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase">Por Agotar</p>
          <p class="text-2xl font-bold text-yellow-600">{{ insumosBajos }}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div class="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase">Agotados</p>
          <p class="text-2xl font-bold text-red-600">{{ insumosAgotados }}</p>
        </div>
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <input
          v-model="filtroBusqueda"
          type="text"
          placeholder="Buscar insumo por nombre o código..."
          class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div class="flex items-center space-x-2 w-full sm:w-auto">
        <select
          v-model="filtroCategoria"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
        >
          <option value="">Todas las categorías</option>
          <option value="Carnes">Carnes</option>
          <option value="Verduras">Verduras</option>
          <option value="Abarrotes">Abarrotes</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Descartables">Descartables</option>
        </select>
      </div>
    </div>

    <!-- Tabla de Insumos -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Insumo</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Actual</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="item in insumosFiltrados" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="font-medium text-gray-900">{{ item.nombre }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ item.categoria }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-bold text-gray-900">{{ item.stock_actual }}</span>
                <span class="text-xs text-gray-500 ml-1">{{ item.unidad }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.stock_minimo }} {{ item.unidad }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': item.stock_actual > item.stock_minimo,
                    'bg-yellow-100 text-yellow-800': item.stock_actual <= item.stock_minimo && item.stock_actual > 0,
                    'bg-red-100 text-red-800': item.stock_actual <= 0
                  }"
                >
                  {{ item.stock_actual <= 0 ? 'Agotado' : (item.stock_actual <= item.stock_minimo ? 'Bajo' : 'Óptimo') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary hover:text-primary/80 font-medium mr-3">Ajustar</button>
                <button class="text-gray-400 hover:text-gray-600">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filtroBusqueda = ref('')
const filtroCategoria = ref('')
const mostrarModalNuevo = ref(false)

// Datos iniciales de demostración basados en Timonel Carnes al Cilindro
const insumos = ref([
  { id: 1, nombre: 'Pollo Entero Crudo', categoria: 'Carnes', stock_actual: 48, stock_minimo: 15, unidad: 'un' },
  { id: 2, nombre: 'Panceta de Cerdo', categoria: 'Carnes', stock_actual: 18.5, stock_minimo: 8, unidad: 'kg' },
  { id: 3, nombre: 'Costillar de Cerdo', categoria: 'Carnes', stock_actual: 12.0, stock_minimo: 5, unidad: 'kg' },
  { id: 4, nombre: 'Papa Huamantanga', categoria: 'Verduras', stock_actual: 85.0, stock_minimo: 30, unidad: 'kg' },
  { id: 5, nombre: 'Lechuga Americana', categoria: 'Verduras', stock_actual: 6, stock_minimo: 8, unidad: 'un' },
  { id: 6, nombre: 'Carbón Vegetal', categoria: 'Abarrotes', stock_actual: 120, stock_minimo: 40, unidad: 'kg' },
  { id: 7, nombre: 'Aceite Vegetal', categoria: 'Abarrotes', stock_actual: 15, stock_minimo: 5, unidad: 'lt' },
  { id: 8, nombre: 'Crema de Ají Pollera', categoria: 'Abarrotes', stock_actual: 3.2, stock_minimo: 4, unidad: 'lt' },
  { id: 9, nombre: 'Inca Kola 500ml', categoria: 'Bebidas', stock_actual: 36, stock_minimo: 12, unidad: 'un' },
  { id: 10, nombre: 'Envase Térmico 1/4', categoria: 'Descartables', stock_actual: 250, stock_minimo: 80, unidad: 'un' },
  { id: 11, nombre: 'Bolsa Delivery Timonel', categoria: 'Descartables', stock_actual: 180, stock_minimo: 60, unidad: 'un' },
])

const insumosOptimos = computed(() => insumos.value.filter(i => i.stock_actual > i.stock_minimo).length)
const insumosBajos = computed(() => insumos.value.filter(i => i.stock_actual <= i.stock_minimo && i.stock_actual > 0).length)
const insumosAgotados = computed(() => insumos.value.filter(i => i.stock_actual <= 0).length)

const insumosFiltrados = computed(() => {
  return insumos.value.filter(item => {
    const matchNombre = item.nombre.toLowerCase().includes(filtroBusqueda.value.toLowerCase())
    const matchCat = !filtroCategoria.value || item.categoria === filtroCategoria.value
    return matchNombre && matchCat
  })
})
</script>
