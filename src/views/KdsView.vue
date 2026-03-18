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

      <!-- Fecha y hora actual (solo para mostrar, no editable) -->
      <div class="text-sm text-gray-600">
        <span class="font-medium">Fecha y hora:</span>
        <span class="font-semibold ml-1">{{ currentDateTime }}</span>
      </div>
    </div>

    <!-- Tablero Kanban -->
    <!-- Móvil: 1 columna scrollable verticalmente -->
    <!-- Tablet: 2-3 columnas con scroll horizontal -->
    <!-- Desktop: 7 columnas grid normal (incluyendo estados de delivery) -->
    <div class="flex-1 overflow-auto">
      <div class="overflow-x-auto overflow-y-auto">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 md:gap-4 min-w-min pb-4"
        >
          <!-- Columna PENDIENTE -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.PENDIENTE]"
            :pedidos="pedidosPendientes"
            :color="'yellow'"
            :estado="ESTADO_PEDIDO.PENDIENTE"
            @actualizar-estado="handleActualizarEstado"
          >
            <template #default="{ pedido, color }">
              <KdsOrderCard :pedido="pedido" :color="color" />
            </template>
          </KanbanColumn>

          <!-- Columna PREPARANDO -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.PREPARANDO]"
            :pedidos="pedidosPreparando"
            :color="'blue'"
            :estado="ESTADO_PEDIDO.PREPARANDO"
            @actualizar-estado="handleActualizarEstado"
          >
            <template #default="{ pedido, color }">
              <KdsOrderCard :pedido="pedido" :color="color" />
            </template>
          </KanbanColumn>

          <!-- Columna LISTO -->
          <KanbanColumn
            :titulo="ESTADO_LABELS[ESTADO_PEDIDO.LISTO]"
            :pedidos="pedidosListos"
            :color="'green'"
            :estado="ESTADO_PEDIDO.LISTO"
            @actualizar-estado="handleActualizarEstado"
          >
            <template #default="{ pedido, color }">
              <KdsOrderCard :pedido="pedido" :color="color" />
            </template>
          </KanbanColumn>

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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { usePedidosStore } from "@/stores/pedidos";
import { useOrderStore } from "@/stores/order";
import { useNotify } from "@/composables/useNotify";
import { ESTADO_PEDIDO, ESTADO_LABELS } from "@/utils/constants";
import { formatDate } from "@/utils/formatters";
import KanbanColumn from "@/components/kds/KanbanColumn.vue";
import KdsOrderCard from "@/components/kds/KdsOrderCard.vue";

const pedidosStore = usePedidosStore();
const orderStore = useOrderStore();
const notify = useNotify();

const loading = ref(false);

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function buildGroupsFromOrders(orders) {
  const groups = {
    [ESTADO_PEDIDO.PENDIENTE]: [],
    [ESTADO_PEDIDO.PREPARANDO]: [],
    [ESTADO_PEDIDO.LISTO]: [],
  };

  orders.forEach((order) => {
    const detalles = order.detalles || order.items || [];
    const byEstado = groupBy(
      detalles,
      (d) => d.estado_cocina || ESTADO_PEDIDO.PENDIENTE,
    );

    Object.entries(byEstado).forEach(([estado, items]) => {
      if (!groups[estado]) return;
      groups[estado].push({ ...order, detalles: items });
    });
  });

  return groups;
}

const groupedPedidos = computed(() => buildGroupsFromOrders(orderStore.orders));

const pedidosPendientes = computed(
  () => groupedPedidos.value[ESTADO_PEDIDO.PENDIENTE] || [],
);
const pedidosPreparando = computed(
  () => groupedPedidos.value[ESTADO_PEDIDO.PREPARANDO] || [],
);
const pedidosListos = computed(
  () => groupedPedidos.value[ESTADO_PEDIDO.LISTO] || [],
);

// No cambiamos los otros estados (delivery/etc), seguir usando pedidosStore si los necesitas
const pedidosAsignados = computed(() => pedidosStore.pedidosAsignados);
const pedidosEnCamino = computed(() => pedidosStore.pedidosEnCamino);
const pedidosEntregados = computed(() => pedidosStore.pedidosEntregados);
const pedidosCancelados = computed(() => pedidosStore.pedidosCancelados);
const totalPedidos = computed(() => orderStore.orders.length);

// Fecha y hora actuales (se actualiza cada segundo)
const currentDateTime = ref(formatDate(new Date(), "DD/MM/YYYY HH:mm:ss"));

let clockInterval = null;

onMounted(() => {
  clockInterval = setInterval(() => {
    currentDateTime.value = formatDate(new Date(), "DD/MM/YYYY HH:mm:ss");
  }, 1000);
});

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval);
});

function formatLocalDateForInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

onMounted(async () => {
  console.log("KDS view mounted");
  await fetchPedidos();

  // También cargar datos específicos de KDS (items pendientes)
  await orderStore.fetchKdsOrders();
  console.log("KDS orders fetched", orderStore.orders);
});

async function fetchPedidos() {
  loading.value = true;

  // Siempre consultamos por la fecha actual (local) para que el KDS muestre lo de hoy.
  const filtros = {
    fecha: formatLocalDateForInput(),
  };

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
