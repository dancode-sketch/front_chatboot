<template>
  <!-- Overlay para móvil -->
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  ></div>

  <aside
    class="fixed lg:static w-64 bg-white border-r border-gray-200 flex flex-col h-full z-50 transition-transform duration-300 lg:transform-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-gray-200">
      <div class="flex items-center">
        <div
          class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <span class="ml-3 font-bold text-gray-900">Dashboard</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <!-- Sección Principal -->
      <div class="mb-6">
        <h3
          class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
        >
          Principal
        </h3>
        <RouterLink
          to="/dashboard/kds"
          @click="$emit('close')"
          class="flex items-center px-4 py-3 rounded-lg transition-colors"
          :class="
            isActive('/dashboard/kds')
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          "
        >
          <svg
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span class="font-medium">KDS - Pedidos</span>
          <span
            v-if="pedidosPendientes > 0"
            class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full"
          >
            {{ pedidosPendientes }}
          </span>
        </RouterLink>

        <RouterLink
          to="/dashboard/chat"
          @click="$emit('close')"
          class="flex items-center px-4 py-3 rounded-lg transition-colors"
          :class="
            isActive('/dashboard/chat')
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          "
        >
          <svg
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span class="font-medium">Chat - Clientes</span>
          <span
            v-if="mensajesStore.mensajesSinLeer > 0"
            class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full"
          >
            {{ mensajesStore.mensajesSinLeer }}
          </span>
        </RouterLink>
      </div>

      <!-- Sección Delivery -->
      <div>
        <h3
          class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
        >
          Delivery
        </h3>
        <RouterLink
          to="/admin/motorizados"
          @click="$emit('close')"
          class="flex items-center px-4 py-3 rounded-lg transition-colors"
          :class="
            isActive('/admin/motorizados')
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          "
        >
          <svg
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span class="font-medium">Motorizados</span>
        </RouterLink>

        <RouterLink
          to="/admin/asignacion-pedidos"
          @click="$emit('close')"
          class="flex items-center px-4 py-3 rounded-lg transition-colors"
          :class="
            isActive('/admin/asignacion-pedidos')
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          "
        >
          <svg
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h1m0 0l2.5 11.5M5 3h14a1 1 0 011 1v10a1 1 0 01-1 1h-4.5"
            />
          </svg>
          <span class="font-medium">Asignar Pedidos</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Connection Status -->
    <div class="px-6 py-4 border-t border-gray-200">
      <div
        class="flex items-center text-xs"
        :class="wsConnected ? 'text-green-600' : 'text-red-600'"
      >
        <div
          class="w-2 h-2 rounded-full mr-2"
          :class="wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
        ></div>
        <span>{{ wsConnected ? "Conectado" : "Desconectado" }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { usePedidosStore } from "@/stores/pedidos";
import { useWebSocketStore } from "@/stores/websocket";
import { useMensajesStore } from "@/stores/mensajes";
import { ESTADO_PEDIDO } from "@/utils/constants";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);

const route = useRoute();
const mensajesStore = useMensajesStore();
const pedidosStore = usePedidosStore();
const wsStore = useWebSocketStore();

const pedidosPendientes = computed(
  () => pedidosStore.pedidosPorEstado(ESTADO_PEDIDO.PENDIENTE).length,
);
const wsConnected = computed(() => wsStore.connected);

function isActive(path) {
  return route.path === path;
}
</script>
