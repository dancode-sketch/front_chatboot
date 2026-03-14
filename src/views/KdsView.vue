<template>
  <div class="h-full flex flex-col p-3 md:p-6">
    <!-- Filtros y Controles -->
    <div
      class="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div class="flex items-center flex-wrap gap-3 md:gap-4">
        <!-- Botón Refresh -->
        <button
          @click="refreshPedidos"
          :disabled="loading"
          class="px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-sm"
        >
          <svg
            class="w-4 h-4 md:w-5 md:h-5"
            :class="{ 'animate-spin': loading }"
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
          <span class="text-sm font-medium">Actualizar</span>
        </button>

        <!-- Total de Pedidos -->
        <div class="text-sm text-gray-600">
          Total:
          <span class="font-semibold">{{ totalPedidos }}</span>
        </div>
      </div>

      <!-- Fecha filtro -->
      <div class="flex items-center space-x-2">
        <label class="text-xs md:text-sm text-gray-500 font-medium" for="desde"
          >Desde:</label
        >
        <input
          id="desde"
          type="date"
          :max="maxDate"
          :min="minDate"
          v-model="fechaFiltro"
          @change="fetchPedidos"
          class="text-xs md:text-sm text-gray-700 border rounded px-2 py-1"
        />
      </div>
    </div>

    <!-- Tablero Kanban -->
    <!-- Móvil: 1 columna scrollable verticalmente -->
    <!-- Tablet: 2-3 columnas con scroll horizontal -->
    <!-- Desktop: 7 columnas grid normal (incluyendo estados de delivery) -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-x-auto overflow-y-hidden">
        <div
          class="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 md:gap-4 min-w-min pb-4"
        >
          <!-- Columna PENDIENTE -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.PENDIENTE]"
            :pedidos="pedidosPendientes"
            :color="'yellow'"
            :estado="ESTADO_PEDIDO.PENDIENTE"
            @actualizar-estado="handleActualizarEstado"
          />

          <!-- Columna PREPARANDO -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.PREPARANDO]"
            :pedidos="pedidosPreparando"
            :color="'blue'"
            :estado="ESTADO_PEDIDO.PREPARANDO"
            @actualizar-estado="handleActualizarEstado"
          />

          <!-- Columna LISTO -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.LISTO]"
            :pedidos="pedidosListos"
            :color="'green'"
            :estado="ESTADO_PEDIDO.LISTO"
            @actualizar-estado="handleActualizarEstado"
          />

          <!-- Columna ASIGNADO (Delivery) -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.ASIGNADO]"
            :pedidos="pedidosAsignados"
            :color="'orange'"
            :estado="ESTADO_PEDIDO.ASIGNADO"
            @actualizar-estado="handleActualizarEstado"
          />

          <!-- Columna EN_CAMINO (Delivery) -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.EN_CAMINO]"
            :pedidos="pedidosEnCamino"
            :color="'purple'"
            :estado="ESTADO_PEDIDO.EN_CAMINO"
            @actualizar-estado="handleActualizarEstado"
          />

          <!-- Columna ENTREGADO -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.ENTREGADO]"
            :pedidos="pedidosEntregados"
            :color="'gray'"
            :estado="ESTADO_PEDIDO.ENTREGADO"
            :defaultCollapsed="true"
            @actualizar-estado="handleActualizarEstado"
          />

          <!-- Columna CANCELADO -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.CANCELADO]"
            :pedidos="pedidosCancelados"
            :color="'red'"
            :estado="ESTADO_PEDIDO.CANCELADO"
            :defaultCollapsed="true"
            @actualizar-estado="handleActualizarEstado"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { usePedidosStore } from "@/stores/pedidos";
import { useNotify } from "@/composables/useNotify";
import { ESTADO_PEDIDO, ESTADO_LABELS } from "@/utils/constants";
import { formatDate } from "@/utils/formatters";
import KanbanColumn from "@/components/kds/KanbanColumn.vue";

const pedidosStore = usePedidosStore();
const notify = useNotify();

const loading = ref(false);

const pedidosPendientes = computed(() => pedidosStore.pedidosPendientes);
const pedidosPreparando = computed(() => pedidosStore.pedidosPreparando);
const pedidosListos = computed(() => pedidosStore.pedidosListos);
const pedidosAsignados = computed(() => pedidosStore.pedidosAsignados);
const pedidosEnCamino = computed(() => pedidosStore.pedidosEnCamino);
const pedidosEntregados = computed(() => pedidosStore.pedidosEntregados);
const pedidosCancelados = computed(() => pedidosStore.pedidosCancelados);
const totalPedidos = computed(() => pedidosStore.totalPedidos);

const fechaActual = computed(() =>
  formatDate(new Date(), "DD [de] MMMM [de] YYYY"),
);

// filtro de fecha (string yyyy-mm-dd)
const fechaFiltro = ref(new Date().toISOString().substr(0, 10));

// mínimo 7 días atrás
const minDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().substr(0, 10);
});
// máximo hoy
const maxDate = computed(() => {
  return new Date().toISOString().substr(0, 10);
});

onMounted(() => {
  fetchPedidos();
});

async function fetchPedidos() {
  loading.value = true;
  const filtros = { fecha: fechaFiltro.value };
  const { success, error } = await pedidosStore.fetchPedidos(filtros);
  loading.value = false;

  if (!success) {
    notify.error(error || "Error al cargar pedidos");
  }
}

async function refreshPedidos() {
  await fetchPedidos();
  notify.success("Pedidos actualizados");
}

async function handleActualizarEstado({ pedidoId, nuevoEstado }) {
  const { success, error } = await pedidosStore.updateEstadoPedido(
    pedidoId,
    nuevoEstado,
  );

  if (success) {
    notify.success(`Pedido #${pedidoId} actualizado`);
  } else {
    notify.error(error || "Error al actualizar pedido");
  }
}
</script>
