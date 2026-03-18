<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Lista de productos -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="!order.id" class="text-center text-gray-500 py-12">
        Cargando pedido...
      </div>
      <div v-else>
        <div v-for="item in orderItems" :key="item.id" class="mb-3">
          <div
            :class="[
              'flex items-center rounded-lg p-3 shadow',
              itemBloqueado(item)
                ? 'bg-gray-200 text-gray-400'
                : 'bg-white text-gray-900',
            ]"
          >
            <span class="font-bold mr-2">{{ item.cantidad }}x</span>
            <span class="flex-1">{{ item.nombre }}</span>
            <span class="font-semibold mr-4"
              >S/ {{ item.precio.toFixed(2) }}</span
            >
            <!-- Acciones solo si no está bloqueado -->
            <template v-if="!itemBloqueado(item)">
              <button
                @click="addQty(item)"
                class="bg-green-500 text-white rounded px-2 mx-1"
              >
                +
              </button>
              <button
                @click="subQty(item)"
                class="bg-yellow-500 text-white rounded px-2 mx-1"
              >
                -
              </button>
              <button
                @click="removeItem(item)"
                class="bg-red-500 text-white rounded px-2 mx-1"
              >
                🗑️
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones globales sticky -->
    <div class="sticky bottom-0 bg-white border-t p-4 flex flex-col gap-2">
      <button
        class="bg-blue-600 text-white font-bold py-3 rounded-lg"
        @click="enviarCocina"
        :disabled="nuevosItems.length === 0"
      >
        Enviar a Cocina
      </button>
      <button
        class="bg-gray-700 text-white font-bold py-3 rounded-lg"
        @click="preCuenta"
      >
        🖨️ Pre-Cuenta
      </button>
      <button
        class="bg-green-600 text-white font-bold py-3 rounded-lg"
        @click="showCobro = true"
      >
        💰 Cobrar (Total: S/ {{ totalPedido.toFixed(2) }})
      </button>
    </div>

    <!-- Modal Pre-Cuenta -->
    <div
      v-if="showPreCuenta"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 class="text-xl font-bold mb-4">Pre-Cuenta</h2>
        <pre class="bg-gray-100 p-4 rounded text-xs">{{ preCuentaTicket }}</pre>
        <button
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
          @click="showPreCuenta = false"
        >
          Cerrar
        </button>
      </div>
    </div>

    <!-- Modal Cobro -->
    <PaymentModal
      v-if="showCobro"
      :pedidoId="order.id"
      :total="totalPedido"
      @close="showCobro = false"
      @success="showCobro = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useOrderStore } from "@/stores/order";
import PaymentModal from "@/components/PaymentModal.vue";

const props = defineProps({ orderId: Number });
const orderStore = useOrderStore();
const showPreCuenta = ref(false);
const preCuentaTicket = ref("");
const showCobro = ref(false);

const order = computed(() => orderStore.getOrderById(props.orderId) || {});
const orderItems = computed(() => order.value.items || []);

function itemBloqueado(item) {
  return ["PREPARANDO", "LISTO", "ENTREGADO"].includes(item.estado_cocina);
}

function addQty(item) {
  orderStore.addQty(item.id);
}
function subQty(item) {
  orderStore.subQty(item.id);
}
function removeItem(item) {
  orderStore.removeItem(item.id);
}

const nuevosItems = computed(() =>
  orderItems.value.filter((item) => !itemBloqueado(item) && item.nuevo),
);

async function enviarCocina() {
  await orderStore.enviarItemsCocina(order.value.id, nuevosItems.value);
}

async function preCuenta() {
  const res = await orderStore.getPreCuenta(order.value.id);
  preCuentaTicket.value = res.ticket;
  showPreCuenta.value = true;
}

const totalPedido = computed(() =>
  orderItems.value.reduce((acc, item) => acc + item.cantidad * item.precio, 0),
);

// Si el pedido no está cargado, intenta recargarlo (por ejemplo si abrimos modal directamente)
if (!order.value.id) {
  orderStore.fetchOrders();
}
</script>
