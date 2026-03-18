<template>
  <div class="h-full">
    <NewOrderPanel :initialOrder="initialOrder" @close="goBack" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import NewOrderPanel from "@/views/admin/NewOrderPanel.vue";

const route = useRoute();
const router = useRouter();

const initialOrder = computed(() => {
  const mesaId = route.query.mesa_id || route.query.mesaId;
  const mesaNombre = route.query.mesa_nombre || route.query.mesaNombre;
  return {
    tipo_entrega: "MESA",
    numero_mesa: mesaNombre ? String(mesaNombre) : mesaId ? String(mesaId) : "",
    mesa_id: mesaId ? Number(mesaId) : null,
  };
});

function goBack() {
  router.back();
}
</script>
