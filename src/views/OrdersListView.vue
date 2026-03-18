<template>
  <div class="p-6">
    <div
      class="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold">Pedidos Activos</h1>
        <div class="mt-2 flex flex-wrap gap-2 text-xs">
          <button
            class="px-3 py-1 rounded-full font-semibold transition"
            :class="{
              'bg-blue-600 text-white': filterTipo === 'TODOS',
              'bg-gray-100 text-gray-700': filterTipo !== 'TODOS',
            }"
            @click="filterTipo = 'TODOS'"
          >
            Todos
          </button>
          <button
            class="px-3 py-1 rounded-full font-semibold transition"
            :class="{
              'bg-yellow-600 text-white': filterTipo === 'MESA',
              'bg-gray-100 text-gray-700': filterTipo !== 'MESA',
            }"
            @click="filterTipo = 'MESA'"
          >
            Mesa
          </button>
          <button
            class="px-3 py-1 rounded-full font-semibold transition"
            :class="{
              'bg-green-600 text-white': filterTipo === 'DELIVERY',
              'bg-gray-100 text-gray-700': filterTipo !== 'DELIVERY',
            }"
            @click="filterTipo = 'DELIVERY'"
          >
            Delivery
          </button>
          <button
            class="px-3 py-1 rounded-full font-semibold transition"
            :class="{
              'bg-blue-600 text-white': filterTipo === 'RECOJO',
              'bg-gray-100 text-gray-700': filterTipo !== 'RECOJO',
            }"
            @click="filterTipo = 'RECOJO'"
          >
            Recojo
          </button>
          <button
            class="px-3 py-1 rounded-full font-semibold transition"
            :class="{
              'bg-purple-600 text-white': filterTipo === 'PRESENCIAL',
              'bg-gray-100 text-gray-700': filterTipo !== 'PRESENCIAL',
            }"
            @click="filterTipo = 'PRESENCIAL'"
          >
            Presencial
          </button>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
          @click="orderEditId = 'NEW'"
        >
          Nuevo Pedido
        </button>
        <button
          v-if="orderEditId && orderEditId !== 'NEW'"
          class="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
          @click="orderEditId = null"
        >
          Cancelar edición
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-500">
      Cargando pedidos...
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="text-center text-gray-500">
      No hay pedidos activos.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="order in visibleOrders"
        :key="order.id"
        :class="[
          'rounded shadow p-4 flex flex-col border',
          borderColorClass(order.tipo_entrega),
          bgColorClass(order.tipo_entrega),
        ]"
      >
        <div class="mb-2 flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500">{{ orderTipo(order) }}</div>
            <div class="font-semibold">
              {{ orderInfo(order) }}
            </div>
          </div>
          <span
            class="text-xs font-semibold px-2 py-1 rounded"
            :class="{
              'bg-green-100 text-green-800': order.estado === 'PREPARANDO',
              'bg-gray-100 text-gray-600': order.estado === 'ENTREGADO',
              'bg-yellow-100 text-yellow-800': order.estado === 'PENDIENTE',
            }"
          >
            {{ order.estado }}
          </span>
        </div>
        <div class="mb-2">
          <span class="font-bold">Pedido #:</span> {{ order.id }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Total:</span>
          S/ {{ (Number(order.total) || 0).toFixed(2) }}
        </div>
        <button
          class="bg-blue-600 text-white font-bold py-2 rounded mt-auto"
          @click="editar(order.id)"
        >
          Editar Comanda
        </button>
      </div>
    </div>

    <NewOrderPanel
      v-if="orderEditId"
      :initialOrder="
        orderEditId === 'NEW' ? null : orders.find((o) => o.id === orderEditId)
      "
      @close="orderEditId = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useOrderStore } from "@/stores/order";
import NewOrderPanel from "@/views/admin/NewOrderPanel.vue";

const orderStore = useOrderStore();
const orderEditId = ref(null);
const loading = ref(false);
const error = ref("");

const orders = computed(() => orderStore.orders);

const filterTipo = ref("TODOS");

const visibleOrders = computed(() => {
  const base = orders.value.filter((o) => o.estado !== "ENTREGADO");
  if (filterTipo.value === "TODOS") return base;
  return base.filter((o) => o.tipo_entrega === filterTipo.value);
});

function orderTipo(order) {
  const tipo = (order.tipo_entrega || order.tipo || "")
    .toString()
    .toUpperCase();
  const map = {
    MESA: "Mesa",
    DELIVERY: "Delivery",
    RECOJO: "Recojo",
    PRESENCIAL: "Presencial",
  };
  return map[tipo] || "Pedido";
}

function orderInfo(order) {
  const tipo = (order.tipo_entrega || order.tipo || "")
    .toString()
    .toUpperCase();

  if (tipo === "MESA") {
    if (order.numero_mesa) return `Mesa ${order.numero_mesa}`;
    if (order.mesa) return `Mesa ${order.mesa}`;
  }

  if (order.nombre_contacto) return `Contacto: ${order.nombre_contacto}`;
  if (order.comentario_general) return order.comentario_general;
  if (order.cliente_nombre) return order.cliente_nombre;
  if (order.cliente_telefono) return order.cliente_telefono;

  return "—";
}

function borderColorClass(tipo) {
  const map = {
    MESA: "border-yellow-200",
    DELIVERY: "border-green-200",
    RECOJO: "border-blue-200",
    PRESENCIAL: "border-purple-200",
  };
  return map[tipo] || "border-gray-200";
}

function bgColorClass(tipo) {
  const map = {
    MESA: "bg-yellow-50",
    DELIVERY: "bg-green-50",
    RECOJO: "bg-blue-50",
    PRESENCIAL: "bg-purple-50",
  };
  return map[tipo] || "bg-white";
}

async function loadOrders() {
  loading.value = true;
  error.value = "";
  try {
    await orderStore.fetchOrders();
  } catch (e) {
    error.value = e?.message || "Error cargando pedidos";
  } finally {
    loading.value = false;
  }
}

onMounted(loadOrders);

function editar(id) {
  orderEditId.value = id;
}
</script>
