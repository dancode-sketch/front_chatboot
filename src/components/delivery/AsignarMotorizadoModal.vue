<template>
  <!-- Modal Overlay -->
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="cerrar"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2
            class="text-xl font-semibold text-gray-900 flex items-center gap-2"
          >
            <Bike :size="24" class="text-blue-600" /> Asignar Pedido #{{
              pedido?.id
            }}
          </h2>
          <button
            @click="cerrar"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <!-- Info del Pedido -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">Cliente:</span>
            <span class="font-medium">{{ pedido?.cliente_nombre }}</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">Dirección:</span>
            <span
              class="text-sm text-right max-w-[200px] truncate"
              :title="pedido?.direccion_entrega"
            >
              {{ pedido?.direccion_entrega }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Distancia:</span>
            <span class="font-mono font-semibold text-purple-700">
              {{
                pedido?.distancia_km != null
                  ? (+pedido.distancia_km).toFixed(1)
                  : "-"
              }}
              km
            </span>
          </div>
        </div>

        <!-- Lista de Motorizados -->
        <div class="mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">
            Selecciona un motorizado:
          </h3>

          <div
            v-if="motorizados.length === 0"
            class="text-center py-8 text-gray-500"
          >
            <svg
              class="w-12 h-12 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p class="text-sm">No hay motorizados disponibles</p>
          </div>

          <div v-else class="space-y-2">
            <button
              v-for="motorizado in motorizados"
              :key="motorizado.id"
              @click="seleccionarMotorizado(motorizado)"
              class="w-full p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              :class="{
                'border-blue-500 bg-blue-50':
                  motorizadoSeleccionado?.id === motorizado.id,
                'border-gray-200': motorizadoSeleccionado?.id !== motorizado.id,
                'opacity-60': !motorizado.esta_disponible,
              }"
            >
              <div class="flex items-center gap-3">
                <!-- Foto/Avatar -->
                <div class="flex-shrink-0">
                  <div
                    v-if="motorizado.foto_url"
                    class="w-10 h-10 rounded-full overflow-hidden"
                  >
                    <img
                      :src="motorizado.foto_url"
                      :alt="motorizado.nombre"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold"
                  >
                    {{ getInitials(motorizado.nombre) }}
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-medium text-gray-900 truncate">
                      {{ motorizado.nombre }}
                    </p>
                    <span
                      class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-medium"
                      :class="
                        motorizado.esta_disponible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      "
                    >
                      <Check v-if="motorizado.esta_disponible" :size="12" />
                      <Pause v-else :size="12" />
                    </span>
                  </div>
                  <p class="text-xs text-gray-500">
                    {{ formatPhone(motorizado.telefono) }}
                  </p>
                </div>

                <!-- Checkmark -->
                <div
                  v-if="motorizadoSeleccionado?.id === motorizado.id"
                  class="flex-shrink-0"
                >
                  <svg
                    class="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3"
      >
        <button
          type="button"
          @click="cerrar"
          :disabled="loading"
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="confirmarAsignacion"
          :disabled="!motorizadoSeleccionado || loading"
          class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="loading"
            class="animate-spin h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{ loading ? "Asignando..." : "Asignar Pedido" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Bike, Check, Pause } from "lucide-vue-next";
import { formatPhone, getInitials } from "@/utils/formatters";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  pedido: {
    type: Object,
    default: null,
  },
  motorizados: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "asignar"]);

const motorizadoSeleccionado = ref(null);

// Reset selección cuando se abre el modal
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      motorizadoSeleccionado.value = null;
    }
  },
);

function seleccionarMotorizado(motorizado) {
  motorizadoSeleccionado.value = motorizado;
}

function confirmarAsignacion() {
  if (!motorizadoSeleccionado.value) return;

  emit("asignar", {
    pedidoId: props.pedido.id,
    motorizadoId: motorizadoSeleccionado.value.id,
  });
}

function cerrar() {
  emit("update:modelValue", false);
}
</script>
