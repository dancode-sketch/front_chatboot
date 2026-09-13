<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Recetarios y Escandallos (BOM)</h1>
        <p class="text-sm text-gray-500 mt-1">Configuración de insumos requeridos por cada plato para descuento automático en KDS</p>
      </div>
      <button
        @click="mostrarModalNuevaReceta = true"
        class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 self-start sm:self-auto"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Asignar Receta</span>
      </button>
    </div>

    <!-- Lista de Platos y sus Recetas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="receta in recetas"
        :key="receta.id"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 class="font-bold text-gray-900 text-lg">{{ receta.producto }}</h3>
            <span class="text-xs text-primary font-semibold">{{ receta.categoria }}</span>
          </div>
          <div class="text-right">
            <span class="text-xs text-gray-500 uppercase font-medium">Costo Insumos Teórico</span>
            <p class="text-lg font-bold text-gray-900">S/ {{ receta.costo_estimado.toFixed(2) }}</p>
          </div>
        </div>

        <div class="p-5">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ingredientes por porción:</p>
          <div class="space-y-2">
            <div
              v-for="(ingrediente, idx) in receta.ingredientes"
              :key="idx"
              class="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0"
            >
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-primary/70"></span>
                <span class="text-gray-700 font-medium">{{ ingrediente.nombre }}</span>
              </div>
              <span class="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                {{ ingrediente.cantidad }} {{ ingrediente.unidad }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button class="text-xs font-medium text-primary hover:underline">Editar Gramajes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mostrarModalNuevaReceta = ref(false)

const recetas = ref([
  {
    id: 1,
    producto: '1/4 de Pollo al Cilindro',
    categoria: 'Brasas & Cilindro',
    costo_estimado: 7.20,
    ingredientes: [
      { nombre: 'Pollo Entero Crudo', cantidad: 0.25, unidad: 'un' },
      { nombre: 'Papa Huamantanga', cantidad: 0.250, unidad: 'kg' },
      { nombre: 'Aceite Vegetal', cantidad: 0.05, unidad: 'lt' },
      { nombre: 'Crema de Ají Pollera', cantidad: 0.05, unidad: 'lt' },
      { nombre: 'Envase Térmico 1/4', cantidad: 1, unidad: 'un' },
      { nombre: 'Bolsa Delivery Timonel', cantidad: 1, unidad: 'un' },
    ]
  },
  {
    id: 2,
    producto: '1/2 Pollo al Cilindro',
    categoria: 'Brasas & Cilindro',
    costo_estimado: 13.80,
    ingredientes: [
      { nombre: 'Pollo Entero Crudo', cantidad: 0.50, unidad: 'un' },
      { nombre: 'Papa Huamantanga', cantidad: 0.450, unidad: 'kg' },
      { nombre: 'Aceite Vegetal', cantidad: 0.08, unidad: 'lt' },
      { nombre: 'Crema de Ají Pollera', cantidad: 0.10, unidad: 'lt' },
      { nombre: 'Envase Térmico 1/4', cantidad: 2, unidad: 'un' },
      { nombre: 'Bolsa Delivery Timonel', cantidad: 1, unidad: 'un' },
    ]
  },
  {
    id: 3,
    producto: 'Panceta al Cilindro Familiar',
    categoria: 'Especialidades',
    costo_estimado: 18.50,
    ingredientes: [
      { nombre: 'Panceta de Cerdo', cantidad: 0.400, unidad: 'kg' },
      { nombre: 'Papa Huamantanga', cantidad: 0.350, unidad: 'kg' },
      { nombre: 'Lechuga Americana', cantidad: 0.25, unidad: 'un' },
      { nombre: 'Envase Térmico 1/4', cantidad: 1, unidad: 'un' },
    ]
  }
])
</script>
