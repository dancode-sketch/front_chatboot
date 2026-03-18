<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
      <h2 class="text-xl font-bold mb-4">Cobrar Pedido</h2>
      <div class="mb-4">
        <label class="block mb-1">Método de Pago</label>
        <select v-model="metodo" class="w-full border rounded p-2">
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
        </select>
      </div>

      <div v-if="metodo === 'EFECTIVO'" class="mb-4">
        <label class="block mb-1">¿Con cuánto paga?</label>
        <input
          v-model.number="conCuanto"
          type="number"
          min="0"
          class="w-full border rounded p-2"
        />
        <div class="mt-2 text-sm text-gray-600">
          Vuelto: S/ {{ vuelto.toFixed(2) }}
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="flex-1 bg-gray-200 text-gray-800 py-2 rounded"
          @click="$emit('close')"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          class="flex-1 bg-green-600 text-white py-2 rounded"
          :disabled="loading || (metodo === 'EFECTIVO' && conCuanto < total)"
          @click="confirmar"
        >
          Confirmar
        </button>
      </div>

      <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { apiClient } from "@/composables/useApi";

const props = defineProps({
  pedidoId: Number,
  total: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(["close", "success"]);

const metodo = ref("EFECTIVO");
const conCuanto = ref(0);
const loading = ref(false);
const error = ref("");

const vuelto = computed(() => {
  if (metodo.value !== "EFECTIVO") return 0;
  return Math.max(0, conCuanto.value - props.total);
});

async function confirmar() {
  loading.value = true;
  error.value = "";
  try {
    await apiClient.post(`/api/pagos/${props.pedidoId}`, {
      metodo: metodo.value,
      ...(metodo.value === "EFECTIVO" ? { con_cuanto: conCuanto.value } : {}),
    });
    emit("success");
    emit("close");
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  } finally {
    loading.value = false;
  }
}
</script>
