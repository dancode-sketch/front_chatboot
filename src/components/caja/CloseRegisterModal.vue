<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="close"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div class="flex items-start justify-between">
        <h2 class="text-lg font-semibold">Cerrar turno</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <p class="text-sm text-gray-600 mt-2">
        Ingresa el efectivo físico que hay en la caja. La aplicación realizará
        el cálculo de arqueo y mostrará discrepancias.
      </p>

      <div class="mt-6">
        <label class="block text-sm font-medium text-gray-700">
          Efectivo en caja (S/)
        </label>
        <input
          type="number"
          v-model.number="monto"
          min="0"
          step="0.01"
          class="mt-2 w-full border rounded-lg px-4 py-3 text-lg font-semibold text-right"
          placeholder="0.00"
        />
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          @click="close"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          class="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
          :disabled="!monto || loading"
          @click="confirmar"
        >
          Cerrar turno
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
});
const emit = defineEmits(["update:modelValue", "close", "cerrar"]);

const monto = ref(0);

watch(
  () => props.modelValue,
  (val) => {
    if (!val) monto.value = 0;
  },
);

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function confirmar() {
  emit("cerrar", monto.value);
}
</script>
