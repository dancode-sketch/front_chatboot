<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="cerrar"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
          <!-- Header -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200"
          >
            <h3 class="text-lg font-semibold text-gray-900">
              Editar Nombre del Cliente
            </h3>
            <button
              @click="cerrar"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <!-- Teléfono -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div class="text-sm text-gray-600">
                {{ formatPhone(cliente?.telefono) }}
              </div>
            </div>

            <!-- Input de Nombre -->
            <div>
              <label
                for="nombre-input"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre
              </label>
              <input
                id="nombre-input"
                ref="nombreInput"
                v-model="nombreLocal"
                type="text"
                maxlength="100"
                placeholder="Ej: Juan Pérez"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                @keyup.enter="guardar"
                @keyup.esc="cerrar"
              />
              <p class="mt-1 text-xs text-gray-500">
                {{ nombreLocal.length }}/100 caracteres
              </p>
            </div>

            <!-- Sugerencia -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex items-start">
                <svg
                  class="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="text-sm text-blue-800">
                  <p class="font-medium">Sugerencia</p>
                  <p class="mt-1">
                    Puedes agregar alias o notas, por ejemplo: "Juan Pérez
                    (VIP)" o "María - Calle 5"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"
          >
            <button
              @click="cerrar"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="guardar"
              :disabled="!nombreLocal.trim() || loading"
              class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {{ loading ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { formatPhone } from "@/utils/formatters";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  cliente: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "guardar"]);

const nombreInput = ref(null);
const nombreLocal = ref("");

// Sincronizar nombre local con el cliente
watch(
  () => props.cliente,
  (cliente) => {
    if (cliente) {
      nombreLocal.value = cliente.nombre || "";
    }
  },
  { immediate: true },
);

// Focus automático cuando se abre el modal
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      nombreInput.value?.focus();
      nombreInput.value?.select();
    }
  },
);

function cerrar() {
  emit("update:modelValue", false);
}

function guardar() {
  const nombre = nombreLocal.value.trim();
  if (!nombre) return;

  emit("guardar", nombre);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
