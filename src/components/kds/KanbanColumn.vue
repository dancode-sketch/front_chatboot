<template>
  <div class="flex flex-col h-full min-w-[280px] sm:min-w-[300px]">
    <!-- Header de Columna -->
    <div class="mb-3 md:mb-4">
      <button
        @click="collapsed = !collapsed"
        class="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group"
      >
        <h2 class="text-base md:text-lg font-semibold text-gray-900">
          {{ titulo }}
        </h2>
        <span
          class="px-2.5 md:px-3 py-1 rounded-full text-white text-xs font-medium"
          :class="`bg-${color}-500`"
        >
          {{ pedidos.length }}
        </span>
        <!-- Icono Colapsar/Expandir -->
        <svg
          class="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200"
          :class="{ 'rotate-180': collapsed }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Lista de Pedidos -->
    <div v-show="!collapsed" class="space-y-3 transition-all duration-200">
      <template v-for="pedido in pedidos" :key="pedido.id">
        <slot :pedido="pedido" :color="color">
          <PedidoCard
            :pedido="pedido"
            @actualizar-estado="$emit('actualizar-estado', $event)"
          />
        </slot>
      </template>

      <!-- Empty State -->
      <div
        v-if="pedidos.length === 0"
        class="flex flex-col items-center justify-center py-8 md:py-12 text-gray-400"
      >
        <svg
          class="w-12 h-12 md:w-16 md:h-16 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="text-sm font-medium">Sin pedidos</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PedidoCard from "./PedidoCard.vue";

const props = defineProps({
  titulo: {
    type: String,
    required: true,
  },
  pedidos: {
    type: Array,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
  },
  defaultCollapsed: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["actualizar-estado"]);

const collapsed = ref(props.defaultCollapsed);
</script>
