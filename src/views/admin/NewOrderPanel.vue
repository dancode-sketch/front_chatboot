<template>
  <div class="h-full flex">
    <!-- izquierdo: menú -->
    <div class="w-3/5 bg-gray-100 p-4 flex flex-col">
      <!-- tipo pedido -->
      <div class="mb-4 flex space-x-2">
        <button
          v-for="t in tipos"
          :key="t"
          @click="selectTipo(t)"
          :class="[
            'px-4 py-2 rounded-lg font-semibold',
            tipo === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-700',
          ]"
        >
          {{ t }}
        </button>
      </div>
      <div v-if="tipo === 'MESA'" class="mb-4">
        <input
          v-model="form.comentario_general"
          placeholder="Número de mesa"
          class="w-full border rounded px-3 py-2"
        />
      </div>
      <div v-if="tipo === 'DELIVERY'" class="mb-4 space-y-2">
        <input
          v-model="form.direccion"
          placeholder="Dirección"
          class="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          v-model.number="form.costo_delivery"
          placeholder="Costo delivery"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <!-- buscador -->
      <input
        v-model="search"
        placeholder="Buscar producto..."
        class="mb-4 w-full border rounded px-3 py-2"
      />
      <!-- grilla productos -->
      <div class="flex-1 overflow-y-auto grid grid-cols-2 gap-3">
        <div
          v-for="prod in filteredProducts"
          :key="prod.id"
          class="bg-white p-3 rounded shadow cursor-pointer hover:bg-blue-50"
          @click="addItem(prod)"
        >
          <div class="font-medium">{{ prod.nombre }}</div>
          <div class="text-sm text-gray-600">
            S/ {{ (Number(prod.precio) || 0).toFixed(2) }}
          </div>
        </div>
      </div>
    </div>

    <!-- derecho: carrito -->
    <div class="w-2/5 bg-white p-4 flex flex-col">
      <h2 class="text-lg font-bold mb-4">Comanda</h2>
      <div class="flex-1 overflow-y-auto space-y-2">
        <div
          v-for="(item, idx) in carrito"
          :key="idx"
          class="border rounded p-2 flex flex-col"
        >
          <div class="flex justify-between items-center">
            <div class="font-medium">{{ item.producto_nombre }}</div>
            <div class="flex items-center space-x-1">
              <button @click="decrement(idx)" class="px-1">-</button>
              <span>{{ item.cantidad }}</span>
              <button @click="increment(idx)" class="px-1">+</button>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            S/ {{ item.subtotal.toFixed(2) }}
          </div>
          <div>
            <button class="text-xs text-blue-600 mt-1" @click="toggleNote(idx)">
              Añadir nota
            </button>
            <div v-if="item.showNote" class="mt-1">
              <input
                v-model="item.comentario"
                placeholder="Comentario"
                class="w-full border rounded px-2 py-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <div class="flex justify-between text-sm">
          <span>Subtotal</span><span>S/ {{ subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="form.costo_delivery" class="flex justify-between text-sm">
          <span>Delivery</span
          ><span>S/ {{ form.costo_delivery.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold text-lg mt-2">
          <span>Total</span><span>S/ {{ total.toFixed(2) }}</span>
        </div>
      </div>
      <div class="mt-4">
        <select
          v-model="form.metodo_pago"
          class="w-full border rounded px-3 py-2 mb-2"
        >
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="yape">Yape</option>
          <option value="plin">Plin</option>
        </select>
        <button
          class="w-full bg-green-600 text-white py-2 rounded font-bold disabled:opacity-50"
          :disabled="!canSubmit || loading"
          @click="confirmar"
        >
          Confirmar Pedido (S/ {{ total.toFixed(2) }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { usePedidosStore } from "@/stores/pedidos";
import { useNotify } from "@/composables/useNotify";

const pedidosStore = usePedidosStore();
const notify = useNotify();
const loading = ref(false);

const tipos = ["DELIVERY", "RECOJO", "MESA", "PRESENCIAL"];
const tipo = ref("DELIVERY");
const search = ref("");

const products = ref([]);

// fetch products desde backend
import { apiHelpers } from "@/composables/useApi";
import { ENDPOINTS } from "@/utils/constants";

async function loadProducts() {
  const { data, error } = await apiHelpers.get(ENDPOINTS.PRODUCTS, {
    params: { activos: true },
  });
  if (error) {
    console.error("Error cargando productos:", error);
  } else if (data) {
    products.value = data.map((p) => ({
      ...p,
      precio: Number(p.precio) || 0,
    }));
  }
}

onMounted(() => {
  loadProducts();
});

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

const carrito = ref([]);

const filteredProducts = computed(() => {
  return products.value.filter((p) =>
    p.nombre.toLowerCase().includes(search.value.toLowerCase()),
  );
});

const subtotal = computed(() =>
  carrito.value.reduce((acc, i) => acc + i.subtotal, 0),
);
const total = computed(() => subtotal.value + (form.value.costo_delivery || 0));

const canSubmit = computed(() => {
  if (carrito.value.length === 0) return false;
  if (tipo.value === "MESA" && !form.value.comentario_general.trim())
    return false;
  return true;
});

function selectTipo(t) {
  tipo.value = t;
  form.value.tipo_entrega = t;
  // limpiar campos específicos
  if (t !== "DELIVERY")
    ((form.value.direccion = null), (form.value.costo_delivery = 0));
}

function addItem(prod) {
  const existing = carrito.value.find((i) => i.producto_id === prod.id);
  if (existing) {
    increment(carrito.value.indexOf(existing));
  } else {
    carrito.value.push({
      producto_id: prod.id,
      producto_nombre: prod.nombre,
      cantidad: 1,
      precio_unitario: prod.precio,
      subtotal: prod.precio,
      comentario: "",
      showNote: false,
    });
  }
}

function increment(idx) {
  const i = carrito.value[idx];
  i.cantidad++;
  i.subtotal = i.cantidad * i.precio_unitario;
}
function decrement(idx) {
  const i = carrito.value[idx];
  if (i.cantidad > 1) {
    i.cantidad--;
    i.subtotal = i.cantidad * i.precio_unitario;
  } else {
    carrito.value.splice(idx, 1);
  }
}
function toggleNote(idx) {
  carrito.value[idx].showNote = !carrito.value[idx].showNote;
}

async function confirmar() {
  if (!canSubmit.value) return;
  loading.value = true;
  form.value.detalles = carrito.value.map((i) => ({
    producto_id: i.producto_id,
    producto_nombre: i.producto_nombre,
    cantidad: i.cantidad,
    precio_unitario: i.precio_unitario,
    subtotal: i.subtotal,
    comentario: i.comentario,
  }));
  form.value.total = total.value;
  const { success, error } = await pedidosStore.createPedido({ ...form.value });
  loading.value = false;
  if (success) {
    notify.success("Pedido creado correctamente");
    // reset
    carrito.value = [];
    form.value.comentario_general = "";
    form.value.total = 0;
  } else {
    notify.error(error || "Error al crear pedido");
  }
}
</script>

<style scoped>
/* optionally add specific styles */
</style>
