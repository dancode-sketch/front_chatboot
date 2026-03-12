<template>
  <div class="h-full flex flex-col p-3 md:p-6">
    <!-- Header -->
    <div class="mb-4 md:mb-6">
      <h1
        class="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2"
      >
        <Package :size="32" class="text-blue-600" /> Asignación de Pedidos
      </h1>
      <p class="text-sm text-gray-600 mt-1">
        Asigna pedidos listos a los motorizados disponibles
      </p>
    </div>

    <!-- Motorizados Disponibles (sticky en móvil) -->
    <div
      class="mb-4 md:mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg sticky top-0 z-10"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <h2
          class="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2"
        >
          <Bike :size="20" /> Motorizados Disponibles ({{
            motorizadosDisponibles.length
          }}):
        </h2>

        <button
          @click="refreshMotorizados"
          class="px-3 py-1.5 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <svg
            class="w-4 h-4"
            :class="{ 'animate-spin': loadingMotorizados }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>

      <div
        v-if="motorizadosDisponibles.length === 0"
        class="mt-3 text-sm text-gray-600"
      >
        ⚠️ No hay motorizados disponibles
      </div>
      <div v-else class="mt-3 flex flex-wrap gap-2">
        <div
          v-for="motorizado in motorizadosDisponibles"
          :key="motorizado.id"
          class="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-green-300 rounded-full text-sm"
        >
          <div
            v-if="motorizado.foto_url"
            class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0"
          >
            <img
              :src="motorizado.foto_url"
              :alt="motorizado.nombre"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          >
            {{ getInitials(motorizado.nombre) }}
          </div>
          <span class="font-medium text-gray-900">{{ motorizado.nombre }}</span>
          <span class="text-green-600">✅</span>
        </div>
      </div>
    </div>

    <!-- Pedidos Listos -->
    <div
      class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <h2 class="text-lg md:text-xl font-semibold text-gray-900">
        Pedidos Listos ({{ pedidosListos.length }}) - Ordenados por distancia
      </h2>

      <button
        @click="refreshPedidos"
        :disabled="loadingPedidos"
        class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <svg
          class="w-5 h-5"
          :class="{ 'animate-spin': loadingPedidos }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Actualizar
      </button>
    </div>

    <!-- Lista de Pedidos -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading -->
      <div
        v-if="loadingPedidos && pedidosListos.length === 0"
        class="flex items-center justify-center py-12"
      >
        <svg
          class="animate-spin h-8 w-8 text-blue-600"
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
      </div>

      <!-- Empty State -->
      <div
        v-else-if="pedidosListos.length === 0"
        class="flex flex-col items-center justify-center py-12 text-gray-400"
      >
        <svg
          class="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="text-lg font-medium">No hay pedidos listos para asignar</p>
        <p class="text-sm mt-1">
          Los pedidos con estado "LISTO" y tipo "DELIVERY" aparecerán aquí
        </p>
      </div>

      <!-- Grid de Pedidos -->
      <div
        v-else
        class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-4"
      >
        <PedidoDeliveryCard
          v-for="pedido in pedidosListos"
          :key="pedido.id"
          :pedido="pedido"
          @asignar="abrirModalAsignar"
        />
      </div>
    </div>

    <!-- Modal Asignar Motorizado -->
    <AsignarMotorizadoModal
      v-model="mostrarModalAsignar"
      :pedido="pedidoSeleccionado"
      :motorizados="motorizadosDisponibles"
      :loading="loadingAsignar"
      :error="errorAsignar"
      @asignar="handleAsignar"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Package, Bike } from "lucide-vue-next";
import { useMotorizadosStore } from "@/stores/motorizados";
import { usePedidosStore } from "@/stores/pedidos";
import { useNotify } from "@/composables/useNotify";
import { getInitials } from "@/utils/formatters";
import PedidoDeliveryCard from "@/components/delivery/PedidoDeliveryCard.vue";
import AsignarMotorizadoModal from "@/components/delivery/AsignarMotorizadoModal.vue";

const motorizadosStore = useMotorizadosStore();
const pedidosStore = usePedidosStore();
const notify = useNotify();

const loadingMotorizados = ref(false);
const loadingPedidos = ref(false);
const loadingAsignar = ref(false);
const errorAsignar = ref(null);

const pedidosListos = ref([]);
const mostrarModalAsignar = ref(false);
const pedidoSeleccionado = ref(null);

let intervalId = null;

const motorizadosDisponibles = computed(
  () => motorizadosStore.motorizadosDisponibles,
);

onMounted(() => {
  fetchInicial();

  // Auto-refresh cada 30 segundos
  intervalId = setInterval(() => {
    refreshPedidos(true); // silent refresh
  }, 30000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

async function fetchInicial() {
  await Promise.all([refreshMotorizados(), refreshPedidos()]);
}

async function refreshMotorizados() {
  loadingMotorizados.value = true;

  const { success, error } = await motorizadosStore.fetchMotorizados(
    false,
    true,
  );

  if (!success) {
    notify.error(error || "Error al cargar motorizados");
  }

  loadingMotorizados.value = false;
}

async function refreshPedidos(silent = false) {
  if (!silent) {
    loadingPedidos.value = true;
  }

  try {
    const { success, error, data } =
      await pedidosStore.fetchPedidosListosParaAsignar();

    if (!success) {
      if (!silent) {
        notify.error(error || "Error al cargar pedidos");
      }
      // Mantener la lista actual en caso de error
    } else if (data) {
      pedidosListos.value = data.pedidos || data || [];
      if (!silent && pedidosListos.value.length > 0) {
        notify.info(`${pedidosListos.value.length} pedidos listos`);
      }
    }
  } catch (err) {
    console.error("Error inesperado al cargar pedidos:", err);
    if (!silent) {
      notify.error("Error al cargar pedidos");
    }
  } finally {
    if (!silent) {
      loadingPedidos.value = false;
    }
  }
}

function abrirModalAsignar(pedido) {
  if (motorizadosDisponibles.value.length === 0) {
    notify.error("No hay motorizados disponibles");
    return;
  }

  pedidoSeleccionado.value = pedido;
  errorAsignar.value = null;
  mostrarModalAsignar.value = true;
}

async function handleAsignar({ pedidoId, motorizadoId }) {
  loadingAsignar.value = true;
  errorAsignar.value = null;

  const { success, error } = await pedidosStore.asignarMotorizado(
    pedidoId,
    motorizadoId,
  );

  if (success) {
    notify.success(`Pedido #${pedidoId} asignado correctamente`);
    mostrarModalAsignar.value = false;

    // Refrescar lista de pedidos
    await refreshPedidos();
  } else {
    errorAsignar.value = error || "Error al asignar motorizado";
  }

  loadingAsignar.value = false;
}
</script>
