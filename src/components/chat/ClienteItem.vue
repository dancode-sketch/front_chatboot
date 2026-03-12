<template>
  <div
    class="p-3 md:p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50"
    :class="{ 'bg-blue-50 border-l-4 border-l-blue-500': activo }"
    @click="$emit('seleccionar', cliente.telefono)"
  >
    <div class="flex items-start">
      <!-- Avatar -->
      <div
        class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
        :class="cliente.nombre ? 'bg-primary' : 'bg-gray-400'"
      >
        <span v-if="cliente.nombre" class="text-sm md:text-base">
          {{ getInitials(cliente.nombre) }}
        </span>
        <svg
          v-else
          class="w-5 h-5 md:w-6 md:h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Contenido -->
      <div class="ml-2 md:ml-3 flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center space-x-2 flex-1 min-w-0">
            <p
              class="text-sm font-semibold text-gray-900 truncate"
              :class="{ 'text-gray-500 italic': !cliente.nombre }"
            >
              {{ cliente.nombre || formatPhone(cliente.telefono) }}
            </p>
            <!-- Indicador de bot pausado -->
            <div
              v-if="cliente.bot_pausado"
              class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
              title="Bot pausado - Atención manual"
            ></div>
            <div
              v-else
              class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
              title="Bot activo"
            ></div>
          </div>
          <span
            v-if="cliente.fecha_ultimo_mensaje"
            class="text-xs text-gray-500 flex-shrink-0 ml-2"
          >
            {{ formatTime(cliente.fecha_ultimo_mensaje) }}
          </span>
        </div>

        <!-- Teléfono si tiene nombre -->
        <p v-if="cliente.nombre" class="text-xs text-gray-500 mb-1">
          {{ formatPhone(cliente.telefono) }}
        </p>

        <p
          v-if="cliente.ultimo_mensaje"
          class="text-xs md:text-sm text-gray-600 truncate"
        >
          {{ truncateText(cliente.ultimo_mensaje, 50) }}
        </p>
        <p v-else class="text-xs md:text-sm text-gray-400 italic">
          Sin mensajes
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  formatTime,
  formatPhone,
  truncateText,
  getInitials,
} from "@/utils/formatters";

defineProps({
  cliente: {
    type: Object,
    required: true,
  },
  activo: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["seleccionar"]);
</script>
