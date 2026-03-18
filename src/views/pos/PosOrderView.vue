<template>
  <div class="h-full">
    <template v-if="loading">
      <div class="h-full flex items-center justify-center">
        <span class="text-gray-500">Cargando pedido...</span>
      </div>
    </template>
    <template v-else-if="error">
      <div class="h-full flex flex-col items-center justify-center text-center">
        <p class="text-red-600 font-semibold">Error cargando pedido</p>
        <p class="text-sm text-gray-600">{{ error }}</p>
        <button
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          @click="goBack"
        >
          Volver
        </button>
      </div>
    </template>
    <template v-else>
      <NewOrderPanel :initialOrder="pedido" @close="goBack" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePedidosStore } from "@/stores/pedidos";
import NewOrderPanel from "@/views/admin/NewOrderPanel.vue";

const route = useRoute();
const router = useRouter();
const pedidosStore = usePedidosStore();

const pedido = ref(null);
const loading = ref(true);
const error = ref("");

async function loadPedido() {
  loading.value = true;
  error.value = "";
  pedido.value = null;
  const id = route.params.id;
  if (!id) {
    error.value = "ID de pedido inválido";
    loading.value = false;
    return;
  }

  const { success, data, error: err } = await pedidosStore.fetchPedidoById(id);
  if (!success) {
    error.value = err || "No se pudo cargar el pedido";
  } else {
    pedido.value = data;
  }
  loading.value = false;
}

function goBack() {
  router.back();
}

onMounted(() => {
  loadPedido();
});
</script>
