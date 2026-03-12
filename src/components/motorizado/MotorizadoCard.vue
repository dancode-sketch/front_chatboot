<template>
  <div
    class="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200 hover:shadow-lg transition-shadow"
  >
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <!-- Foto -->
      <div class="flex-shrink-0">
        <div
          v-if="motorizado.foto_url"
          class="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-200"
        >
          <img
            :src="motorizado.foto_url"
            :alt="motorizado.nombre"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold"
        >
          {{ getInitials(motorizado.nombre) }}
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2"
        >
          <h3 class="text-lg md:text-xl font-semibold text-gray-900 truncate">
            {{ motorizado.nombre }}
          </h3>
          <div class="flex items-center gap-2">
            <!-- Badge disponibilidad -->
            <span
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="
                motorizado.esta_disponible
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              "
            >
              <Check v-if="motorizado.esta_disponible" :size="14" />
              <Pause v-else :size="14" />
              {{ motorizado.esta_disponible ? "Disponible" : "No Disponible" }}
            </span>

            <!-- Badge activo/inactivo -->
            <span
              v-if="!motorizado.is_active"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >
              <X :size="14" /> Inactivo
            </span>
          </div>
        </div>

        <div
          class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600"
        >
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
              />
            </svg>
            {{ formatPhone(motorizado.telefono) }}
          </div>

          <div class="hidden sm:block text-gray-400">•</div>

          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              />
            </svg>
            @{{ motorizado.username }}
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
        <button
          @click="$emit('editar', motorizado)"
          class="flex-1 sm:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Edit :size="16" /> Editar
        </button>
        <button
          @click="$emit('eliminar', motorizado)"
          class="flex-1 sm:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 :size="16" /> Eliminar
        </button>
      </div>
    </div>

    <!-- Toggle Disponibilidad (si está activo) -->
    <div
      v-if="motorizado.is_active"
      class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between"
    >
      <span class="text-sm font-medium text-gray-700"
        >Cambiar disponibilidad:</span
      >
      <button
        @click="toggleDisponibilidad"
        :disabled="loading"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        :class="motorizado.esta_disponible ? 'bg-green-500' : 'bg-gray-300'"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          :class="
            motorizado.esta_disponible ? 'translate-x-6' : 'translate-x-1'
          "
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Check, Pause, X, Edit, Trash2 } from "lucide-vue-next";
import { formatPhone, getInitials } from "@/utils/formatters";

const { motorizado } = defineProps({
  motorizado: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["editar", "eliminar", "cambiar-disponibilidad"]);

const loading = ref(false);

async function toggleDisponibilidad() {
  loading.value = true;
  emit("cambiar-disponibilidad", {
    motorizadoId: motorizado.id,
    disponible: !motorizado.esta_disponible,
  });
  // El loading se desactiva en el componente padre
  setTimeout(() => {
    loading.value = false;
  }, 1000);
}
</script>
