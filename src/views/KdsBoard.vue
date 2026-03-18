<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Tablero de Cocina (KDS)</h1>
    <div>
      <KdsOrderCard
        v-for="pedido in pedidos"
        :key="pedido.id"
        :pedido="pedido"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useOrderStore } from "@/stores/order";
import KdsOrderCard from "@/components/kds/KdsOrderCard.vue";

const orderStore = useOrderStore();
const pedidos = computed(() => orderStore.orders);

onMounted(async () => {
  await orderStore.fetchKdsOrders();
  console.log("KDS fetchKdsOrders result", orderStore.orders);
});
</script>
