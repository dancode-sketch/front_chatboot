<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="close"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div class="flex items-start justify-between">
        <h2 class="text-lg font-semibold">Resumen de cierre de caja</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <div class="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p class="text-sm font-medium text-gray-600">Descuadre</p>
          <p
            class="text-2xl font-semibold"
            :class="{
              'text-red-600': Number(descuadre) < 0,
              'text-green-600': Number(descuadre) > 0,
              'text-gray-800': Number(descuadre) === 0,
            }"
          >
            S/ {{ format(descuadre) }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-lg border border-gray-200 p-4">
            <p class="text-xs text-gray-500">Esperado</p>
            <p class="text-lg font-semibold">S/ {{ format(esperado) }}</p>
          </div>
          <div class="rounded-lg border border-gray-200 p-4">
            <p class="text-xs text-gray-500">Declarado</p>
            <p class="text-lg font-semibold">S/ {{ format(declarado) }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          @click="close"
        >
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  descuadre: [String, Number],
  esperado: [String, Number],
  declarado: [String, Number],
});

const emit = defineEmits(["update:modelValue", "close"]);

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function format(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
}
</script>
