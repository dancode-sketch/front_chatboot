<template>
  <div class="p-4">
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4"
    >
      <div>
        <h1 class="text-2xl font-bold">Mapa de Mesas</h1>
        <p class="text-sm text-gray-500">
          Toca una mesa para abrir pedido o ver comanda activa.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          @click="refresh()"
          :disabled="store.loading"
        >
          Actualizar
        </button>
        <span v-if="store.loading" class="text-sm text-gray-500"
          >Cargando...</span
        >
      </div>
    </div>

    <div
      v-if="store.zonas.length === 0"
      class="py-20 text-center text-gray-500"
    >
      No hay zonas disponibles. Verifica la configuración del backend.
    </div>

    <div v-else>
      <!--tabs-->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="zona in store.zonas"
          :key="zona.id"
          @click="selectZona(zona.id)"
          class="px-4 py-2 rounded-full font-semibold transition"
          :class="{
            'bg-blue-600 text-white': activeZonaId === zona.id,
            'bg-gray-100 text-gray-700': activeZonaId !== zona.id,
          }"
        >
          {{ zona.nombre }}
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <template v-if="zonaActiva?.mesas?.length">
          <TableCard
            v-for="mesa in zonaActiva.mesas"
            :key="mesa.id"
            :mesa="mesa"
            :now="now"
            :zoneLabel="zonaActiva.nombre"
          />
        </template>
        <div v-else class="col-span-full text-center text-gray-500 py-10">
          No hay mesas en esta zona.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useMesasStore } from "@/stores/useMesasStore";
import TableCard from "@/components/mesa/TableCard.vue";

const store = useMesasStore();
const activeZonaId = ref(null);
const now = ref(Date.now());
let intervalId = null;

const zonaActiva = computed(() => {
  return (
    store.zonas.find((z) => z.id === activeZonaId.value) ||
    store.zonas[0] ||
    null
  );
});

function selectZona(id) {
  activeZonaId.value = id;
}

async function refresh() {
  await store.fetchMapaMesas();
  if (!activeZonaId.value && store.zonas.length > 0) {
    activeZonaId.value = store.zonas[0].id;
  }
}

onMounted(async () => {
  await refresh();
  // Refrescar datos automáticamente (polling)
  store.startPolling(8000);
  // Actualizar el reloj interno para el label de tiempo de mesa
  intervalId = window.setInterval(() => {
    now.value = Date.now();
  }, 10000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  store.stopPolling();
});
</script>
