<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="close"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div class="flex items-start justify-between">
        <h2 class="text-lg font-semibold">Registrar egreso / gasto</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Monto (S/)</label
          >
          <input
            type="number"
            min="0"
            step="0.01"
            v-model.number="monto"
            class="mt-2 w-full border rounded-lg px-4 py-3 text-right"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Descripción</label
          >
          <input
            type="text"
            v-model="descripcion"
            class="mt-2 w-full border rounded-lg px-4 py-3"
            placeholder="Motivo del egreso"
          />
          <p v-if="validationError" class="mt-2 text-xs text-red-600">
            {{ validationError }}
          </p>
        </div>
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
          class="px-5 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
          @click="confirmar"
          :disabled="!monto || !descripcion.trim() || loading"
        >
          Registrar
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
const emit = defineEmits(["update:modelValue", "close", "egreso"]);

const monto = ref(0);
const descripcion = ref("");
const validationError = ref("");

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      monto.value = 0;
      descripcion.value = "";
      validationError.value = "";
    }
  },
);

watch(descripcion, (val) => {
  if (validationError.value && val.trim()) {
    validationError.value = "";
  }
});

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function confirmar() {
  if (!descripcion.value.trim()) {
    validationError.value = "La descripción es obligatoria";
    return;
  }
  emit("egreso", { monto: monto.value, descripcion: descripcion.value });
}
</script>
