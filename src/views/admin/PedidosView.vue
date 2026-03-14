<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Nuevo pedido manual</h1>
    <form @submit.prevent="submit" class="space-y-4 max-w-md">
      <div>
        <label for="tipo" class="block text-sm font-medium text-gray-700"
          >Tipo de entrega</label
        >
        <select
          id="tipo"
          v-model="form.tipo_entrega"
          class="mt-1 block w-full border rounded px-2 py-1"
        >
          <option value="DELIVERY">Delivery</option>
          <option value="RECOJO">Recojo</option>
          <option value="MESA">Mesa</option>
          <option value="PRESENCIAL">Presencial</option>
        </select>
      </div>
      <div v-if="form.tipo_entrega === 'MESA'" class="">
        <label for="mesa" class="block text-sm font-medium text-gray-700"
          >Número de mesa / comentarios</label
        >
        <input
          id="mesa"
          v-model="form.comentario_general"
          class="mt-1 block w-full border rounded px-2 py-1"
        />
      </div>
      <div v-else>
        <label for="comentario" class="block text-sm font-medium text-gray-700"
          >Comentarios</label
        >
        <input
          id="comentario"
          v-model="form.comentario_general"
          class="mt-1 block w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label for="total" class="block text-sm font-medium text-gray-700"
          >Total (S/)</label
        >
        <input
          id="total"
          type="number"
          step="0.01"
          v-model.number="form.total"
          class="mt-1 block w-full border rounded px-2 py-1"
        />
      </div>
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded"
        :disabled="loading"
      >
        Crear pedido
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePedidosStore } from "@/stores/pedidos";
import { useNotify } from "@/composables/useNotify";

const pedidosStore = usePedidosStore();
const notify = useNotify();
const loading = ref(false);

const form = ref({
  cliente_id: 0,
  detalles: [],
  total: 0,
  tipo_entrega: "DELIVERY",
  direccion: null,
  metodo_pago: "efectivo",
  costo_delivery: 0,
  distancia_km: 0,
  cliente_latitud: null,
  cliente_longitud: null,
  comentario_general: "",
});

async function submit() {
  loading.value = true;
  const { success, error } = await pedidosStore.createPedido({ ...form.value });
  loading.value = false;
  if (success) {
    notify.success("Pedido creado correctamente");
    // reset form?
  } else {
    notify.error(error || "Error al crear pedido");
  }
}
</script>
